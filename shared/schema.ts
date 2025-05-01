import { pgTable, text, serial, integer, boolean, timestamp, json, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define the client schema
export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
});

export const insertClientSchema = createInsertSchema(clients).pick({
  name: true,
  description: true,
});

// Define the document/file schema
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size").notNull(),
  uploadDate: timestamp("upload_date").notNull().defaultNow(),
  clientId: integer("client_id").references(() => clients.id),
  processed: boolean("processed").default(false),
  processingError: text("processing_error"),
});

export const insertDocumentSchema = createInsertSchema(documents).pick({
  fileName: true,
  fileSize: true,
  clientId: true,
  processed: true,
});

// Waste data schema - for processed data from PDFs
export const wasteData = pgTable("waste_data", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id").references(() => documents.id),
  clientId: integer("client_id").references(() => clients.id),
  date: timestamp("date").notNull(),
  organicWaste: real("organic_waste"), // in kg - Residuos orgánicos de comedor
  podaWaste: real("poda_waste"), // in kg - Residuos orgánicos de PODA
  inorganicWaste: real("inorganic_waste"), // in kg
  recyclableWaste: real("recyclable_waste"), // in kg
  totalWaste: real("total_waste"), // in kg
  deviation: real("deviation"), // percentage deviation
  
  // Desglose de reciclables
  cardboard: real("cardboard"), // Cartón
  paper: real("paper"), // Papel
  newspaper: real("newspaper"), // Periódico
  plasticPET: real("plastic_pet"), // Plástico PET
  plasticOther: real("plastic_other"), // Otros plásticos
  metalAluminum: real("metal_aluminum"), // Aluminio
  glass: real("glass"), // Vidrio
  hasDetailedRecyclables: boolean("has_detailed_recyclables").default(false),
  
  // Impacto ambiental
  treesSaved: real("trees_saved"), // árboles salvados
  waterSaved: real("water_saved"), // litros de agua ahorrados
  energySaved: real("energy_saved"), // kW de energía eléctrica ahorrada
  fuelSaved: real("fuel_saved"), // litros de combustible ahorrados
  wasteDiverted: real("waste_diverted"), // m³ de basura evitados
  redMudAvoided: real("red_mud_avoided"), // kg de fango rojo evitado
  notes: text("notes"),
  rawData: json("raw_data").$type<Record<string, any>>(), // Store raw extracted data
});

export const insertWasteDataSchema = createInsertSchema(wasteData).pick({
  documentId: true,
  clientId: true,
  date: true,
  organicWaste: true,
  podaWaste: true,
  inorganicWaste: true,
  recyclableWaste: true,
  totalWaste: true,
  deviation: true,
  // Desglose de reciclables
  cardboard: true,
  paper: true,
  newspaper: true,
  plasticPET: true,
  plasticOther: true,
  metalAluminum: true,
  glass: true,
  hasDetailedRecyclables: true,
  // Campos de impacto ambiental
  treesSaved: true,
  waterSaved: true,
  energySaved: true,
  fuelSaved: true,
  wasteDiverted: true,
  redMudAvoided: true,
  notes: true,
  rawData: true,
});

// Alerts schema
export const alerts = pgTable("alerts", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").references(() => clients.id),
  type: text("type").notNull(), // error, warning, info, success
  message: text("message").notNull(),
  date: timestamp("date").notNull().defaultNow(),
  resolved: boolean("resolved").default(false),
  documentId: integer("document_id").references(() => documents.id),
});

export const insertAlertSchema = createInsertSchema(alerts).pick({
  clientId: true,
  type: true,
  message: true,
  documentId: true,
});

// Export types
export type Client = typeof clients.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;

export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;

export type WasteData = typeof wasteData.$inferSelect;
export type InsertWasteData = z.infer<typeof insertWasteDataSchema>;

export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = z.infer<typeof insertAlertSchema>;
