#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuración del nuevo cliente
const clientConfig = {
  // Ejemplo para Hotel Presidente Intercontinental
  name: "Hotel Presidente Intercontinental",
  shortName: "HPI",
  primaryColor: "#1a472a",
  secondaryColor: "#f4d03f",
  logo: "HPI_logo.png",
  industry: "hospitality", // hospitality, country-club, corporate, retail
  modules: {
    waste: true,
    energy: true, 
    water: true,
    circularEconomy: true
  }
};

// Archivos que necesitan personalización
const filesToCustomize = [
  'client/src/components/ui/Sidebar.tsx',
  'client/src/pages/Dashboard.tsx',
  'client/src/lib/pdf-generator.ts',
  'shared/schema.ts',
  'package.json'
];

function setupNewClient(config) {
  console.log(`🚀 Configurando app para: ${config.name}`);
  
  // 1. Actualizar colores en CSS
  updateColors(config);
  
  // 2. Cambiar branding en componentes
  updateBranding(config);
  
  // 3. Personalizar reportes PDF
  updatePDFTemplates(config);
  
  // 4. Configurar base de datos
  updateDatabaseSchema(config);
  
  console.log(`✅ App configurada para ${config.name}`);
  console.log(`📝 Recuerda actualizar el logo en /public/assets/`);
}

function updateColors(config) {
  const cssPath = 'client/src/index.css';
  let css = fs.readFileSync(cssPath, 'utf8');
  
  // Reemplazar colores principales
  css = css.replace(/--primary: 216 32% 21%/g, `--primary: ${hexToHSL(config.primaryColor)}`);
  css = css.replace(/--accent: 79 69% 64%/g, `--accent: ${hexToHSL(config.secondaryColor)}`);
  
  fs.writeFileSync(cssPath, css);
  console.log('✅ Colores actualizados');
}

function updateBranding(config) {
  // Actualizar nombre de la app en múltiples archivos
  filesToCustomize.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      content = content.replace(/Club Campestre Ciudad de México/g, config.name);
      content = content.replace(/CCCM/g, config.shortName);
      fs.writeFileSync(filePath, content);
    }
  });
  console.log('✅ Branding actualizado');
}

function updatePDFTemplates(config) {
  // Personalizar templates de reportes
  const pdfPath = 'client/src/lib/pdf-generator.ts';
  if (fs.existsSync(pdfPath)) {
    let content = fs.readFileSync(pdfPath, 'utf8');
    content = content.replace(/SISTEMA DE GESTIÓN AMBIENTAL - CCCM/g, 
      `SISTEMA DE GESTIÓN AMBIENTAL - ${config.shortName}`);
    fs.writeFileSync(pdfPath, content);
  }
  console.log('✅ Templates PDF actualizados');
}

function updateDatabaseSchema(config) {
  // Agregar configuración específica del cliente al schema
  const schemaPath = 'shared/schema.ts';
  if (fs.existsSync(schemaPath)) {
    let schema = fs.readFileSync(schemaPath, 'utf8');
    // Agregar tabla de configuración del cliente si no existe
    if (!schema.includes('clientConfig')) {
      const configTable = `
export const clientConfig = pgTable("client_config", {
  id: serial("id").primaryKey(),
  clientName: varchar("client_name", { length: 255 }).notNull(),
  primaryColor: varchar("primary_color", { length: 7 }),
  secondaryColor: varchar("secondary_color", { length: 7 }),
  logo: varchar("logo", { length: 255 }),
  industry: varchar("industry", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow(),
});
`;
      schema += configTable;
      fs.writeFileSync(schemaPath, schema);
    }
  }
  console.log('✅ Schema de base de datos actualizado');
}

function hexToHSL(hex) {
  // Convertir hex a HSL para CSS custom properties
  const r = parseInt(hex.substr(1,2), 16) / 255;
  const g = parseInt(hex.substr(3,2), 16) / 255;  
  const b = parseInt(hex.substr(5,2), 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  
  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

// Ejecutar configuración
setupNewClient(clientConfig);

export { setupNewClient };