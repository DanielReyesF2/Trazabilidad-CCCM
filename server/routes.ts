import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import fs from "fs";
import { insertDocumentSchema, insertWasteDataSchema, insertAlertSchema } from "@shared/schema";
import { z } from "zod";
import { processPDFDocument } from './pdf-processor';
import { processCSVDocument, isValidCSV, cleanupFile } from './csv-processor';

// Simple type for error handling
type ProcessingError = {
  message: string;
}

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      const uploadsDir = path.join(process.cwd(), "uploads");
      // Ensure directory exists
      if (!fs.existsSync(uploadsDir)){
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
      // Create unique filename
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + "-" + file.originalname);
    }
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: function(req, file, cb) {
    // Accept PDF and CSV files
    const allowedMimeTypes = [
      'application/pdf',
      'text/csv',
      'application/csv',
      'text/plain' // Sometimes CSV files are detected as plain text
    ];
    
    if (!allowedMimeTypes.includes(file.mimetype) && !file.originalname.toLowerCase().endsWith('.csv')) {
      return cb(new Error('Only PDF and CSV files are allowed'));
    }
    cb(null, true);
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all clients
  app.get("/api/clients", async (req: Request, res: Response) => {
    try {
      const clients = await storage.getClients();
      res.json(clients);
    } catch (error) {
      console.error("Error fetching clients:", error);
      res.status(500).json({ message: "Failed to fetch clients" });
    }
  });

  // Get a specific client
  app.get("/api/clients/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const client = await storage.getClient(id);
      
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      res.json(client);
    } catch (error) {
      console.error("Error fetching client:", error);
      res.status(500).json({ message: "Failed to fetch client" });
    }
  });

  // Upload a document
  app.post('/api/documents/upload', upload.single('file'), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      // Validate request body
      const clientId = req.body.clientId ? parseInt(req.body.clientId) : undefined;
      
      if (!clientId) {
        return res.status(400).json({ message: "Client ID is required" });
      }
      
      // Check if client exists
      const client = await storage.getClient(clientId);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      // Create document record
      const document = await storage.createDocument({
        fileName: req.file.originalname,
        fileSize: req.file.size,
        clientId
      });
      
      // Start document processing
      try {
        let wasteData;
        
        // Determinar el tipo de archivo y usar el procesador apropiado
        if (isValidCSV(req.file.path)) {
          console.log('Processing CSV file:', req.file.originalname);
          wasteData = await processCSVDocument(req.file.path, clientId, document.id);
        } else {
          console.log('Processing PDF file:', req.file.originalname);
          wasteData = await processPDFDocument(req.file.path, clientId, document.id);
        }
        
        if (!wasteData || (Array.isArray(wasteData) && wasteData.length === 0)) {
          throw new Error("No se pudieron extraer datos del documento");
        }
        
        // Mark document as processed
        await storage.updateDocument(document.id, { processed: true });
        
        // Cleanup the uploaded file
        cleanupFile(req.file.path);
        
        res.status(201).json({ 
          document, 
          wasteData,
          recordsProcessed: Array.isArray(wasteData) ? wasteData.length : 1,
          message: "Documento subido y procesado exitosamente" 
        });
        
      } catch (error) {
        // Convert unknown error to typed error
        const processingError = error as ProcessingError;
        
        // Create an alert for processing error
        await storage.createAlert({
          clientId,
          type: "error",
          message: `Error processing document ${req.file.originalname}: ${processingError.message}`,
          documentId: document.id
        });
        
        // Update document with error info
        await storage.updateDocument(document.id, { 
          processed: true, 
          processingError: processingError.message 
        });
        
        res.status(201).json({ 
          document,
          message: "Document uploaded but processing failed",
          error: processingError.message
        });
      }
    } catch (error) {
      console.error("Error uploading document:", error);
      res.status(500).json({ message: "Failed to upload document" });
    }
  });

  // Get all documents
  app.get("/api/documents", async (req: Request, res: Response) => {
    try {
      const clientId = req.query.clientId ? parseInt(req.query.clientId as string) : undefined;
      
      let documents;
      if (clientId) {
        documents = await storage.getDocumentsByClient(clientId);
      } else {
        documents = await storage.getDocuments();
      }
      
      res.json(documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  // Get waste data with filters
  app.get("/api/waste-data", async (req: Request, res: Response) => {
    try {
      const filters: { clientId?: number, fromDate?: Date, toDate?: Date } = {};
      
      if (req.query.clientId) {
        filters.clientId = parseInt(req.query.clientId as string);
      }
      
      if (req.query.fromDate) {
        filters.fromDate = new Date(req.query.fromDate as string);
      }
      
      if (req.query.toDate) {
        filters.toDate = new Date(req.query.toDate as string);
      }
      
      const wasteData = await storage.getWasteData(filters);
      res.json(wasteData);
    } catch (error) {
      console.error("Error fetching waste data:", error);
      res.status(500).json({ message: "Failed to fetch waste data" });
    }
  });

  // Get alerts
  app.get("/api/alerts", async (req: Request, res: Response) => {
    try {
      const clientId = req.query.clientId ? parseInt(req.query.clientId as string) : undefined;
      const alerts = await storage.getAlerts(clientId);
      res.json(alerts);
    } catch (error) {
      console.error("Error fetching alerts:", error);
      res.status(500).json({ message: "Failed to fetch alerts" });
    }
  });

  // Update alert status (resolve/unresolve)
  app.patch("/api/alerts/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { resolved } = req.body;
      
      if (typeof resolved !== 'boolean') {
        return res.status(400).json({ message: "Resolved status must be a boolean" });
      }
      
      const alert = await storage.updateAlert(id, { resolved });
      
      if (!alert) {
        return res.status(404).json({ message: "Alert not found" });
      }
      
      res.json(alert);
    } catch (error) {
      console.error("Error updating alert:", error);
      res.status(500).json({ message: "Failed to update alert" });
    }
  });
  
  // Add a new waste data entry manually (for client operators)
  app.post("/api/waste-data/manual", async (req: Request, res: Response) => {
    try {
      // Validate request body
      const validatedData = insertWasteDataSchema.parse({
        ...req.body,
        date: new Date(req.body.date)
      });
      
      // Calculate total waste
      const totalWaste = 
        (validatedData.organicWaste || 0) + 
        (validatedData.inorganicWaste || 0) + 
        (validatedData.recyclableWaste || 0);
      
      // Calculate deviation correctly using the formula: (recyclable + organic) / total * 100
      const recyclableTotal = 
        (validatedData.recyclableWaste || 0) + 
        (validatedData.organicWaste || 0);
      
      const deviation = totalWaste > 0 
        ? (recyclableTotal / totalWaste) * 100 
        : 0;
      
      // Create waste data record (without document association for manual entries)
      const newWasteData = await storage.createWasteData({
        ...validatedData,
        documentId: null, // No document for manual entries
        totalWaste,
        deviation: parseFloat(deviation.toFixed(2))
      });
      
      res.status(201).json(newWasteData);
    } catch (error) {
      console.error("Error creating waste data:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid data format", 
          errors: error.format() 
        });
      }
      res.status(500).json({ message: "Failed to create waste data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
