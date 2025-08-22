import { pgTable, text, serial, integer, boolean, timestamp, json, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define the client schema with enhanced multi-tenant features
export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  // Multi-tenant enhancements
  slug: text("slug").unique().notNull(), // URL-friendly identifier: "cccm", "club-bosques", etc.
  logo: text("logo"), // Logo URL for branding
  primaryColor: text("primary_color").default("#273949"), // Brand colors
  secondaryColor: text("secondary_color").default("#b5e951"),
  subdomain: text("subdomain").unique(), // Optional: cccm.econova.com
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  address: text("address"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
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

// Tabla de datos de desviación mensual como requiere la certificadora
export const monthlyDeviationData = pgTable("monthly_deviation_data", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").references(() => clients.id),
  year: integer("year").notNull(),
  month: integer("month").notNull(), // 1-12
  
  // Materiales Reciclables (en kg)
  mixedFile: real("mixed_file").default(0),
  officePaper: real("office_paper").default(0),
  magazine: real("magazine").default(0),
  newspaper: real("newspaper").default(0),
  cardboard: real("cardboard").default(0),
  petPlastic: real("pet_plastic").default(0),
  hdpeBlown: real("hdpe_blown").default(0),
  hdpeRigid: real("hdpe_rigid").default(0),
  tinCan: real("tin_can").default(0),
  aluminum: real("aluminum").default(0),
  glass: real("glass").default(0),
  totalRecyclables: real("total_recyclables").default(0),
  
  // Orgánicos destinados a composta (en kg)
  organicsCompost: real("organics_compost").default(18000), // Default 18000 como muestra la tabla
  totalOrganics: real("total_organics").default(18000),
  
  // Reuso (en kg)
  glassDonation: real("glass_donation").default(0),
  
  // Totales calculados
  totalDiverted: real("total_diverted").default(0), // Total desviado del relleno sanitario
  totalGenerated: real("total_generated").default(0), // Total generado
  deviationPercentage: real("deviation_percentage").default(0), // Porcentaje de desviación
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertMonthlyDeviationDataSchema = createInsertSchema(monthlyDeviationData).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  totalRecyclables: true,
  totalOrganics: true,
  totalDiverted: true,
  deviationPercentage: true,
});

// Legacy waste data schema - keeping for existing data
export const wasteData = pgTable("waste_data", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id").references(() => documents.id),
  clientId: integer("client_id").references(() => clients.id),
  date: timestamp("date").notNull(),
  organicWaste: real("organic_waste"),
  inorganicWaste: real("inorganic_waste"),
  recyclableWaste: real("recyclable_waste"),
  totalWaste: real("total_waste"),
  deviation: real("deviation"),
  rawData: json("raw_data").$type<Record<string, any>>(),
});

export const insertWasteDataSchema = createInsertSchema(wasteData).pick({
  documentId: true,
  clientId: true,
  date: true,
  organicWaste: true,
  inorganicWaste: true,
  recyclableWaste: true,
  totalWaste: true,
  deviation: true,
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

export type MonthlyDeviationData = typeof monthlyDeviationData.$inferSelect;
export type InsertMonthlyDeviationData = z.infer<typeof insertMonthlyDeviationDataSchema>;

export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = z.infer<typeof insertAlertSchema>;

// New detailed waste tracking schema for Excel replication

// Months table for organizing data by year/month
export const months = pgTable("months", {
  id: serial("id").primaryKey(),
  year: integer("year").notNull(),
  month: integer("month").notNull(), // 1-12
  label: text("label").notNull(), // e.g., "Ene 2025"
});

// Recycling entries with specific materials
export const recyclingEntries = pgTable("recycling_entries", {
  id: serial("id").primaryKey(),
  monthId: integer("month_id").references(() => months.id).notNull(),
  material: text("material").notNull(), // Papel Mixto, Papel de oficina, etc.
  kg: real("kg").default(0).notNull(),
});

// Compost entries (organics)
export const compostEntries = pgTable("compost_entries", {
  id: serial("id").primaryKey(),
  monthId: integer("month_id").references(() => months.id).notNull(),
  category: text("category").notNull(), // Poda San Sebastián, Jardinería
  kg: real("kg").default(0).notNull(),
});

// Reuse entries
export const reuseEntries = pgTable("reuse_entries", {
  id: serial("id").primaryKey(),
  monthId: integer("month_id").references(() => months.id).notNull(),
  category: text("category").notNull(), // Vidrio donación
  kg: real("kg").default(0).notNull(),
});

// Landfill entries (no desvío)
export const landfillEntries = pgTable("landfill_entries", {
  id: serial("id").primaryKey(),
  monthId: integer("month_id").references(() => months.id).notNull(),
  wasteType: text("waste_type").notNull(), // Orgánico, Inorgánico
  kg: real("kg").default(0).notNull(),
});

// Insert schemas
export const insertMonthSchema = createInsertSchema(months).omit({ id: true });
export const insertRecyclingEntrySchema = createInsertSchema(recyclingEntries).omit({ id: true });
export const insertCompostEntrySchema = createInsertSchema(compostEntries).omit({ id: true });
export const insertReuseEntrySchema = createInsertSchema(reuseEntries).omit({ id: true });
export const insertLandfillEntrySchema = createInsertSchema(landfillEntries).omit({ id: true });

// Types
export type Month = typeof months.$inferSelect;
export type InsertMonth = z.infer<typeof insertMonthSchema>;

export type RecyclingEntry = typeof recyclingEntries.$inferSelect;
export type InsertRecyclingEntry = z.infer<typeof insertRecyclingEntrySchema>;

export type CompostEntry = typeof compostEntries.$inferSelect;
export type InsertCompostEntry = z.infer<typeof insertCompostEntrySchema>;

export type ReuseEntry = typeof reuseEntries.$inferSelect;
export type InsertReuseEntry = z.infer<typeof insertReuseEntrySchema>;

export type LandfillEntry = typeof landfillEntries.$inferSelect;
export type InsertLandfillEntry = z.infer<typeof insertLandfillEntrySchema>;

// Constants for materials and categories
export const RECYCLING_MATERIALS = [
  "Papel Mixto",
  "Papel de oficina", 
  "Revistas",
  "Periódico",
  "Cartón",
  "PET",
  "Plástico Duro",
  "HDPE",
  "Tin Can",
  "Aluminio",
  "Vidrio",
  "Fierro",
  "Residuo electrónico"
] as const;

export const COMPOST_CATEGORIES = [
  "Poda San Sebastián",
  "Jardinería"
] as const;

export const REUSE_CATEGORIES = [
  "Vidrio donación",
  "Comida a donacion"
] as const;

export const LANDFILL_WASTE_TYPES = [
  "Orgánico",
  "Inorgánico"
] as const;

export type RecyclingMaterial = typeof RECYCLING_MATERIALS[number];
export type CompostCategory = typeof COMPOST_CATEGORIES[number];
export type ReuseCategory = typeof REUSE_CATEGORIES[number];
export type LandfillWasteType = typeof LANDFILL_WASTE_TYPES[number];

// Multi-tenant tables
export const clientSettings = pgTable("client_settings", {
  clientId: integer("client_id").references(() => clients.id).notNull(),
  key: text("key").notNull(),
  value: json("value").$type<any>().notNull(),
}, (table) => ({
  pk: { columns: [table.clientId, table.key] }
}));

export const clientFeatureFlags = pgTable("client_feature_flags", {
  clientId: integer("client_id").references(() => clients.id).notNull(),
  feature: text("feature").notNull(),
  enabled: boolean("enabled").notNull().default(false),
}, (table) => ({
  pk: { columns: [table.clientId, table.feature] }
}));

export const insertClientSettingSchema = createInsertSchema(clientSettings);
export const insertClientFeatureFlagSchema = createInsertSchema(clientFeatureFlags);

export type ClientSetting = typeof clientSettings.$inferSelect;
export type InsertClientSetting = z.infer<typeof insertClientSettingSchema>;

export type ClientFeatureFlag = typeof clientFeatureFlags.$inferSelect;
export type InsertClientFeatureFlag = z.infer<typeof insertClientFeatureFlagSchema>;

// Available features for feature flags
export const AVAILABLE_FEATURES = [
  "module.waste",
  "module.energy", 
  "module.water",
  "module.circular_economy",
  "module.zero_waste_events",
  "module.procurement",
  "advanced_reporting",
  "export_data",
  "api_access"
] as const;

export type FeatureName = typeof AVAILABLE_FEATURES[number];

// Daily waste entries for security team registration
export const dailyWasteEntries = pgTable("daily_waste_entries", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").references(() => clients.id).notNull(),
  date: timestamp("date").notNull(),
  type: text("type").notNull(), // 'recycling', 'compost', 'reuse', 'landfill'
  material: text("material").notNull(), // Specific material from the type category
  kg: real("kg").notNull(),
  location: text("location").notNull(), // Area of the club where it was generated
  notes: text("notes"), // Optional notes
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Monthly summaries - bridge between daily entries and official monthly data
export const monthlySummaries = pgTable("monthly_summaries", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").references(() => clients.id).notNull(),
  year: integer("year").notNull(),
  month: integer("month").notNull(), // 1-12
  
  // Status control
  status: text("status").notNull().default("open"), // 'open', 'closed', 'transferred'
  closedAt: timestamp("closed_at"),
  closedBy: text("closed_by"), // User who closed the month
  
  // Aggregated totals from daily entries (calculated automatically)
  totalRecycling: real("total_recycling").default(0),
  totalCompost: real("total_compost").default(0),
  totalReuse: real("total_reuse").default(0),
  totalLandfill: real("total_landfill").default(0),
  totalWaste: real("total_waste").default(0),
  
  // Material breakdown (JSON for flexibility)
  recyclingBreakdown: json("recycling_breakdown").$type<Record<string, number>>(),
  compostBreakdown: json("compost_breakdown").$type<Record<string, number>>(),
  reuseBreakdown: json("reuse_breakdown").$type<Record<string, number>>(),
  landfillBreakdown: json("landfill_breakdown").$type<Record<string, number>>(),
  
  // Audit trail
  dailyEntriesCount: integer("daily_entries_count").default(0),
  transferredToOfficial: boolean("transferred_to_official").default(false),
  transferredAt: timestamp("transferred_at"),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Insert schemas
export const insertDailyWasteEntrySchema = createInsertSchema(dailyWasteEntries).omit({
  id: true,
  createdAt: true,
});

export const insertMonthlySummarySchema = createInsertSchema(monthlySummaries).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type DailyWasteEntry = typeof dailyWasteEntries.$inferSelect;
export type InsertDailyWasteEntry = z.infer<typeof insertDailyWasteEntrySchema>;

export type MonthlySummary = typeof monthlySummaries.$inferSelect;
export type InsertMonthlySummary = z.infer<typeof insertMonthlySummarySchema>;
