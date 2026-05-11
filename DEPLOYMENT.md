# Deployment Guide: Kosem E-commerce (Hostinger)

This guide walks you through deploying your Next.js application to Hostinger Premium Web Hosting using their **Node.js** feature.

## 1. Prerequisites: Check Node.js Support

Before proceeding, verify if your Hostinger plan supports Node.js:
1.  Log in to **Hostinger hPanel**.
2.  Click **Websites** and manage your domain.
3.  Look for the **Advanced** section in the left sidebar or search bar.
4.  Do you see a **Node.js** icon?
    *   **Yes**: Awesome! You can host directly on Hostinger. Proceed to "Local Preparation".
    *   **No**: Your plan is likely a basic shared plan. **Skip to the "Alternative: Vercel Deployment"** section at the bottom of this guide.

> [!WARNING]
> **Plan Specification Check**: If your plan has **1024 MB (1 GB) RAM** or less (like Single/Starter plans), building Next.js directly on Hostinger will likely fail or cause "503 Service Unavailable" errors due to memory limits.
> **Recommendation**: Use the **Vercel Deployment** method below. It is free, faster, and much more reliable for your plan specs.

## 2. Local Preparation

### A. Switch Database to MySQL
Hostinger uses MySQL. You need to update your `prisma/schema.prisma` to use MySQL instead of SQLite for production.

1.  Open `prisma/schema.prisma`.
2.  Change the provider:
    ```prisma
    datasource db {
      provider = "mysql"
      url      = env("DATABASE_URL")
    }
    ```
3.  **Note**: This will break your local dev environment if you don't have a local MySQL running. You can keep it as `sqlite` locally and only change it just before uploading, OR (better) set up a local MySQL.

### B. Update `package.json`
Your scripts are already good. Ensure you have:
```json
"scripts": {
  "build": "next build",
  "start": "next start"
}
```

## 2. Hostinger Setup (hPanel)

1.  **Create MySQL Database**:
    *   Go to **Databases** > **MySQL Databases**.
    *   Create a new database (e.g., `u12345_attar`).
    *   Create a user (e.g., `u12345_admin`) and password.
    *   **Note down** the Database Name, User, Password, and Host (usually `localhost` or an IP).

2.  **Setup Node.js**:
    *   Go to **Advanced** > **Node.js**.
    *   Select your domain.
    *   **Node.js Version**: Choose **18** or **20** (Recommended).
    *   **Application Startup File**: `node_modules/.bin/next` (or sometimes `server.js` if you build a custom server, but standard Next.js often works with default). *Correction*: For Hostinger, the best way for Next.js is often `npm start` which runs `next start`. Hostinger asks for a "Startup File". You can create a file named `app.js` in the root with:
        ```javascript
        const { createServer } = require('http');
        const { parse } = require('url');
        const next = require('next');
        const dev = process.env.NODE_ENV !== 'production';
        const hostname = 'localhost';
        const port = 3000;
        const app = next({ dev, hostname, port });
        const handle = app.getRequestHandler();
        app.prepare().then(() => {
          createServer(async (req, res) => {
            const parsedUrl = parse(req.url, true);
            await handle(req, res, parsedUrl);
          }).listen(port, () => {
            console.log(`> Ready on http://${hostname}:${port}`);
          });
        });
        ```
        And set "Application Startup File" to `app.js`.

3.  **Environment Variables**:
    *   In the Node.js settings, add your variables:
        *   `DATABASE_URL`: `mysql://USER:PASSWORD@HOST:3306/DB_NAME` (Fill in your DB details).
        *   `JWT_SECRET`: `your-secure-random-string`.
        *   `NODE_ENV`: `production`.

## 3. Upload & Build

1.  **Zip Project**:
    *   Delete the `.next`, `node_modules`, and `.git` folders locally.
    *   Zip the remaining files (`app`, `public`, `prisma`, `package.json`, `next.config.js`, etc.).

2.  **Upload**:
    *   Go to **File Manager**.
    *   Navigate to your domain folder (e.g., `public_html`).
    *   Upload and Extract your Zip file.

3.  **Install & Build**:
    *   Go back to **Node.js** settings in hPanel.
    *   Click **Install NPM Packages** (this runs `npm install`).
    *   Once done, you need to run the build command. Hostinger GUI might not have a direct "Build" button.
    *   **Option A (SSH - Recommended)**:
        *   Enable SSH access in Hostinger.
        *   Connect via Terminal: `ssh u12345@ip_address`.
        *   Navigate to folder: `cd domains/yourdomain.com/public_html`.
        *   Run: `npm run build`.
        *   Run: `npx prisma migrate deploy` (to create tables in MySQL).
    *   **Option B (Local Build)**:
        *   If SSH is hard, you can run `npm run build` LOCALLY (after switching Prisma to MySQL and pointing `DATABASE_URL` to your Hostinger DB temporarily, OR just build locally and assume schema matches).
        *   Then upload the `.next` folder. *Note: Node versions must match exactly for binary compatibility.*

4.  **Start Server**:
    *   After build (and creating `app.js`), click **Restart** in the Node.js settings.

## Troubleshooting
*   **503 Error**: Means Node app didn't start. Check `error_log` in File Manager.
*   **Database Error**: Check `DATABASE_URL` syntax roughly.
*   **Images**: Ensure your `public` folder is uploaded.

---

## Alternative: Vercel Deployment (Recommended if no VPS/Node.js)

If your Hostinger plan does **not** support Node.js (or you don't have a VPS):

1.  **Create a GitHub Repository**:
    *   Push your code to a new GitHub repo.

2.  **Deploy on Vercel**:
    *   Go to [Vercel.com](https://vercel.com) -> "Add New Project".
    *   Import your GitHub repo.
    *   Framework Preset: **Next.js**.

3.  **Database Connection**:
    *   You can still use your Hostinger MySQL database!
    *   In Hostinger: Go to **Databases** -> **Remote MySQL**.
    *   Add the IP `Any` (or Vercel's IP range) to allow remote connections.
    *   In Vercel: Add Environment Variable `DATABASE_URL` = `mysql://USER:PASSWORD@HOST:3306/DB_NAME`.

4.  **Deploy**:
    *   Click "Deploy". Vercel handles the build and server automatically.
