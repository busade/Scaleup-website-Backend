# ScaleUp API

Minimal Express setup with logging and Swagger documentation (using ES modules).

## Available scripts

- `npm start` - run production server (ESM enabled via `type": "module"`)
- `npm run dev` - start server with nodemon for development

## Logging

Uses **winston** for application logs and **morgan** to log HTTP requests through winston.

## Utilities

Helper modules (logger, swagger spec, and DB connection) live in the `src/utils` folder.

## API Documentation

Swagger UI is available at [`/api-docs`](http://localhost:3000/api-docs) once the server is running.

## Getting started

1. Install dependencies: `npm install`
2. Create a `.env` file in the project root containing a valid `MONGO_URI` (dotenv is used to load it). Example:
   ```env
   MONGO_URI=mongodb://localhost:27017/scaleup
   ```
   (If `MONGO_URI` is absent, the app will try the local default URI.)
3. Start server: `npm run dev`
4. Open browser to `http://localhost:3000/api-docs`

## New Endpoint

- `POST /api/contact` – send a message through the contact form. Requires `name`, `email`, `subject`, and `message` in the JSON body.

### Email Notifications

The contact form now sends confirmation emails to users and admin notifications using **SendGrid** (recommended) or **Nodemailer** as a fallback.

#### SendGrid Setup (Recommended)

1. **Get your SendGrid API Key**:
   - Sign up for [SendGrid](https://sendgrid.com/)
   - Go to Settings → API Keys
   - Create a new API key with "Mail Send" permissions

2. **Add to your `.env` file**:
   ```env
   SENDGRID_API_KEY=your_api_key_here
   SENDGRID_FROM_EMAIL=noreply@yourdomain.com
   ADMIN_EMAIL=admin@yourdomain.com
   ```

#### Alternative: SMTP Setup (Fallback)

If you don't provide a SendGrid API key, the app will use SMTP (Nodemailer). Add to your `.env` file:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_SECURE=false
ADMIN_EMAIL=admin@yourdomain.com
```

**Note**: The `@sendgrid/mail` package is already included in dependencies. If using SMTP only, `nodemailer` is also included.


## Google Sheets Integration Setup

To sync volunteer applications with a Google Sheet, follow these steps:

1.  **Create a Google Sheet**: Create a new spreadsheet and copy its **Sheet ID** from the URL (the string between `/d/` and `/edit`).
2.  **Google Cloud Console**:
    *   Enable the **Google Sheets API**.
    *   Create a **Service Account** and download its **JSON Key**.
3.  **Share the Sheet**: Open your spreadsheet, click "Share", and add the `client_email` from your JSON key as an **Editor**.
4.  **Environment Variables**: Add the following to your `.env` file:
    *   `GOOGLE_SERVICE_ACCOUNT_EMAIL`: The `client_email` from your JSON key.
    *   `GOOGLE_PRIVATE_KEY`: The `private_key` from your JSON key (ensure it's in a single line with `\n` characters).
    *   `GOOGLE_SHEET_ID`: The ID from your spreadsheet URL.
