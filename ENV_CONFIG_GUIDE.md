# Environment Configuration Guide

This Angular application uses a hybrid approach for environment configuration that supports both build-time and runtime configuration changes.

## How It Works

1. **`.env` file**: Store your environment variables
2. **`scripts/set-env.js`**: Generates configuration files from `.env`
3. **`public/config.json`**: Runtime configuration loaded by the app
4. **`ConfigService`**: Angular service that loads and provides config values

## Setup

### 1. Configure Environment Variables

Edit `.env` file in the project root:

```env
API_URL=http://localhost:8087
MAIN_DOMAIN=mypos.local
PRODUCTION=false
```

### 2. Generate Configuration

The configuration is automatically generated when you run:

```bash
npm start        # Auto-runs before starting dev server
npm run build    # Auto-runs before building
npm run config   # Manual generation
```

## Usage in Your Code

### Option 1: Using ConfigService (Recommended - Dynamic)

```typescript
import { ConfigService } from './services/config.service';

export class MyComponent {
  constructor(private configService: ConfigService) {}

  ngOnInit() {
    // Access dynamic configuration
    const apiUrl = this.configService.apiUrl;
    const mainDomain = this.configService.mainDomain;
    const isProduction = this.configService.isProduction;
    
    // Or get the full config object
    const config = this.configService.getConfig();
  }
}
```

### Option 2: Using environment files (Build-time - Static)

```typescript
import { environment } from '../environments/environment';

export class MyComponent {
  apiUrl = environment.apiUrl;
  mainDomain = environment.mainDomain;
  production = environment.production;
}
```

## Key Differences

### ConfigService (Runtime - Dynamic)
✅ Can be changed without rebuilding
✅ Perfect for deployment-time configuration
✅ Loads from `public/config.json`
❌ Slightly slower (async HTTP request on startup)

### environment.ts (Build-time - Static)
✅ Faster (no HTTP request needed)
✅ Tree-shakeable and optimizable
❌ Requires rebuild to change values
❌ Baked into bundle at build time

## Deployment

### Development
```bash
npm start
```

### Production Build
```bash
npm run build:prod
```

After deployment, you can modify `config.json` in the dist folder to change configuration without rebuilding:

```bash
# In your deployed app
cd dist/browser
nano config.json  # Edit the config
```

This is useful for:
- Changing API endpoints per environment
- Updating domains without rebuilding
- Quick configuration changes in production

## Files Generated

- `src/environments/environment.ts` - Development environment (build-time)
- `src/environments/environment.prod.ts` - Production environment (build-time)
- `public/config.json` - Runtime configuration (dynamic)

## Best Practices

1. **Never commit `.env`** - It's already in `.gitignore`
2. **Use ConfigService** for values that might change between deployments
3. **Use environment.ts** for values that are truly static
4. **Create `.env.example`** to document required variables

## Example .env.example

```env
# Backend API URL
API_URL=http://localhost:8087

# Main domain for the application
MAIN_DOMAIN=mypos.local

# Production mode
PRODUCTION=false
```
