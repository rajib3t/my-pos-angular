# Environment Variable Flow Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         .env File (Source)                          │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │  API_URL=http://localhost:8087                              │   │
│  │  MAIN_DOMAIN=mypos.local                                    │   │
│  │  PRODUCTION=false                                           │   │
│  └────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              │ npm start / npm run build
                              │ (runs: npm run config)
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   scripts/set-env.js (Generator)                    │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │  1. Read .env file                                          │   │
│  │  2. Parse environment variables                             │   │
│  │  3. Generate environment.ts                                 │   │
│  │  4. Generate environment.prod.ts                            │   │
│  │  5. Generate public/config.json                             │   │
│  └────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
                    ▼                   ▼
┌──────────────────────────┐  ┌──────────────────────────┐
│   Build-Time (Static)    │  │   Runtime (Dynamic)      │
│                          │  │                          │
│  environment.ts          │  │  public/config.json      │
│  environment.prod.ts     │  │                          │
│                          │  │  {                       │
│  export const            │  │    "apiUrl": "...",     │
│  environment = {         │  │    "mainDomain": "...", │
│    apiUrl: "...",       │  │    "production": false  │
│    mainDomain: "...",   │  │  }                       │
│    production: false     │  │                          │
│  }                       │  │                          │
│                          │  │                          │
│  ✓ Fast (no HTTP)       │  │  ✓ Editable after build │
│  ✗ Requires rebuild     │  │  ✗ HTTP request needed  │
└──────────────────────────┘  └──────────────────────────┘
            │                             │
            │                             │
            ▼                             ▼
┌──────────────────────────┐  ┌──────────────────────────┐
│   Usage in Code          │  │   Usage in Code          │
│                          │  │                          │
│  import { environment }  │  │  ConfigService           │
│  from 'environments'     │  │                          │
│                          │  │  constructor(            │
│  apiUrl =                │  │    private config:       │
│    environment.apiUrl    │  │      ConfigService       │
│                          │  │  ) {}                    │
│                          │  │                          │
│                          │  │  url = this.config.apiUrl│
└──────────────────────────┘  └──────────────────────────┘
```

## Application Startup Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Angular App Starts                           │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│              APP_INITIALIZER (app.config.ts)                        │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │  export function initializeApp(config: ConfigService) {    │   │
│  │    return () => config.loadConfig();                        │   │
│  │  }                                                          │   │
│  └────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                ConfigService.loadConfig()                           │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │  1. HTTP GET /config.json                                   │   │
│  │  2. Parse JSON response                                     │   │
│  │  3. Store in memory                                         │   │
│  │  4. Return Promise<AppConfig>                               │   │
│  └────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│           Configuration Ready - App Components Load                 │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │  ApiService: uses ConfigService.apiUrl                      │   │
│  │  AuthInterceptor: uses ConfigService.apiUrl                 │   │
│  │  TenantComponents: uses ConfigService.mainDomain            │   │
│  └────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

## File System Structure

```
my-pos/
├── .env                          # 🔒 Local environment variables (gitignored)
├── .env.example                  # 📝 Template for required variables
├── package.json                  # 📦 Contains prestart & prebuild scripts
│
├── scripts/
│   └── set-env.js               # 🔧 Generator script (Node.js)
│
├── public/
│   └── config.json              # 🌐 Runtime config (auto-generated, served)
│
├── src/
│   ├── environments/
│   │   ├── environment.ts       # 🏗️ Dev config (auto-generated)
│   │   └── environment.prod.ts  # 🏗️ Prod config (auto-generated)
│   │
│   └── app/
│       ├── app.config.ts        # ⚙️ Modified (APP_INITIALIZER added)
│       │
│       ├── services/
│       │   ├── config.service.ts    # 📡 NEW: Runtime config service
│       │   ├── api.service.ts       # ✏️ Modified (uses ConfigService)
│       │   └── ...
│       │
│       ├── interceptors/
│       │   └── auth.interceptor.ts  # ✏️ Modified (uses ConfigService)
│       │
│       └── pages/
│           └── main/tenant/
│               ├── create/          # ✏️ Modified (uses ConfigService)
│               └── list/            # ✏️ Modified (uses ConfigService)
│
└── dist/                         # 📦 Build output
    └── browser/
        ├── config.json          # 🎯 Can edit this in production!
        └── ...                   # Bundled app files
```

## Deployment Scenarios

### Scenario 1: Development
```
1. Edit .env
2. npm start
3. Auto-generates configs
4. Dev server runs with new values
```

### Scenario 2: Production Build
```
1. Edit .env
2. npm run build:prod
3. Auto-generates configs
4. Deploy dist/ folder
```

### Scenario 3: Post-Deployment Config Change
```
1. App already deployed
2. Edit dist/browser/config.json directly
3. Restart web server (or just reload page)
4. New values take effect immediately
5. NO REBUILD NEEDED! 🎉
```

## Benefits Summary

| Aspect | Static (environment.ts) | Dynamic (ConfigService) |
|--------|------------------------|------------------------|
| Speed | ⚡ Instant | 🌐 HTTP request |
| Rebuild Required | ✅ Yes | ❌ No |
| Production Editable | ❌ No | ✅ Yes |
| Type Safety | ✅ Compile-time | ⚠️ Runtime only |
| Bundle Size | ✅ Optimized | ✅ Minimal impact |
| Use Case | True constants | Deployment configs |

## Best Practices

1. **Use ConfigService for**: API URLs, domains, feature flags, deployment-specific values
2. **Use environment.ts for**: Build flags, truly static constants, compile-time values
3. **Never commit**: `.env` file (use `.env.example` as template)
4. **Security**: Don't put secrets in `config.json` (it's public!)
5. **Testing**: Use separate `.env` files for different environments
