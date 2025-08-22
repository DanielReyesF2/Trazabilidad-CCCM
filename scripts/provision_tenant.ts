import { db } from "../server/db";
import { clients, clientSettings, clientFeatureFlags, AVAILABLE_FEATURES } from "../shared/schema";
import { eq } from "drizzle-orm";

interface ProvisionTenantOptions {
  slug: string;
  name: string;
  description?: string;
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  subdomain?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  features?: string[];
  settings?: Record<string, any>;
}

export async function provisionTenant(options: ProvisionTenantOptions) {
  const {
    slug,
    name,
    description = null,
    logo = null,
    primaryColor = "#273949",
    secondaryColor = "#b5e951",
    subdomain = null,
    contactEmail = null,
    contactPhone = null,
    address = null,
    features = ["module.waste"], // Default to waste module only
    settings = {}
  } = options;

  console.log(`🚀 Provisioning tenant: ${name} (${slug})`);

  try {
    // Check if tenant already exists
    const existingClient = await db
      .select()
      .from(clients)
      .where(eq(clients.slug, slug));

    if (existingClient.length > 0) {
      console.log(`⚠️  Tenant ${slug} already exists. Skipping creation.`);
      return existingClient[0];
    }

    // Create client
    const [newClient] = await db
      .insert(clients)
      .values({
        slug,
        name,
        description,
        logo,
        primaryColor,
        secondaryColor,
        subdomain,
        contactEmail,
        contactPhone,
        address,
        isActive: true
      })
      .returning();

    console.log(`✅ Created client: ${newClient.name} (ID: ${newClient.id})`);

    // Set up feature flags
    console.log(`🔧 Setting up feature flags...`);
    for (const feature of AVAILABLE_FEATURES) {
      await db
        .insert(clientFeatureFlags)
        .values({
          clientId: newClient.id,
          feature,
          enabled: features.includes(feature)
        });
    }

    console.log(`✅ Enabled ${features.length} features: ${features.join(", ")}`);

    // Set up default settings
    console.log(`⚙️  Setting up default settings...`);
    const defaultSettings = {
      timezone: "America/Mexico_City",
      currency: "MXN",
      language: "es-MX",
      units: "metric",
      reportFormat: "pdf",
      ...settings
    };

    for (const [key, value] of Object.entries(defaultSettings)) {
      await db
        .insert(clientSettings)
        .values({
          clientId: newClient.id,
          key,
          value
        });
    }

    console.log(`✅ Applied ${Object.keys(defaultSettings).length} default settings`);

    console.log(`🎉 Successfully provisioned tenant: ${newClient.name}`);
    console.log(`📋 Summary:`);
    console.log(`   - Client ID: ${newClient.id}`);
    console.log(`   - Slug: ${newClient.slug}`);
    console.log(`   - URL: /${newClient.slug}/dashboard`);
    console.log(`   - Features: ${features.join(", ")}`);

    return newClient;

  } catch (error) {
    console.error(`❌ Error provisioning tenant ${slug}:`, error);
    throw error;
  }
}

// CLI usage
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log("Usage: npx tsx scripts/provision_tenant.ts <slug> <name> [options]");
    console.log("Example: npx tsx scripts/provision_tenant.ts club-avandaro 'Club de Golf Avándaro'");
    process.exit(1);
  }

  const [slug, name] = args;
  
  provisionTenant({
    slug,
    name,
    features: ["module.waste", "module.energy", "module.water", "module.circular_economy"]
  })
  .then(() => {
    console.log("✅ Tenant provisioning completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Tenant provisioning failed:", error);
    process.exit(1);
  });
}

main();