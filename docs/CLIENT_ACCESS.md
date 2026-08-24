# Client Access — Let's Go Buffalo

## Live site
**https://lets-go-buffalo.vercel.app**

---

## Admin panel (manage categories, businesses, users)

**Admin sign-in (staff only — do not use the public login page):**  
https://lets-go-buffalo.vercel.app/admin-login

| Field | Value |
|-------|--------|
| **Email** | `admin@letsgobuffalo.com` |
| **Password** | `Demo123!` |

After signing in, you will be taken to **https://lets-go-buffalo.vercel.app/admin**

> **Security:** Admin accounts cannot sign in through `/login`. Use `/admin-login` only.

### First-time admin setup
1. Go to **Admin → Categories** — add your categories and subcategories.
2. Go to **Admin → Locations** — add towns/cities (these power search filters when listed).
3. Review business submissions under **Admin → Moderation**.

---

## Business owner signup (for testing)

**Register:** https://lets-go-buffalo.vercel.app/register

- **Business Name** = your company name (not personal name)
- **Password rules:** At least 6 characters

After registering, sign in and go to **Dashboard → Add Business** to submit a listing.

---

## New pages
| Page | URL |
|------|-----|
| Community Fan Page | `/community` |
| Gear Shop | `/gear` |
| @LetsGoBuffalo Email | `/lgb-email` |
| Directory | `/directory` |
| Advertise | `/advertise` |

---

## Change admin password
After first login, use **Dashboard → Settings** or contact your developer to update the admin password in production.

---

## Production deployment (Vercel)

Set these environment variables on Vercel:

```
DATABASE_URL=mongodb+srv://USER:PASS@cluster.mongodb.net/letsgobuffalo?retryWrites=true&w=majority
AUTH_SECRET=<long random string>
AUTH_URL=https://lets-go-buffalo.vercel.app
NEXT_PUBLIC_SITE_URL=https://lets-go-buffalo.vercel.app
```

Then seed the production database once (from your developer machine, with `DATABASE_URL` pointing to Atlas):

```bash
npm run db:setup
```

This creates the admin account and site settings. **MongoDB Atlas includes a replica set by default** — required for sign-up and writes.

After deploy, verify:
- https://lets-go-buffalo.vercel.app/directory
- https://lets-go-buffalo.vercel.app/register (test sign-up)
- https://lets-go-buffalo.vercel.app/admin-login (admin staff only)
