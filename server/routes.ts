import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import fs from "fs";
import { 
  insertDocumentSchema, insertWasteDataSchema, insertAlertSchema,
  insertRecyclingEntrySchema, insertCompostEntrySchema, insertReuseEntrySchema, insertLandfillEntrySchema,
  insertDailyWasteEntrySchema, DailyWasteEntry,
  RECYCLING_MATERIALS, COMPOST_CATEGORIES, REUSE_CATEGORIES, LANDFILL_WASTE_TYPES
} from "@shared/schema";
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

  // Detailed waste tracking routes (Excel replication)
  
  // Get waste data for a specific year (structured like Excel)
  app.get("/api/waste-excel/:year", async (req: Request, res: Response) => {
    try {
      const year = parseInt(req.params.year);
      
      // Get or create months for the year
      const months = await storage.getMonths(year);
      const monthsData = [];
      
      for (let month = 1; month <= 12; month++) {
        let monthRecord = months.find(m => m.month === month);
        
        if (!monthRecord) {
          const monthNames = [
            'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
            'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
          ];
          
          monthRecord = await storage.createMonth({
            year,
            month,
            label: `${monthNames[month - 1]} ${year}`
          });
        }
        
        // Get entries for this month
        const recycling = await storage.getRecyclingEntries(monthRecord.id);
        const compost = await storage.getCompostEntries(monthRecord.id);
        const reuse = await storage.getReuseEntries(monthRecord.id);
        const landfill = await storage.getLandfillEntries(monthRecord.id);
        
        monthsData.push({
          month: monthRecord,
          recycling,
          compost,
          reuse,
          landfill
        });
      }
      
      res.json({
        year,
        months: monthsData,
        materials: {
          recycling: RECYCLING_MATERIALS,
          compost: COMPOST_CATEGORIES,
          reuse: REUSE_CATEGORIES,
          landfill: LANDFILL_WASTE_TYPES
        }
      });
    } catch (error) {
      console.error("Error fetching waste excel data:", error);
      res.status(500).json({ message: "Failed to fetch waste excel data" });
    }
  });
  
  // Update waste entry
  app.post("/api/waste-excel/update", async (req: Request, res: Response) => {
    try {
      const { monthId, category, material, kg, type } = req.body;
      
      let result;
      
      switch (type) {
        case 'recycling':
          result = await storage.upsertRecyclingEntry({
            monthId,
            material,
            kg: parseFloat(kg) || 0
          });
          break;
        case 'compost':
          result = await storage.upsertCompostEntry({
            monthId,
            category: material, // material serves as category for compost
            kg: parseFloat(kg) || 0
          });
          break;
        case 'reuse':
          result = await storage.upsertReuseEntry({
            monthId,
            category: material,
            kg: parseFloat(kg) || 0
          });
          break;
        case 'landfill':
          result = await storage.upsertLandfillEntry({
            monthId,
            wasteType: material,
            kg: parseFloat(kg) || 0
          });
          break;
        default:
          return res.status(400).json({ message: "Invalid entry type" });
      }
      
      res.json({ success: true, data: result });
    } catch (error) {
      console.error("Error updating waste entry:", error);
      res.status(500).json({ message: "Failed to update waste entry" });
    }
  });
  
  // Batch update all data for a year
  app.post("/api/waste-excel/batch-update", async (req: Request, res: Response) => {
    try {
      const { editedData, year } = req.body;
      
      // Get year months to map month indices to month IDs
      const months = await storage.getMonths(year);
      
      // Process each edited entry
      for (const [editKey, value] of Object.entries(editedData)) {
        const [section, material, monthIndexStr] = editKey.split('-');
        const monthIndex = parseInt(monthIndexStr);
        const kg = parseFloat(value as string) || 0;
        
        // Find the month record
        const monthRecord = months.find(m => m.month === monthIndex + 1);
        if (!monthRecord) continue;
        
        // Update based on section type
        switch (section) {
          case 'recycling':
            await storage.upsertRecyclingEntry({
              monthId: monthRecord.id,
              material,
              kg
            });
            break;
          case 'compost':
            await storage.upsertCompostEntry({
              monthId: monthRecord.id,
              category: material,
              kg
            });
            break;
          case 'reuse':
            await storage.upsertReuseEntry({
              monthId: monthRecord.id,
              category: material,
              kg
            });
            break;
          case 'landfill':
            await storage.upsertLandfillEntry({
              monthId: monthRecord.id,
              wasteType: material,
              kg
            });
            break;
        }
      }
      
      res.json({ success: true, message: "Batch update completed" });
    } catch (error) {
      console.error("Error in batch update:", error);
      res.status(500).json({ message: "Failed to perform batch update" });
    }
  });

  // Data Export API endpoints
  
  // Export waste data in CSV format
  app.get("/api/export/waste-data", async (req: Request, res: Response) => {
    try {
      const filters: { clientId?: number, fromDate?: Date, toDate?: Date } = {};
      const format = req.query.format as string || 'json';
      const wasteTypes = {
        organic: req.query.organic === 'true',
        inorganic: req.query.inorganic === 'true',
        recyclable: req.query.recyclable === 'true'
      };
      
      if (req.query.clientId && req.query.clientId !== 'all') {
        filters.clientId = parseInt(req.query.clientId as string);
      }
      
      if (req.query.fromDate) {
        filters.fromDate = new Date(req.query.fromDate as string);
      }
      
      if (req.query.toDate) {
        filters.toDate = new Date(req.query.toDate as string);
      }
      
      // Get waste data with filters
      const wasteData = await storage.getWasteData(filters);
      
      // Get all clients for reference
      const clients = await storage.getClients();
      
      if (format === 'csv') {
        // Generate CSV
        const csvData = wasteData.map(record => {
          const client = clients.find(c => c.id === record.clientId);
          const csvRecord: any = {
            'Fecha': new Date(record.date).toLocaleDateString('es-ES'),
            'Cliente': client?.name || 'N/A',
          };
          
          if (wasteTypes.organic) csvRecord['Residuos Orgánicos (kg)'] = record.organicWaste || 0;
          if (wasteTypes.inorganic) csvRecord['Residuos Inorgánicos (kg)'] = record.inorganicWaste || 0;
          if (wasteTypes.recyclable) csvRecord['Residuos Reciclables (kg)'] = record.recyclableWaste || 0;
          
          csvRecord['Total Residuos (kg)'] = record.totalWaste || 0;
          csvRecord['Desviación de Relleno Sanitario (%)'] = record.deviation || 0;
          csvRecord['Ubicación'] = record.location || 'N/A';
          csvRecord['Observaciones'] = record.observations || '';
          
          return csvRecord;
        });
        
        // Convert to CSV string
        if (csvData.length === 0) {
          return res.status(200).send('No hay datos para exportar');
        }
        
        const headers = Object.keys(csvData[0]);
        const csvContent = [
          headers.join(','),
          ...csvData.map(row => 
            headers.map(header => {
              const value = row[header];
              if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                return `"${value.replace(/"/g, '""')}"`;
              }
              return value || '';
            }).join(',')
          )
        ].join('\n');
        
        // Set headers for file download
        const filename = `datos_residuos_${new Date().toISOString().split('T')[0]}.csv`;
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Cache-Control', 'no-cache');
        
        // Send CSV with BOM for proper UTF-8 encoding
        res.send('\uFEFF' + csvContent);
        
      } else {
        // Return JSON for client-side processing
        res.json({
          data: wasteData,
          clients: clients,
          count: wasteData.length
        });
      }
      
    } catch (error) {
      console.error("Error exporting waste data:", error);
      res.status(500).json({ message: "Failed to export waste data" });
    }
  });

  // Rutas para registro diario - MVP para demostrar tiempo real
  
  // POST /api/daily-waste - Guardar registro diario en tabla daily_waste_entries
  app.post('/api/daily-waste', async (req: Request, res: Response) => {
    try {
      const { type, material, kg, location, notes, date } = req.body;
      const clientId = 4; // Club Campestre

      if (!type || !material || !kg || !location) {
        return res.status(400).json({ message: "Faltan campos requeridos" });
      }

      // Crear entrada diaria en la nueva tabla
      const entry = await storage.createDailyWasteEntry({
        clientId,
        date: date ? new Date(date) : new Date(),
        type,
        material,
        kg: parseFloat(kg),
        location,
        notes
      });

      res.status(201).json({
        message: "Registro guardado exitosamente",
        entry
      });

    } catch (error) {
      console.error("Error saving daily waste entry:", error);
      res.status(500).json({ message: "Error al guardar registro" });
    }
  });

  // GET /api/daily-totals/:date - Obtener totales del día desde registros diarios reales
  app.get('/api/daily-totals/:date', async (req: Request, res: Response) => {
    try {
      const { date } = req.params;
      const targetDate = new Date(date);
      
      // Obtener registros diarios reales para esta fecha específica
      const dailyEntries = await storage.getDailyWasteEntriesByDate(targetDate);
      
      const totals = {
        recycling: 0,
        compost: 0,
        reuse: 0,
        landfill: 0
      };

      // Sumar por tipo
      dailyEntries.forEach(entry => {
        if (entry.type === 'recycling') totals.recycling += entry.kg;
        else if (entry.type === 'compost') totals.compost += entry.kg;
        else if (entry.type === 'reuse') totals.reuse += entry.kg;
        else if (entry.type === 'landfill') totals.landfill += entry.kg;
      });

      res.json(totals);

    } catch (error) {
      console.error("Error fetching daily totals:", error);
      res.status(500).json({ message: "Error al obtener totales del día" });
    }
  });

  // GET /api/monthly-summary/:year/:month - Obtener resumen mensual
  app.get('/api/monthly-summary/:year/:month', async (req: Request, res: Response) => {
    try {
      const year = parseInt(req.params.year);
      const month = parseInt(req.params.month);
      const clientId = 4; // Club Campestre

      // Buscar o crear resumen mensual
      let summary = await storage.getMonthlySummary(clientId, year, month);
      
      if (!summary) {
        // Crear nuevo resumen mensual
        summary = await storage.createMonthlySummary(clientId, year, month);
      }

      // Obtener registros diarios del mes para actualizar totales
      const monthlyEntries = await storage.getDailyWasteEntriesByMonth(clientId, year, month);
      
      // Calcular totales actuales
      const totals = {
        recycling: 0,
        compost: 0,
        reuse: 0,
        landfill: 0
      };

      const breakdowns = {
        recycling: {} as Record<string, number>,
        compost: {} as Record<string, number>,
        reuse: {} as Record<string, number>,
        landfill: {} as Record<string, number>
      };

      monthlyEntries.forEach(entry => {
        totals[entry.type as keyof typeof totals] += entry.kg;
        
        if (!breakdowns[entry.type as keyof typeof breakdowns][entry.material]) {
          breakdowns[entry.type as keyof typeof breakdowns][entry.material] = 0;
        }
        breakdowns[entry.type as keyof typeof breakdowns][entry.material] += entry.kg;
      });

      const totalWaste = totals.recycling + totals.compost + totals.reuse + totals.landfill;

      // Actualizar resumen con datos actuales
      const updatedSummary = await storage.updateMonthlySummary(summary.id, {
        totalRecycling: totals.recycling,
        totalCompost: totals.compost,
        totalReuse: totals.reuse,
        totalLandfill: totals.landfill,
        totalWaste: totalWaste,
        recyclingBreakdown: breakdowns.recycling,
        compostBreakdown: breakdowns.compost,
        reuseBreakdown: breakdowns.reuse,
        landfillBreakdown: breakdowns.landfill,
        dailyEntriesCount: monthlyEntries.length
      });

      res.json({
        summary: updatedSummary,
        dailyEntries: monthlyEntries,
        canClose: updatedSummary.status === 'open' && monthlyEntries.length > 0
      });

    } catch (error) {
      console.error("Error fetching monthly summary:", error);
      res.status(500).json({ message: "Error al obtener resumen mensual" });
    }
  });

  // POST /api/monthly-summary/:year/:month/close - Cerrar mes
  app.post('/api/monthly-summary/:year/:month/close', async (req: Request, res: Response) => {
    try {
      const year = parseInt(req.params.year);
      const month = parseInt(req.params.month);
      const clientId = 4; // Club Campestre
      const { closedBy } = req.body;

      const summary = await storage.getMonthlySummary(clientId, year, month);
      
      if (!summary) {
        return res.status(404).json({ message: "Resumen mensual no encontrado" });
      }

      if (summary.status !== 'open') {
        return res.status(400).json({ message: "El mes ya está cerrado" });
      }

      // Cerrar el mes
      const closedSummary = await storage.closeMonthlySummary(summary.id, closedBy || 'Sistema');

      res.json({
        message: "Mes cerrado correctamente",
        summary: closedSummary
      });

    } catch (error) {
      console.error("Error closing month:", error);
      res.status(500).json({ message: "Error al cerrar el mes" });
    }
  });

  // POST /api/monthly-summary/:year/:month/transfer - Transferir a trazabilidad oficial
  app.post('/api/monthly-summary/:year/:month/transfer', async (req: Request, res: Response) => {
    try {
      const year = parseInt(req.params.year);
      const month = parseInt(req.params.month);
      const clientId = 4; // Club Campestre

      const summary = await storage.getMonthlySummary(clientId, year, month);
      
      if (!summary) {
        return res.status(404).json({ message: "Resumen mensual no encontrado" });
      }

      if (summary.status !== 'closed') {
        return res.status(400).json({ message: "El mes debe estar cerrado antes de transferir" });
      }

      if (summary.transferredToOfficial) {
        return res.status(400).json({ message: "Los datos ya fueron transferidos" });
      }

      // Crear o actualizar registro en monthly_deviation_data
      await storage.transferToOfficialData(summary);

      // Marcar como transferido
      const transferredSummary = await storage.markAsTransferred(summary.id);

      res.json({
        message: "Datos transferidos a trazabilidad oficial",
        summary: transferredSummary
      });

    } catch (error) {
      console.error("Error transferring to official data:", error);
      res.status(500).json({ message: "Error al transferir datos" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
