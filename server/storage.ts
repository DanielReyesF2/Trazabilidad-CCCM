import { 
  Client, InsertClient, 
  Document, InsertDocument, 
  WasteData, InsertWasteData, 
  Alert, InsertAlert,
  Month, InsertMonth,
  RecyclingEntry, InsertRecyclingEntry,
  CompostEntry, InsertCompostEntry,
  ReuseEntry, InsertReuseEntry,
  LandfillEntry, InsertLandfillEntry,
  DailyWasteEntry, InsertDailyWasteEntry,
  MonthlySummary, InsertMonthlySummary,
  ZeroWasteAudit, InsertZeroWasteAudit,
  ZeroWasteMaterial, InsertZeroWasteMaterial,
  clients, documents, wasteData, alerts,
  months, recyclingEntries, compostEntries, reuseEntries, landfillEntries,
  dailyWasteEntries, monthlySummaries, zeroWasteAudits, zeroWasteMaterials,
  RECYCLING_MATERIALS, COMPOST_CATEGORIES, REUSE_CATEGORIES, LANDFILL_WASTE_TYPES
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte } from "drizzle-orm";

export interface IStorage {
  // Client operations
  getClients(): Promise<Client[]>;
  getClient(id: number): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  
  // Document operations
  getDocuments(): Promise<Document[]>;
  getDocumentsByClient(clientId: number): Promise<Document[]>;
  getDocument(id: number): Promise<Document | undefined>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocument(id: number, updates: Partial<Document>): Promise<Document | undefined>;
  
  // Waste data operations
  getWasteData(filters?: {clientId?: number, fromDate?: Date, toDate?: Date}): Promise<WasteData[]>;
  getWasteDataById(id: number): Promise<WasteData | undefined>;
  createWasteData(data: InsertWasteData): Promise<WasteData>;
  
  // Alert operations
  getAlerts(clientId?: number): Promise<Alert[]>;
  getAlert(id: number): Promise<Alert | undefined>;
  createAlert(alert: InsertAlert): Promise<Alert>;
  updateAlert(id: number, updates: Partial<Alert>): Promise<Alert | undefined>;
  
  // Detailed waste tracking operations (Excel replication)
  // Month operations
  getMonths(year: number): Promise<Month[]>;
  getMonth(year: number, month: number): Promise<Month | undefined>;
  createMonth(month: InsertMonth): Promise<Month>;
  
  // Recycling operations
  getRecyclingEntries(monthId: number): Promise<RecyclingEntry[]>;
  upsertRecyclingEntry(entry: InsertRecyclingEntry): Promise<RecyclingEntry>;
  
  // Compost operations
  getCompostEntries(monthId: number): Promise<CompostEntry[]>;
  upsertCompostEntry(entry: InsertCompostEntry): Promise<CompostEntry>;
  
  // Reuse operations
  getReuseEntries(monthId: number): Promise<ReuseEntry[]>;
  upsertReuseEntry(entry: InsertReuseEntry): Promise<ReuseEntry>;
  
  // Landfill operations
  getLandfillEntries(monthId: number): Promise<LandfillEntry[]>;
  upsertLandfillEntry(entry: InsertLandfillEntry): Promise<LandfillEntry>;
  
  // Batch update operations
  updateWasteDataForYear(year: number, data: any): Promise<void>;
  
  // Daily waste entry operations
  getDailyWasteEntriesByDate(date: Date): Promise<DailyWasteEntry[]>;
  getDailyWasteEntriesByMonth(clientId: number, year: number, month: number): Promise<DailyWasteEntry[]>;
  createDailyWasteEntry(entry: InsertDailyWasteEntry): Promise<DailyWasteEntry>;
  
  // Monthly summary operations
  getMonthlySummaries(clientId: number, year?: number): Promise<MonthlySummary[]>;
  getMonthlySummary(clientId: number, year: number, month: number): Promise<MonthlySummary | undefined>;
  createMonthlySummary(summary: InsertMonthlySummary): Promise<MonthlySummary>;
  updateMonthlySummary(id: number, updates: Partial<MonthlySummary>): Promise<MonthlySummary | undefined>;
  closeMonthlySummary(id: number): Promise<MonthlySummary | undefined>;
  reopenMonthlySummary(id: number): Promise<MonthlySummary | undefined>;
  transferToOfficialData(summary: MonthlySummary): Promise<void>;
  markAsTransferred(id: number): Promise<MonthlySummary | undefined>;
  
  // Zero Waste Audit operations
  getZeroWasteAudits(clientId?: number): Promise<ZeroWasteAudit[]>;
  getZeroWasteAudit(id: number): Promise<ZeroWasteAudit | undefined>;
  createZeroWasteAudit(audit: InsertZeroWasteAudit): Promise<ZeroWasteAudit>;
  updateZeroWasteAudit(id: number, updates: Partial<InsertZeroWasteAudit>): Promise<ZeroWasteAudit | undefined>;
  
  // Zero Waste Material operations
  getZeroWasteMaterials(auditId: number): Promise<ZeroWasteMaterial[]>;
  createZeroWasteMaterial(material: InsertZeroWasteMaterial): Promise<ZeroWasteMaterial>;
  completeZeroWasteAudit(auditId: number, materials: InsertZeroWasteMaterial[], notes?: string): Promise<ZeroWasteAudit>;
}

export class MemStorage implements IStorage {
  private clients: Map<number, Client>;
  private documents: Map<number, Document>;
  private wasteData: Map<number, WasteData>;
  private alerts: Map<number, Alert>;
  
  private clientId: number;
  private documentId: number;
  private wasteDataId: number;
  private alertId: number;

  constructor() {
    this.clients = new Map();
    this.documents = new Map();
    this.wasteData = new Map();
    this.alerts = new Map();
    
    this.clientId = 1;
    this.documentId = 1;
    this.wasteDataId = 1;
    this.alertId = 1;
    
    // Initialize Club Campestre and data synchronously
    this.initializeClubData();
  }

  // Initialize Club Campestre client and historical waste data
  private initializeClubData() {
    // Add Club Campestre as main client
    this.createClient({ name: "Club Campestre Ciudad de México", description: "Club deportivo sustentable" });
    this.initializeHistoricalWasteData();
  }

  // Initialize real waste data for Club Campestre (REAL 2025 DATA from CSV and Excel files)
  private initializeHistoricalWasteData() {
    const clubId = 1; // Club Campestre ID

    
    // Real 2025 waste generation data (EXACT MEASUREMENTS from Club Campestre)
    const realData2025 = [
      { month: 1, organic: 5.3865, inorganic: 2.96558, recyclable: 0.56905 }, // January 2025 - REAL
      { month: 2, organic: 4.8415, inorganic: 2.4233, recyclable: 2.368 }, // February 2025 - REAL
      { month: 3, organic: 5.964, inorganic: 3.1405, recyclable: 2.1568 }, // March 2025 - REAL
      { month: 4, organic: 4.6775, inorganic: 2.4807, recyclable: 0.7212 }, // April 2025 - REAL
      { month: 5, organic: 4.921, inorganic: 2.844, recyclable: 2.98 }, // May 2025 - REAL
      { month: 6, organic: 3.8375, inorganic: 2.1475, recyclable: 3.468 }, // June 2025 - REAL
      { month: 7, organic: 4.2, inorganic: 2.3, recyclable: 1.704 }, // July 2025 - REAL
      { month: 8, organic: 4.1, inorganic: 2.2, recyclable: 0.177 }, // August 2025 - REAL
    ];

    
    // Add 2025 real data
    for (const data of realData2025) {
      this.createWasteData({
        clientId: clubId,
        documentId: null,
        date: new Date(2025, data.month - 1, 15), // 15th of each month
        organicWaste: data.organic,
        inorganicWaste: data.inorganic,
        recyclableWaste: data.recyclable,
      });
    }
    
    console.log(`Initialized ${this.wasteData.size} waste data records for 2025`);
  }

  // Client operations
  async getClients(): Promise<Client[]> {
    return Array.from(this.clients.values());
  }

  async getClient(id: number): Promise<Client | undefined> {
    return this.clients.get(id);
  }

  async createClient(client: InsertClient): Promise<Client> {
    const id = this.clientId++;
    const newClient: Client = { 
      ...client, 
      id,
      description: client.description || null
    };
    this.clients.set(id, newClient);
    return newClient;
  }

  // Document operations
  async getDocuments(): Promise<Document[]> {
    return Array.from(this.documents.values());
  }

  async getDocumentsByClient(clientId: number): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(
      (doc) => doc.clientId === clientId
    );
  }

  async getDocument(id: number): Promise<Document | undefined> {
    return this.documents.get(id);
  }

  async createDocument(document: InsertDocument): Promise<Document> {
    const id = this.documentId++;
    const newDocument: Document = {
      ...document,
      id,
      uploadDate: new Date(),
      processed: false,
      clientId: document.clientId || null,
      processingError: null
    };
    this.documents.set(id, newDocument);
    return newDocument;
  }

  async updateDocument(id: number, updates: Partial<Document>): Promise<Document | undefined> {
    const document = this.documents.get(id);
    if (!document) return undefined;
    
    const updatedDocument = { ...document, ...updates };
    this.documents.set(id, updatedDocument);
    return updatedDocument;
  }

  // Waste data operations
  async getWasteData(filters?: { clientId?: number, fromDate?: Date, toDate?: Date }): Promise<WasteData[]> {
    let data = Array.from(this.wasteData.values());
    
    if (filters?.clientId) {
      data = data.filter(d => d.clientId === filters.clientId);
    }
    
    if (filters?.fromDate) {
      data = data.filter(d => d.date >= filters.fromDate!);
    }
    
    if (filters?.toDate) {
      data = data.filter(d => d.date <= filters.toDate!);
    }
    
    return data;
  }

  async getWasteDataById(id: number): Promise<WasteData | undefined> {
    return this.wasteData.get(id);
  }

  async createWasteData(data: InsertWasteData): Promise<WasteData> {
    const id = this.wasteDataId++;
    const newData: WasteData = { 
      ...data, 
      id,
      clientId: data.clientId || null,
      documentId: data.documentId || null,
      organicWaste: data.organicWaste || null,
      inorganicWaste: data.inorganicWaste || null,
      recyclableWaste: data.recyclableWaste || null,
      totalWaste: data.totalWaste || null,
      deviation: data.deviation || null,
      rawData: null
    };
    this.wasteData.set(id, newData);
    return newData;
  }

  // Alert operations
  async getAlerts(clientId?: number): Promise<Alert[]> {
    let alerts = Array.from(this.alerts.values());
    
    if (clientId) {
      alerts = alerts.filter(a => a.clientId === clientId);
    }
    
    // Sort by date, most recent first
    return alerts.sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  async getAlert(id: number): Promise<Alert | undefined> {
    return this.alerts.get(id);
  }

  async createAlert(alert: InsertAlert): Promise<Alert> {
    const id = this.alertId++;
    const newAlert: Alert = {
      ...alert,
      id,
      date: new Date(),
      resolved: false,
      clientId: alert.clientId || null,
      documentId: alert.documentId || null
    };
    this.alerts.set(id, newAlert);
    return newAlert;
  }

  async updateAlert(id: number, updates: Partial<Alert>): Promise<Alert | undefined> {
    const alert = this.alerts.get(id);
    if (!alert) return undefined;
    
    const updatedAlert = { ...alert, ...updates };
    this.alerts.set(id, updatedAlert);
    return updatedAlert;
  }
  
  // Detailed waste tracking operations - stub implementations
  async getMonths(year: number): Promise<Month[]> {
    throw new Error("Detailed waste tracking not implemented in MemStorage");
  }
  
  async getMonth(year: number, month: number): Promise<Month | undefined> {
    throw new Error("Detailed waste tracking not implemented in MemStorage");
  }
  
  async createMonth(month: InsertMonth): Promise<Month> {
    throw new Error("Detailed waste tracking not implemented in MemStorage");
  }
  
  async getRecyclingEntries(monthId: number): Promise<RecyclingEntry[]> {
    throw new Error("Detailed waste tracking not implemented in MemStorage");
  }
  
  async upsertRecyclingEntry(entry: InsertRecyclingEntry): Promise<RecyclingEntry> {
    throw new Error("Detailed waste tracking not implemented in MemStorage");
  }
  
  async getCompostEntries(monthId: number): Promise<CompostEntry[]> {
    throw new Error("Detailed waste tracking not implemented in MemStorage");
  }
  
  async upsertCompostEntry(entry: InsertCompostEntry): Promise<CompostEntry> {
    throw new Error("Detailed waste tracking not implemented in MemStorage");
  }
  
  async getReuseEntries(monthId: number): Promise<ReuseEntry[]> {
    throw new Error("Detailed waste tracking not implemented in MemStorage");
  }
  
  async upsertReuseEntry(entry: InsertReuseEntry): Promise<ReuseEntry> {
    throw new Error("Detailed waste tracking not implemented in MemStorage");
  }
  
  async getLandfillEntries(monthId: number): Promise<LandfillEntry[]> {
    throw new Error("Detailed waste tracking not implemented in MemStorage");
  }
  
  async upsertLandfillEntry(entry: InsertLandfillEntry): Promise<LandfillEntry> {
    throw new Error("Detailed waste tracking not implemented in MemStorage");
  }
  
  async updateWasteDataForYear(year: number, data: any): Promise<void> {
    throw new Error("Detailed waste tracking not implemented in MemStorage");
  }
}

export class DatabaseStorage implements IStorage {
  // Client operations
  async getClients(): Promise<Client[]> {
    return await db.select().from(clients);
  }
  
  async getClient(id: number): Promise<Client | undefined> {
    const results = await db.select().from(clients).where(eq(clients.id, id));
    return results.length > 0 ? results[0] : undefined;
  }
  
  async createClient(client: InsertClient): Promise<Client> {
    const [newClient] = await db.insert(clients).values(client).returning();
    return newClient;
  }
  
  // Document operations
  async getDocuments(): Promise<Document[]> {
    return await db.select().from(documents);
  }
  
  async getDocumentsByClient(clientId: number): Promise<Document[]> {
    return await db
      .select()
      .from(documents)
      .where(eq(documents.clientId, clientId));
  }
  
  async getDocument(id: number): Promise<Document | undefined> {
    const results = await db
      .select()
      .from(documents)
      .where(eq(documents.id, id));
    return results.length > 0 ? results[0] : undefined;
  }
  
  async createDocument(document: InsertDocument): Promise<Document> {
    const [newDocument] = await db
      .insert(documents)
      .values({
        ...document,
        uploadDate: new Date(),
        processed: false
      })
      .returning();
    return newDocument;
  }
  
  async updateDocument(id: number, updates: Partial<Document>): Promise<Document | undefined> {
    // No podemos actualizar directamente el id
    if ('id' in updates) {
      delete updates.id;
    }
    
    const results = await db
      .update(documents)
      .set(updates)
      .where(eq(documents.id, id))
      .returning();
    
    return results.length > 0 ? results[0] : undefined;
  }
  
  // Waste data operations
  async getWasteData(filters?: { clientId?: number, fromDate?: Date, toDate?: Date }): Promise<WasteData[]> {
    let query = db.select().from(wasteData);
    
    // Agregar condiciones de acuerdo a los filtros
    if (filters) {
      const conditions = [];
      
      if (filters.clientId !== undefined) {
        conditions.push(eq(wasteData.clientId, filters.clientId));
      }
      
      if (filters.fromDate !== undefined) {
        conditions.push(gte(wasteData.date, filters.fromDate));
      }
      
      if (filters.toDate !== undefined) {
        conditions.push(lte(wasteData.date, filters.toDate));
      }
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
    }
    
    return await query;
  }
  
  async getWasteDataById(id: number): Promise<WasteData | undefined> {
    const results = await db
      .select()
      .from(wasteData)
      .where(eq(wasteData.id, id));
    
    return results.length > 0 ? results[0] : undefined;
  }
  
  async createWasteData(data: InsertWasteData): Promise<WasteData> {
    const [newData] = await db
      .insert(wasteData)
      .values(data)
      .returning();
    
    return newData;
  }
  
  // Alert operations
  async getAlerts(clientId?: number): Promise<Alert[]> {
    let query = db.select().from(alerts);
    
    if (clientId !== undefined) {
      query = query.where(eq(alerts.clientId, clientId));
    }
    
    const results = await query;
    // Sort by date, most recent first
    return results.sort((a, b) => b.date.getTime() - a.date.getTime());
  }
  
  async getAlert(id: number): Promise<Alert | undefined> {
    const results = await db
      .select()
      .from(alerts)
      .where(eq(alerts.id, id));
    
    return results.length > 0 ? results[0] : undefined;
  }
  
  async createAlert(alert: InsertAlert): Promise<Alert> {
    const [newAlert] = await db
      .insert(alerts)
      .values({
        ...alert,
        date: new Date(),
        resolved: false
      })
      .returning();
    
    return newAlert;
  }
  
  async updateAlert(id: number, updates: Partial<Alert>): Promise<Alert | undefined> {
    // No podemos actualizar directamente el id
    if ('id' in updates) {
      delete updates.id;
    }
    
    const results = await db
      .update(alerts)
      .set(updates)
      .where(eq(alerts.id, id))
      .returning();
    
    return results.length > 0 ? results[0] : undefined;
  }
  
  // Detailed waste tracking operations (Excel replication)
  // Month operations
  async getMonths(year: number): Promise<Month[]> {
    return await db.select().from(months).where(eq(months.year, year));
  }
  
  async getMonth(year: number, month: number): Promise<Month | undefined> {
    const results = await db
      .select()
      .from(months)
      .where(and(eq(months.year, year), eq(months.month, month)));
    return results.length > 0 ? results[0] : undefined;
  }
  
  async createMonth(month: InsertMonth): Promise<Month> {
    const [newMonth] = await db
      .insert(months)
      .values(month)
      .returning();
    return newMonth;
  }
  
  // Recycling operations
  async getRecyclingEntries(monthId: number): Promise<RecyclingEntry[]> {
    return await db.select().from(recyclingEntries).where(eq(recyclingEntries.monthId, monthId));
  }
  
  async upsertRecyclingEntry(entry: InsertRecyclingEntry): Promise<RecyclingEntry> {
    const existing = await db
      .select()
      .from(recyclingEntries)
      .where(and(
        eq(recyclingEntries.monthId, entry.monthId),
        eq(recyclingEntries.material, entry.material)
      ));
    
    if (existing.length > 0) {
      const [updated] = await db
        .update(recyclingEntries)
        .set({ kg: entry.kg })
        .where(eq(recyclingEntries.id, existing[0].id))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(recyclingEntries)
        .values(entry)
        .returning();
      return created;
    }
  }
  
  // Compost operations
  async getCompostEntries(monthId: number): Promise<CompostEntry[]> {
    return await db.select().from(compostEntries).where(eq(compostEntries.monthId, monthId));
  }
  
  async upsertCompostEntry(entry: InsertCompostEntry): Promise<CompostEntry> {
    const existing = await db
      .select()
      .from(compostEntries)
      .where(and(
        eq(compostEntries.monthId, entry.monthId),
        eq(compostEntries.category, entry.category)
      ));
    
    if (existing.length > 0) {
      const [updated] = await db
        .update(compostEntries)
        .set({ kg: entry.kg })
        .where(eq(compostEntries.id, existing[0].id))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(compostEntries)
        .values(entry)
        .returning();
      return created;
    }
  }
  
  // Reuse operations
  async getReuseEntries(monthId: number): Promise<ReuseEntry[]> {
    return await db.select().from(reuseEntries).where(eq(reuseEntries.monthId, monthId));
  }
  
  async upsertReuseEntry(entry: InsertReuseEntry): Promise<ReuseEntry> {
    const existing = await db
      .select()
      .from(reuseEntries)
      .where(and(
        eq(reuseEntries.monthId, entry.monthId),
        eq(reuseEntries.category, entry.category)
      ));
    
    if (existing.length > 0) {
      const [updated] = await db
        .update(reuseEntries)
        .set({ kg: entry.kg })
        .where(eq(reuseEntries.id, existing[0].id))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(reuseEntries)
        .values(entry)
        .returning();
      return created;
    }
  }
  
  // Landfill operations
  async getLandfillEntries(monthId: number): Promise<LandfillEntry[]> {
    return await db.select().from(landfillEntries).where(eq(landfillEntries.monthId, monthId));
  }
  
  async upsertLandfillEntry(entry: InsertLandfillEntry): Promise<LandfillEntry> {
    const existing = await db
      .select()
      .from(landfillEntries)
      .where(and(
        eq(landfillEntries.monthId, entry.monthId),
        eq(landfillEntries.wasteType, entry.wasteType)
      ));
    
    if (existing.length > 0) {
      const [updated] = await db
        .update(landfillEntries)
        .set({ kg: entry.kg })
        .where(eq(landfillEntries.id, existing[0].id))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(landfillEntries)
        .values(entry)
        .returning();
      return created;
    }
  }
  
  // Batch update operations
  async updateWasteDataForYear(year: number, data: any): Promise<void> {
    // This will be implemented when we create the API routes
    console.log(`Updating waste data for year ${year}`, data);
  }

  // Daily waste entry operations
  async getDailyWasteEntriesByDate(date: Date): Promise<DailyWasteEntry[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return db.select()
      .from(dailyWasteEntries)
      .where(and(
        gte(dailyWasteEntries.date, startOfDay),
        lte(dailyWasteEntries.date, endOfDay)
      ));
  }

  async getDailyWasteEntriesByMonth(clientId: number, year: number, month: number): Promise<DailyWasteEntry[]> {
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    return db.select()
      .from(dailyWasteEntries)
      .where(and(
        eq(dailyWasteEntries.clientId, clientId),
        gte(dailyWasteEntries.date, startOfMonth),
        lte(dailyWasteEntries.date, endOfMonth)
      ));
  }

  async createDailyWasteEntry(entry: InsertDailyWasteEntry): Promise<DailyWasteEntry> {
    const [created] = await db
      .insert(dailyWasteEntries)
      .values(entry)
      .returning();
    return created;
  }

  // Monthly summary operations
  async getMonthlySummary(clientId: number, year: number, month: number): Promise<MonthlySummary | undefined> {
    const [summary] = await db.select()
      .from(monthlySummaries)
      .where(and(
        eq(monthlySummaries.clientId, clientId),
        eq(monthlySummaries.year, year),
        eq(monthlySummaries.month, month)
      ));
    return summary;
  }

  async createMonthlySummary(clientId: number, year: number, month: number): Promise<MonthlySummary> {
    const [created] = await db
      .insert(monthlySummaries)
      .values({
        clientId,
        year,
        month,
        status: 'open'
      })
      .returning();
    return created;
  }

  async updateMonthlySummary(id: number, updates: Partial<MonthlySummary>): Promise<MonthlySummary> {
    const [updated] = await db
      .update(monthlySummaries)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(monthlySummaries.id, id))
      .returning();
    return updated;
  }

  async closeMonthlySummary(id: number, closedBy: string): Promise<MonthlySummary> {
    const [updated] = await db
      .update(monthlySummaries)
      .set({
        status: 'closed',
        closedAt: new Date(),
        closedBy,
        updatedAt: new Date()
      })
      .where(eq(monthlySummaries.id, id))
      .returning();
    return updated;
  }

  async markAsTransferred(id: number): Promise<MonthlySummary> {
    const [updated] = await db
      .update(monthlySummaries)
      .set({
        transferredToOfficial: true,
        transferredAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(monthlySummaries.id, id))
      .returning();
    return updated;
  }

  async transferToOfficialData(summary: MonthlySummary): Promise<void> {
    // Esta lógica transferirá los datos del resumen mensual a la tabla monthly_deviation_data
    // para la trazabilidad oficial que requiere la certificadora
    console.log(`Transferring monthly summary ${summary.id} to official data...`);
    
    // Aquí implementaremos la lógica para mapear los datos del resumen mensual
    // a la estructura de monthly_deviation_data que usa el Excel de trazabilidad
  }

  // Zero Waste Audit operations
  async getZeroWasteAudits(clientId?: number): Promise<ZeroWasteAudit[]> {
    let query = db.select().from(zeroWasteAudits);
    
    if (clientId !== undefined) {
      query = query.where(eq(zeroWasteAudits.clientId, clientId));
    }
    
    return await query;
  }

  async getZeroWasteAudit(id: number): Promise<ZeroWasteAudit | undefined> {
    const [audit] = await db
      .select()
      .from(zeroWasteAudits)
      .where(eq(zeroWasteAudits.id, id));
    
    return audit;
  }

  async createZeroWasteAudit(audit: InsertZeroWasteAudit): Promise<ZeroWasteAudit> {
    const [created] = await db
      .insert(zeroWasteAudits)
      .values(audit)
      .returning();
    
    return created;
  }

  async updateZeroWasteAudit(id: number, updates: Partial<InsertZeroWasteAudit>): Promise<ZeroWasteAudit | undefined> {
    const [updated] = await db
      .update(zeroWasteAudits)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(zeroWasteAudits.id, id))
      .returning();
    
    return updated;
  }

  // Zero Waste Material operations
  async getZeroWasteMaterials(auditId: number): Promise<ZeroWasteMaterial[]> {
    return await db
      .select()
      .from(zeroWasteMaterials)
      .where(eq(zeroWasteMaterials.auditId, auditId));
  }

  async createZeroWasteMaterial(material: InsertZeroWasteMaterial): Promise<ZeroWasteMaterial> {
    const [created] = await db
      .insert(zeroWasteMaterials)
      .values(material)
      .returning();
    
    return created;
  }

  async completeZeroWasteAudit(auditId: number, materials: InsertZeroWasteMaterial[], notes?: string): Promise<ZeroWasteAudit> {
    // Start a transaction to ensure data consistency
    return await db.transaction(async (tx) => {
      // Insert all materials
      for (const material of materials) {
        await tx.insert(zeroWasteMaterials).values({
          ...material,
          auditId
        });
      }

      // Update audit status and notes
      const [updatedAudit] = await tx
        .update(zeroWasteAudits)
        .set({
          status: 'completed',
          notes: notes || '',
          updatedAt: new Date()
        })
        .where(eq(zeroWasteAudits.id, auditId))
        .returning();

      return updatedAudit;
    });
  }

  // Missing methods for interface compliance
  async getMonthlySummaries(clientId: number, year?: number): Promise<MonthlySummary[]> {
    let query = db.select().from(monthlySummaries).where(eq(monthlySummaries.clientId, clientId));
    
    if (year !== undefined) {
      query = query.where(and(eq(monthlySummaries.clientId, clientId), eq(monthlySummaries.year, year)));
    }
    
    return await query;
  }

  async createMonthlySummary(summary: InsertMonthlySummary): Promise<MonthlySummary> {
    const [created] = await db
      .insert(monthlySummaries)
      .values(summary)
      .returning();
    
    return created;
  }

  async updateMonthlySummary(id: number, updates: Partial<MonthlySummary>): Promise<MonthlySummary | undefined> {
    const [updated] = await db
      .update(monthlySummaries)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(monthlySummaries.id, id))
      .returning();
    
    return updated;
  }

  async closeMonthlySummary(id: number): Promise<MonthlySummary | undefined> {
    const [updated] = await db
      .update(monthlySummaries)
      .set({
        status: 'closed',
        closedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(monthlySummaries.id, id))
      .returning();
    
    return updated;
  }

  async reopenMonthlySummary(id: number): Promise<MonthlySummary | undefined> {
    const [updated] = await db
      .update(monthlySummaries)
      .set({
        status: 'open',
        closedAt: null,
        updatedAt: new Date()
      })
      .where(eq(monthlySummaries.id, id))
      .returning();
    
    return updated;
  }

  async markAsTransferred(id: number): Promise<MonthlySummary | undefined> {
    const [updated] = await db
      .update(monthlySummaries)
      .set({
        transferredToOfficial: true,
        transferredAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(monthlySummaries.id, id))
      .returning();
    
    return updated;
  }
}

// Asegurémonos de tener algunos datos iniciales de clientes
async function initializeDatabase() {
  try {
    const existingClients = await db.select().from(clients);
    
    if (existingClients.length === 0) {
      await db.insert(clients).values([
        {
          name: "Empresa Sustentable S.A.",
          description: "Empresa líder en gestión sustentable de recursos y residuos industriales."
        },
        {
          name: "EcoServicios SpA",
          description: "Servicios de reciclaje y manejo de residuos para empresas e instituciones."
        },
        {
          name: "Constructora Verde Ltda.",
          description: "Construcción sustentable con enfoque en minimización y gestión de residuos."
        }
      ]);
      console.log("Base de datos inicializada con datos de muestra");
    }
  } catch (err) {
    console.error("Error al inicializar la base de datos:", err);
  }
}

// Inicializar la base de datos y exportar la instancia de almacenamiento
initializeDatabase().catch(err => console.error("Error al inicializar la base de datos:", err));

export const storage = new DatabaseStorage();
