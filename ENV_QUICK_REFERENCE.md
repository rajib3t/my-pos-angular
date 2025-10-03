# Environment Variables - Quick Reference

## 🚀 Quick Start

### 1. Edit your environment variables
```bash
# Edit .env file
API_URL=http://localhost:8087
MAIN_DOMAIN=mypos.local
PRODUCTION=false
```

### 2. Start development
```bash
npm start  # or bun start
```
✅ Config automatically generated!

---

## 📝 Available Commands

| Command | What It Does |
|---------|-------------|
| `npm run config` | Manually generate config files |
| `npm start` | Start dev server (auto-generates config) |
| `npm run build` | Build for production (auto-generates config) |
| `npm run build:prod` | Production build |

---

## 💻 Using Config in Your Code

### Method 1: ConfigService (Dynamic - Recommended)
```typescript
import { ConfigService } from '@/app/services/config.service';

constructor(private config: ConfigService) {
  const apiUrl = this.config.apiUrl;
  const mainDomain = this.config.mainDomain;
  const isProduction = this.config.isProduction;
}
```

### Method 2: Environment File (Static)
```typescript
import { environment } from '@/environments/environment';

const apiUrl = environment.apiUrl;
const mainDomain = environment.mainDomain;
const production = environment.production;
```

---

## 📂 Generated Files

| File | Generated | Use |
|------|-----------|-----|
| `src/environments/environment.ts` | ✅ Auto | Build-time dev config |
| `src/environments/environment.prod.ts` | ✅ Auto | Build-time prod config |
| `public/config.json` | ✅ Auto | Runtime config (editable!) |

---

## 🎯 Common Tasks

### Change API URL for development
1. Edit `.env`: `API_URL=http://localhost:9000`
2. Restart server: `npm start`

### Change config after deployment
1. Find `dist/browser/config.json`
2. Edit JSON directly:
   ```json
   {
     "apiUrl": "https://api.production.com",
     "mainDomain": "mypos.com",
     "production": true
   }
   ```
3. Reload app - **No rebuild needed!** 🎉

### Add new environment variable
1. Add to `.env`: `NEW_VAR=value`
2. Update `scripts/set-env.js` to include it
3. Update `ConfigService` interface
4. Run `npm run config`

---

## ⚠️ Important Notes

✅ **DO:**
- Use ConfigService for deployment-specific values
- Edit config.json in production if needed
- Keep .env in .gitignore
- Use .env.example as a template

❌ **DON'T:**
- Commit .env file
- Put secrets in config.json (it's public!)
- Hardcode URLs in components
- Forget to run config generation

---

## 🔧 Troubleshooting

### Config not updating?
```bash
# Manually regenerate
npm run config

# Check generated files
cat public/config.json
cat src/environments/environment.ts
```

### App can't load config?
- Check browser console for HTTP errors
- Verify `public/config.json` exists
- Ensure APP_INITIALIZER is in `app.config.ts`

### Values are static?
- Make sure you're using `ConfigService`, not `environment`
- Verify `config.json` is being served correctly

---

## 📚 Documentation

- **Full Guide**: `ENV_CONFIG_GUIDE.md`
- **Architecture**: `ENV_ARCHITECTURE.md`
- **Summary**: `ENV_SETUP_SUMMARY.md`
- **This File**: `ENV_QUICK_REFERENCE.md`

---

## ✨ Key Benefits

🔄 **No rebuild needed** - Edit config.json after deployment
🚀 **Fast development** - Automatic config generation
🎯 **Type-safe** - ConfigService provides IntelliSense
🔒 **Secure** - .env never committed to git
📦 **Flexible** - Both static and dynamic options
