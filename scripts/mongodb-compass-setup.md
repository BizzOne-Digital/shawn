# MongoDB + Prisma setup (Windows / Compass)

Prisma **requires a MongoDB replica set** for writes (seed, register, admin, etc.).

## Quick fix (Administrator PowerShell)

**Cursor's built-in terminal is not Administrator** — running `.\scripts\enable-mongodb-replica.ps1` there will fail.

1. **Stop dev server** (`Ctrl+C` on `npm run dev`) — avoids EPERM on Prisma engine file
2. Open **PowerShell as Administrator** (Windows key → type PowerShell → right-click → **Run as administrator**)
3. Run:

```powershell
cd "E:\2sri nokri\shawn"
.\scripts\enable-mongodb-replica.ps1
```

Or right-click `scripts\setup-mongodb-admin.bat` → **Run as administrator**.

This will:
- Add `replSetName: rs0` to `mongod.cfg`
- Restart MongoDB
- Initialize replica set
- Run seed (admin + demo data)

## No Administrator? Use dev MongoDB on port 27018

```powershell
cd "E:\2sri nokri\shawn"
npm run db:dev-mongo
```

Then set in `.env`:

```
DATABASE_URL="mongodb://127.0.0.1:27018/letsgobuffalo?directConnection=true"
```

And run:

```bash
npm run db:setup
```

Compass: connect to `mongodb://127.0.0.1:27018` (database `letsgobuffalo`).

## Manual steps

If the script fails, do it manually:

### 1. Edit MongoDB config (Admin)

File: `C:\Program Files\MongoDB\Server\8.2\bin\mongod.cfg`

Add:

```yaml
replication:
  replSetName: rs0
```

### 2. Restart MongoDB

```powershell
Restart-Service MongoDB
```

### 3. Init + seed (normal terminal)

```bash
npm run db:init-replica
npm run db:seed
```

## Login credentials (after seed)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@letsgobuffalo.com | Demo123! |
| Owner | owner1@example.com | Demo123! |

Admin panel: http://localhost:3000/admin

## Compass connection

```
mongodb://127.0.0.1:27017
```

Database: `letsgobuffalo`
