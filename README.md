# Site Health Doctor

A clean, modern web tool for viewing WordPress Site Health information. Built for support teams who need to quickly understand site configurations without the clutter.

## Features

- 📋 **Simple Input**: Paste WordPress Site Health info directly from WordPress admin
- 🔍 **Smart Parser**: Automatically converts raw text into structured, readable format
- 📊 **Visual Dashboard**: Clean summary panel with key metrics and status indicators
- 📁 **Organized Sections**: Collapsible categories for WordPress, Server, Theme, Plugins, Database, and Cron
- 🔗 **Share Links**: Generate unique URLs to share reports with team members
- 🔒 **Privacy**: Option to strip sensitive data (emails, domains, file paths) before sharing
- 🌙 **Dark Mode**: Toggle between light and dark themes
- 📱 **Responsive**: Works beautifully on desktop, tablet, and mobile devices

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm start
```

## How to Use

1. In WordPress, go to **Tools → Site Health → Info**
2. Click **"Copy site info to clipboard"**
3. Paste the copied text into Site Health Doctor
4. Click **"Parse & View Report"**
5. Review the formatted report with collapsible sections
6. Optionally check **"Strip sensitive data"** and click **"Generate Share Link"** to create a shareable URL

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Vercel KV** (Redis) for persistent storage

## Project Structure

```
├── app/
│   ├── api/share/          # API route for saving reports
│   ├── share/[id]/         # Shared report viewer page
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Main dashboard page
├── components/
│   ├── CollapsibleSection.tsx
│   ├── DataDisplay.tsx
│   ├── DarkModeToggle.tsx
│   ├── SummaryPanel.tsx
│   └── ThemeProvider.tsx
├── lib/
│   ├── parser.ts           # WordPress Site Health parser
│   └── store.ts            # Data storage utilities (Vercel KV)
```

## Data Storage

This application uses **Vercel KV** (Redis) for persistent storage of shared reports. This ensures data persists across serverless function invocations.

### Setting up Vercel KV

1. Go to your Vercel project dashboard
2. Navigate to **Storage** → **Create Database** → **KV**
3. Create a new KV database (or use an existing one)
4. The environment variables (`KV_URL`, `KV_REST_API_URL`, `KV_REST_API_TOKEN`, `KV_REST_API_READ_ONLY_TOKEN`) will be automatically added to your project

For local development, create a `.env.local` file with:
```
KV_REST_API_URL=your_kv_url
KV_REST_API_TOKEN=your_kv_token
KV_REST_API_READ_ONLY_TOKEN=your_readonly_token
```

**Note**: Vercel KV automatically provides these environment variables in production. You only need to set them locally if testing the storage functionality.

## License

MIT

