import "dotenv/config";
import path from "path";
import xlsx from "xlsx";
import { storage } from "./storage";
import {
  RECYCLING_MATERIALS,
  COMPOST_CATEGORIES,
  REUSE_CATEGORIES,
  LANDFILL_WASTE_TYPES,
  recyclingEntries,
  compostEntries,
  reuseEntries,
  landfillEntries,
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

type MonthKey = `${number}-${number}`;

const MONTH_MAP: Record<string, number> = {
  Oct: 10,
  Nov: 11,
  Dec: 12,
  Jan: 1,
  Feb: 2,
  Mar: 3,
  Apr: 4,
  May: 5,
  Jun: 6,
  Jul: 7,
  Aug: 8,
  Sept: 9,
};

const EXCEL_FILE = path.resolve(
  import.meta.dirname,
  "..",
  "attached_assets",
  "TRUE Application Form.CCCM.2025.15.oct (2).xlsx",
);

const SHEET_NAME = "Diversion Data";

// Indices in the sheet (0-based) for the sections we need
const ROWS = {
  recyclingStart: 75,
  recyclingEnd: 87, // inclusive, row 89 is total
  compostStart: 93,
  compostEnd: 95, // 98 is total
  reuseStart: 101,
  reuseEnd: 102, // 104 total
  landfillStart: 115,
  landfillEnd: 116, // 117 total
};

// Column indices for the 12 months (Oct 2024 - Sep 2025)
const MONTH_COL_START = 2; // column C
const MONTH_COL_END = 13; // column N inclusive

function toNumber(value: unknown): number {
  const n = typeof value === "number" ? value : parseFloat(String(value));
  return Number.isFinite(n) ? n : 0;
}

async function ensureMonth(year: number, month: number, label: string) {
  const existing = await storage.getMonth(year, month);
  if (existing) return existing;
  return storage.createMonth({ year, month, label });
}

async function loadSheet() {
  const workbook = xlsx.readFile(EXCEL_FILE);
  const sheet = workbook.Sheets[SHEET_NAME];
  if (!sheet) {
    throw new Error(`Sheet ${SHEET_NAME} not found in ${EXCEL_FILE}`);
  }
  return xlsx.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
}

async function main() {
  console.log("Reading sheet:", SHEET_NAME);
  const rows = await loadSheet();

  const monthRow = rows[71];

  const monthInfo: { year: number; month: number; label: string; col: number }[] = [];

  for (let col = MONTH_COL_START, idx = 0; col <= MONTH_COL_END; col++, idx++) {
    const label = (monthRow?.[col] ?? "").toString().trim();
    // Hoja Excel marca 2024 en las primeras columnas, pero el período real es Oct 2024 - Sep 2025.
    const year = idx < 3 ? 2024 : 2025;
    const month = MONTH_MAP[label];
    if (!month || !year) {
      console.warn(`Skipping column ${col} - missing month/year`, { label, year });
      continue;
    }
    monthInfo.push({ year, month, label: `${label} ${year}`, col });
  }

  // Cache months by key
  const monthRecords: Record<MonthKey, Awaited<ReturnType<typeof ensureMonth>>> = {};
  for (const info of monthInfo) {
    const key: MonthKey = `${info.year}-${info.month}`;
    monthRecords[key] = await ensureMonth(info.year, info.month, info.label);
  }

  // Helper to clean existing data for the targeted months
  for (const info of monthInfo) {
    const key: MonthKey = `${info.year}-${info.month}`;
    const month = monthRecords[key];
    if (!month) continue;
    await db.delete(recyclingEntries).where(eq(recyclingEntries.monthId, month.id));
    await db.delete(compostEntries).where(eq(compostEntries.monthId, month.id));
    await db.delete(reuseEntries).where(eq(reuseEntries.monthId, month.id));
    await db.delete(landfillEntries).where(eq(landfillEntries.monthId, month.id));
  }

  // Helper to upsert rows for a given section
  const upsertSection = async (
    start: number,
    end: number,
    type: "recycling" | "compost" | "reuse" | "landfill",
  ) => {
    for (let r = start; r <= end; r++) {
      const materialRaw = rows[r]?.[1];
      if (!materialRaw) continue;
      const material = materialRaw.toString().trim();

      for (const info of monthInfo) {
        const value = toNumber(rows[r]?.[info.col]);
        const key: MonthKey = `${info.year}-${info.month}`;
        const month = monthRecords[key];
        if (!month) continue;

        switch (type) {
          case "recycling":
            if (!RECYCLING_MATERIALS.includes(material as any)) {
              console.warn("Unknown recycling material, skipping", material);
              continue;
            }
            await storage.upsertRecyclingEntry({
              monthId: month.id,
              material,
              kg: value,
            });
            break;
          case "compost":
            if (!COMPOST_CATEGORIES.includes(material as any)) {
              console.warn("Unknown compost category, skipping", material);
              continue;
            }
            await storage.upsertCompostEntry({
              monthId: month.id,
              category: material,
              kg: value,
            });
            break;
          case "reuse":
            if (!REUSE_CATEGORIES.includes(material as any)) {
              console.warn("Unknown reuse category, skipping", material);
              continue;
            }
            await storage.upsertReuseEntry({
              monthId: month.id,
              category: material,
              kg: value,
            });
            break;
          case "landfill":
            if (!LANDFILL_WASTE_TYPES.includes(material as any)) {
              console.warn("Unknown landfill type, skipping", material);
              continue;
            }
            await storage.upsertLandfillEntry({
              monthId: month.id,
              wasteType: material,
              kg: value,
            });
            break;
        }
      }
    }
  };

  console.log("Upserting recycling...");
  await upsertSection(ROWS.recyclingStart, ROWS.recyclingEnd, "recycling");

  console.log("Upserting organics (compost)...");
  await upsertSection(ROWS.compostStart, ROWS.compostEnd, "compost");

  console.log("Upserting reuse...");
  await upsertSection(ROWS.reuseStart, ROWS.reuseEnd, "reuse");

  console.log("Upserting landfill...");
  await upsertSection(ROWS.landfillStart, ROWS.landfillEnd, "landfill");

  console.log("Import completed successfully.");
}

main().catch((err) => {
  console.error("Error importing TRUE Diversion Data:", err);
  process.exit(1);
});

