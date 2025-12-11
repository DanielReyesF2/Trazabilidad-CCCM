# Econova - Sistema de Gestión Ambiental

Sistema integral de gestión ambiental diseñado para Club Campestre Ciudad de México (CCCM), expandido desde una aplicación solo de residuos a una plataforma de sostenibilidad integrada. El sistema abarca cuatro módulos ambientales clave: Energía, Agua, Residuos y Economía Circular, proporcionando seguimiento y gestión integral del desempeño ambiental.

El sistema mantiene sus capacidades originales de gestión de residuos mientras agrega monitoreo de eficiencia energética, seguimiento de conservación de agua y un índice avanzado de economía circular que integra todos los factores ambientales. Construido con potencial de venta comercial al cliente, con análisis ambientales sofisticados y seguimiento del progreso de certificación TRUE Zero Waste.

## Características Principales

### Módulos Ambientales

- **Gestión de Residuos**: Sistema de registro diario con validación en tiempo real, trazabilidad mensual con flujo de trabajo abierto/cerrado/transferido, generación de informes PDF, seguimiento de certificación TRUE Zero Waste, exportación de datos CSV
- **Monitoreo de Energía**: Proyecto de generación de energía solar en fase de planificación, seguimiento de patrones de consumo, métricas de eficiencia y porcentaje de energía renovable
- **Conservación de Agua**: Planta de tratamiento de aguas residuales (PTAR) y sistema de lagunas para riego del campo de golf, monitoreo de consumo, sistemas de reciclaje y seguimiento de parámetros de calidad
- **Índice de Economía Circular**: Puntuación de sostenibilidad integrada que combina todos los factores ambientales (índice actual del 72%)

### Funcionalidades Técnicas

- **Dashboard Moderno**: Diseño profesional con visualizaciones interactivas de datos
- **Certificación TRUE Zero Waste**: Funcionalidad "Año TRUE" con cálculo de período rodante de 12 meses (Ago 2024 - Jul 2025)
- **Sistema de Registro Diario**: Integración completa entre registros diarios de residuos y trazabilidad mensual con agregación en tiempo real
- **Módulo de Auditoría Zero Waste**: Implementación completa de metodología NMX-AA-61 de 6 pasos con enfoque dashboard-first, integración de base de datos y análisis profesional
- **Visualización Avanzada de Datos**: Gráficos y tablas completas (gráficos de barras, gráficos circulares, análisis de tendencias) con integración de Recharts

## Arquitectura del Sistema

### Frontend
- **Framework**: React 18 con TypeScript y Vite
- **Estilos**: Tailwind CSS con sistema de diseño personalizado usando colores de marca navy (#273949) y lime (#b5e951)
- **Componentes UI**: Radix UI headless components con sistema de diseño shadcn/ui
- **Gestión de Estado**: TanStack Query para gestión de estado del servidor y obtención de datos
- **Enrutamiento**: Wouter para enrutamiento del lado del cliente ligero
- **Gráficos**: Recharts para visualización de datos y dashboards de análisis

### Backend
- **Runtime**: Node.js con framework Express.js
- **Lenguaje**: TypeScript con módulos ES
- **Patrón API**: Diseño de API RESTful con manejo estructurado de errores
- **Procesamiento de Archivos**: Multer para cargas de archivos con capacidades de procesamiento PDF
- **APIs Externas**: Integración de OpenAI para análisis de documentos y extracción de datos

### Almacenamiento de Datos
- **Base de Datos**: PostgreSQL con connection pooling vía Neon Serverless
- **ORM**: Drizzle ORM para operaciones de base de datos type-safe
- **Esquema**: Esquema estructurado con tablas de clients, documents, waste_data y alerts
- **Migraciones**: Drizzle Kit para gestión de esquema de base de datos y migraciones

## Instalación y Configuración

### Requisitos Previos
- Node.js 20 o superior
- PostgreSQL (o acceso a Neon Serverless)
- npm o yarn

### Instalación

1. Clonar el repositorio
2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno (crear archivo `.env`):
```
DATABASE_URL=tu_url_de_base_de_datos
OPENAI_API_KEY=tu_clave_de_openai
PORT=5000
NODE_ENV=development
```

4. Configurar la base de datos:
```bash
npm run db:push
```

5. Iniciar el servidor de desarrollo:
```bash
npm run dev
```

6. Construir para producción:
```bash
npm run build
npm start
```

## Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm start` - Inicia el servidor en modo producción
- `npm run check` - Verifica tipos TypeScript
- `npm run db:push` - Sincroniza el esquema de base de datos

## Estructura del Proyecto

```
├── client/              # Aplicación frontend React
│   ├── src/
│   │   ├── components/ # Componentes React
│   │   ├── pages/     # Páginas de la aplicación
│   │   ├── hooks/     # Custom hooks
│   │   └── lib/       # Utilidades y helpers
├── server/             # Backend Express
│   ├── routes.ts       # Definición de rutas API
│   ├── db.ts           # Configuración de base de datos
│   └── index.ts        # Punto de entrada del servidor
├── shared/             # Código compartido
│   └── schema.ts       # Esquemas de base de datos
└── uploads/            # Archivos subidos
```

## Dependencias Principales

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Radix UI
- TanStack Query
- Recharts
- Wouter

### Backend
- Express.js
- Drizzle ORM
- OpenAI API
- Multer
- Neon Serverless (PostgreSQL)

## Estado del Desarrollo

### Completado (100%)
- ✅ Módulo de Gestión de Residuos
- ✅ Infraestructura de Plataforma Core
- ✅ Dashboard y Analytics
- ✅ Sistema de Registro Diario
- ✅ Módulo de Auditoría Zero Waste

### En Desarrollo
- 🔄 Módulo de Energía (0%)
- 🔄 Módulo de Agua (0%)
- 🔄 Módulo de Economía Circular (20%)

## Licencia

MIT

