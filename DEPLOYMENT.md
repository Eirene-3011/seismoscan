# SeismoScan — Deployment Guide

Deploy the **backend** on [Render](https://render.com) (free tier), the **database** on [TiDB Cloud](https://tidbcloud.com) (MySQL-compatible, free tier), and the **frontend** on [Netlify](https://netlify.com) (free tier).

---

## 1. Database — TiDB Cloud (MySQL)

### 1.1 Create a cluster
1. Sign up / log in at <https://tidbcloud.com>.
2. Click **Create Cluster** → choose **Serverless** (free tier).
3. Name it `seismoscan`, pick the closest region, click **Create**.
4. Wait ~30 seconds for the cluster to become active.

### 1.2 Connect & run the schema
1. In the cluster's **Overview** panel, click **Connect**.
2. Choose **General** → copy the connection string. It looks like:
   ```
   mysql://user:password@gateway01.us-east-1.prod.aws.tidbcloud.com:4000/test?ssl-mode=VERIFY_IDENTITY
   ```
3. Open a terminal with the `mysql` client and run:
   ```bash
   mysql --ssl-mode=VERIFY_IDENTITY \
     -h gateway01.us-east-1.prod.aws.tidbcloud.com \
     -P 4000 \
     -u 'your_user' \
     -p \
     < database/seismoscan.sql
   ```
   Or use the built-in **SQL Editor** in the TiDB Cloud console and paste the contents of `database/seismoscan.sql`.

### 1.3 Note the connection values
You need these for the backend environment variables:
| Variable    | Where to find it                          |
|-------------|-------------------------------------------|
| `DB_HOST`   | Hostname from the connection string        |
| `DB_PORT`   | `4000`                                    |
| `DB_USER`   | Username from the connection string        |
| `DB_PASSWORD` | Password from the connection string     |
| `DB_NAME`   | Database name (e.g. `seismoscan`)         |

> **TiDB Cloud uses TLS by default.** Add `ssl: { rejectUnauthorized: true }` if your app's `mysql2` connection config doesn't already include it. Check `backend/src/config/database.js` and add `ssl: { rejectUnauthorized: false }` for the free tier (which uses self-signed certs) or `ssl: true` for paid tiers.

---

## 2. Backend — Render (Node.js Web Service)

### 2.1 Push code to GitHub
```bash
git init
git add .
git commit -m "Initial SeismoScan commit"
gh repo create seismoscan-backend --private --source=. --push
# or: git remote add origin https://github.com/YOUR_USER/seismoscan && git push -u origin main
```
> You can push the entire monorepo or just the `backend/` folder — Render lets you set the **Root Directory**.

### 2.2 Create the Web Service
1. Go to <https://dashboard.render.com> → **New** → **Web Service**.
2. Connect your GitHub repo.
3. Configure the service:

| Setting             | Value                                   |
|---------------------|-----------------------------------------|
| **Root Directory**  | `backend`                               |
| **Runtime**         | `Node`                                  |
| **Build Command**   | `npm install`                           |
| **Start Command**   | `node src/index.js`                     |
| **Instance Type**   | Free                                    |

### 2.3 Set environment variables
In the Render service dashboard go to **Environment** → **Add Environment Variable**:

| Key              | Value                                                   |
|------------------|---------------------------------------------------------|
| `NODE_ENV`       | `production`                                            |
| `PORT`           | `10000` *(Render assigns this automatically)*           |
| `DB_HOST`        | TiDB Cloud hostname                                     |
| `DB_PORT`        | `4000`                                                  |
| `DB_USER`        | TiDB Cloud username                                     |
| `DB_PASSWORD`    | TiDB Cloud password                                     |
| `DB_NAME`        | `seismoscan`                                            |
| `JWT_SECRET`     | A random 64-character string (use `openssl rand -hex 32`) |
| `JWT_EXPIRES_IN` | `24h`                                                   |
| `UPLOAD_PATH`    | `./uploads`                                             |
| `FRONTEND_URL`   | Your Netlify URL — set this **after** deploying the frontend (step 3). For multiple origins use comma-separation: `https://seismoscan.netlify.app,https://www.seismoscan.com` |

### 2.4 Deploy
Click **Manual Deploy** → **Deploy latest commit**. Render will install dependencies and start the server.

Once live, note your backend URL, e.g.:
```
https://seismoscan-api.onrender.com
```

**Test the health endpoint:**
```bash
curl https://seismoscan-api.onrender.com/api/health
# {"status":"ok","message":"SeismoScan API is running","timestamp":"..."}
```

> **Free tier note:** Render free instances spin down after 15 minutes of inactivity and take ~30 seconds to cold-start on the next request. Upgrade to a paid plan to eliminate cold starts.

---

## 3. Frontend — Netlify (React / CRA)

### 3.1 Configure the API URL
In `frontend/netlify.toml` (already created), replace the placeholder with your Render URL:

```toml
[[redirects]]
  from = "/api/*"
  to   = "https://seismoscan-api.onrender.com/api/:splat"
  status = 200
  force  = true

[[redirects]]
  from   = "/*"
  to     = "/index.html"
  status = 200
```

### 3.2 Set the React env var
Create `frontend/.env.production`:
```
REACT_APP_API_URL=https://YOUR_NETLIFY_SITE.netlify.app
```
Because `netlify.toml` proxies `/api/*` to Render, the frontend calls `/api/...` relative to itself in production — so the value above can simply be your Netlify domain (no port, no separate backend URL).

Alternatively, set it as a Netlify environment variable (see 3.4).

### 3.3 Deploy via Netlify CLI
```bash
cd frontend
npm install -g netlify-cli
netlify login
netlify init          # follow the prompts; link to a new site
npm run build         # creates the build/ folder
netlify deploy --prod --dir=build
```

Or connect the GitHub repo via the Netlify dashboard (New site → Import from Git) and set:

| Setting             | Value            |
|---------------------|------------------|
| **Base directory**  | `frontend`       |
| **Build command**   | `npm run build`  |
| **Publish directory** | `frontend/build` |

### 3.4 Netlify environment variables (optional)
If you prefer not to commit `.env.production`, go to **Site settings → Build & deploy → Environment** and add:

| Key                  | Value                                          |
|----------------------|------------------------------------------------|
| `REACT_APP_API_URL`  | `https://YOUR_NETLIFY_SITE.netlify.app`        |

### 3.5 Update CORS on the backend
Once you have your Netlify URL, go back to Render → **Environment** and update `FRONTEND_URL`:
```
FRONTEND_URL=https://seismoscan.netlify.app
```
Then redeploy the backend (Manual Deploy).

---

## 4. Post-Deployment Checklist

- [ ] `GET /api/health` returns `{"status":"ok"}`.
- [ ] Login page loads on the Netlify URL.
- [ ] Register → login → dashboard works end-to-end.
- [ ] Creating a building and an assessment succeeds.
- [ ] Photo upload works (check that the `./uploads` directory persists — **note:** Render's free tier has an ephemeral filesystem; uploads will be lost on redeploy. For permanent storage, configure an S3-compatible bucket and update `UPLOAD_PATH` or the photo controller).
- [ ] Report export works.
- [ ] Admin user management works.

---

## 5. Environment Variable Reference

### Backend (`backend/.env`)
```env
NODE_ENV=production
PORT=10000

DB_HOST=gateway01.us-east-1.prod.aws.tidbcloud.com
DB_PORT=4000
DB_USER=your_tidb_user
DB_PASSWORD=your_tidb_password
DB_NAME=seismoscan

JWT_SECRET=replace_with_64_char_random_string
JWT_EXPIRES_IN=24h

UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880

# Comma-separated list of allowed frontend origins
FRONTEND_URL=https://seismoscan.netlify.app
```

### Frontend (`frontend/.env.production`)
```env
REACT_APP_API_URL=https://seismoscan.netlify.app
```

---

## 6. Local Development

```bash
# 1. Start MySQL (local or TiDB Cloud dev branch)
# 2. Backend
cd backend
cp .env.example .env   # fill in your values
npm install
npm start              # http://localhost:5000

# 3. Frontend (new terminal)
cd frontend
cp .env.example .env.local
# Set REACT_APP_API_URL=http://localhost:5000 in .env.local
npm install
npm start              # http://localhost:3000
```
