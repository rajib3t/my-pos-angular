const fs = require('fs');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
const envFile = path.resolve(__dirname, '../.env');
if (fs.existsSync(envFile)) {
  dotenv.config({ path: envFile });
}

// Get environment variables with defaults
const apiUrl = process.env['API_URL'] || 'http://localhost:8087';
const mainDomain = process.env['MAIN_DOMAIN'] || 'mypos.local';
const production = process.env['PRODUCTION'] === 'true';

// Generate config.json for runtime configuration
const configJson = {
  apiUrl: apiUrl,
  mainDomain: mainDomain,
  production: production
};

// Write to public/config.json (will be served at runtime)
const configPath = path.resolve(__dirname, '../public/config.json');
fs.writeFileSync(configPath, JSON.stringify(configJson, null, 2));

// Generate environment.ts content with static fallbacks
const environmentContent = `export const environment = {
  production: ${production},
  apiUrl: '${apiUrl}',
  mainDomain: '${mainDomain}',
};
`;

// Generate environment.prod.ts content
const environmentProdContent = `export const environment = {
  production: true,
  apiUrl: '${apiUrl}',
  mainDomain: '${mainDomain}',
};
`;

// Write to environment files (for build-time configuration)
const targetPath = path.resolve(__dirname, '../src/environments/environment.ts');
const targetProdPath = path.resolve(__dirname, '../src/environments/environment.prod.ts');

fs.writeFileSync(targetPath, environmentContent);
fs.writeFileSync(targetProdPath, environmentProdContent);

console.log('✅ Environment files generated successfully!');
console.log('✅ Config.json created for runtime configuration!');
console.log(`API_URL: ${apiUrl}`);
console.log(`MAIN_DOMAIN: ${mainDomain}`);
console.log(`PRODUCTION: ${production}`);
