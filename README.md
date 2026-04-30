# NastaRead - Distributed Urdu OCR Frontend

A modern, interactive web interface for the Distributed Urdu OCR system built with **Next.js 15**, **React 19**, **TypeScript**, and **Tailwind CSS**.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Development](#development)
- [Building](#building)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Scripts](#scripts)

## 🎯 Overview

NastaRead is the frontend application for a distributed system designed to perform Optical Character Recognition (OCR) on Urdu text documents. The interface provides an interactive, visually stunning presentation of the system's capabilities, architecture, and a live demo simulator.

The application features:
- **Hero Section** - Introduction and call-to-action
- **Data Story Section** - Dataset information and statistics
- **Pipeline Section** - OCR pipeline architecture overview
- **Benchmark Section** - Performance metrics and benchmarks
- **Distributed Architecture Section** - System architecture visualization
- **Demo Simulator** - Interactive demonstration of the OCR system

## ✨ Features

- **Modern UI Components** - Built with Radix UI primitives for accessibility
- **Custom Animations** - Shader-based visual effects and smooth animations
- **Responsive Design** - Fully responsive across all device sizes
- **Horizontal Scroll Navigation** - Unique scrolling experience for different sections
- **Dark/Light Theme Support** - Theme switching via next-themes
- **Interactive Charts** - Performance visualization with Recharts
- **Form Handling** - Robust form management with React Hook Form and Zod validation
- **File Operations** - ZIP file handling and extraction
- **Graph Visualization** - Component flow diagrams with XY Flow

## 🛠 Tech Stack

### Core Framework
- **Next.js 15.5.6** - React framework with App Router
- **React 19.2.0** - UI library
- **TypeScript 5.x** - Type safety

### UI & Styling
- **Tailwind CSS 4.1.9** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icon library
- **class-variance-authority** - Component variant management

### Forms & Validation
- **React Hook Form 7.60** - Form state management
- **@hookform/resolvers** - Schema validation adapters
- **Zod 3.25** - TypeScript-first schema validation

### Data & Visualization
- **Recharts 2.15** - React charting library
- **Date-fns 4.1** - Date utilities
- **React Day Picker** - Calendar component

### Advanced Features
- **@xyflow/react 12.10** - Graph visualization
- **jszip 3.10** - ZIP file handling
- **Embla Carousel** - Carousel component
- **Shaders** - WebGL shader effects
- **next-themes** - Theme management
- **Sonner** - Toast notifications
- **Vaul** - Drawer component

### Development
- **ESLint** - Code linting
- **Autoprefixer** - CSS vendor prefixes
- **PostCSS** - CSS processing

## 📋 Prerequisites

- **Node.js 18+** - JavaScript runtime
- **pnpm** - Package manager (or npm/yarn)
- **Backend API** - Running on `http://localhost:8000/api`

## 🚀 Installation

1. **Clone the repository:**
```bash
cd distributed-urdu-ocr-frontend
```

2. **Install dependencies:**
```bash
pnpm install
# or
npm install
```

## 💻 Development

Start the development server:

```bash
pnpm dev
# or
npm run dev
```

The application will be available at `http://localhost:3000`

### Development Features

- **Fast Refresh** - Hot module reloading for rapid development
- **TypeScript Checking** - Type-safe development experience
- **ESLint Integration** - Code quality checks

**Note:** Build and lint errors are ignored during development for faster iteration. Address them before production builds.

## 🏗 Building

Create an optimized production build:

```bash
pnpm build
# or
npm run build
```

Start the production server:

```bash
pnpm start
# or
npm start
```

## 📁 Project Structure

```
distributed-urdu-ocr-frontend/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout with providers
│   └── page.tsx                 # Home page with main content
├── components/                   # React components
│   ├── custom-cursor.tsx        # Custom cursor implementation
│   ├── grain-overlay.tsx        # Grain texture overlay
│   ├── image-lightbox.tsx       # Image lightbox viewer
│   ├── magnetic-button.tsx      # Interactive magnetic button
│   ├── theme-provider.tsx       # Theme configuration
│   ├── ui/                      # Radix UI wrapped components
│   │   ├── button.tsx
│   │   ├── dialog.tsx
│   │   ├── form.tsx
│   │   ├── input.tsx
│   │   └── ... (other UI components)
│   ├── sections/                # Page sections
│   │   ├── hero-section.tsx     # Hero introduction
│   │   ├── data-story-section.tsx
│   │   ├── pipeline-section.tsx
│   │   ├── benchmark-section.tsx
│   │   ├── distributed-architecture-section.tsx
│   │   ├── demo-simulator.tsx
│   │   ├── kpi-strip.tsx        # KPI statistics strip
│   │   └── ... (section components)
│   └── demo/                    # Demo-related components
├── hooks/                        # Custom React hooks
├── lib/                          # Utility functions
├── public/                       # Static assets
├── styles/                       # Global styles
├── components.json              # shadcn/ui configuration
├── tailwind.config.ts           # Tailwind CSS configuration
├── tsconfig.json                # TypeScript configuration
├── next.config.mjs              # Next.js configuration
├── postcss.config.mjs           # PostCSS configuration
├── package.json                 # Project dependencies
└── README.md                    # This file
```

## ⚙️ Configuration

### Next.js Configuration (`next.config.mjs`)

- **ESLint & TypeScript** - Build errors ignored for development iteration
- **Image Optimization** - Disabled for maximum compatibility
- **API Rewrites** - Routes `/api/*` requests to `http://localhost:8000/api/*`

### Environment Setup

The application expects a backend API running at `http://localhost:8000`. Update `next.config.mjs` if your backend runs on a different port.

```javascript
// next.config.mjs
async rewrites() {
  return [
    {
      source: "/api/:path*",
      destination: "http://localhost:8000/api/:path*",
    },
  ]
}
```

### Theme Configuration

Theme support is configured via `next-themes`. Light and dark themes are available and can be toggled at runtime.

## 📝 Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server on port 3000 |
| `pnpm build` | Create optimized production build |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint on all files |

## 🔗 API Integration

The frontend communicates with the backend through API rewrites. All `/api/*` requests are proxied to `http://localhost:8000/api/*`.

### Backend Requirements

Ensure the backend API is running and accessible at `http://localhost:8000` for the demo simulator and other API-dependent features to function correctly.

## 🎨 Styling

The project uses **Tailwind CSS 4.1** with custom configurations:

- **Responsive Design** - Mobile-first approach with breakpoints for tablet and desktop
- **Custom Colors** - Brand colors defined in Tailwind config
- **Animations** - Tailwind CSS animations with custom timing
- **Dark Mode** - Full dark mode support via `next-themes`

## 🚀 Performance Optimizations

- **Image Optimization** - Configured for static hosting
- **Code Splitting** - Automatic via Next.js
- **Bundle Analysis** - Monitor bundle size regularly
- **Caching** - Leverage browser caching for static assets

## 🤝 Contributing

When contributing to this project:

1. Ensure TypeScript types are correct
2. Follow the existing component structure
3. Test responsive behavior across device sizes
4. Run `pnpm lint` before committing
5. Maintain accessibility standards with Radix UI

## 📄 License

See LICENSE file for details.

## 📞 Support

For issues or questions, please refer to the main project documentation or open an issue in the project repository.

---

**Last Updated:** April 2026
