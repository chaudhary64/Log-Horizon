<div align="center">

# ⬛ Log Horizon

**Stop Hoarding. Start Organizing.**

A modern, high-contrast Kanban board for links and ideas built with a strict Brutalist Design System.

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)

[Report Bug](https://github.com/chaudhary64/Log-Horizon/issues) · [Request Feature](https://github.com/chaudhary64/Log-Horizon/issues)

</div>

<br />

## ✨ Features

- 🏗️ **Brutalist UI/UX** — High contrast, sharp edges, and tactile hover states powered by vanilla CSS.
- 📋 **Kanban Board** — Fluid drag-and-drop task management powered by `@hello-pangea/dnd`.
- 🔗 **Automated Link Previews** — Paste a URL to instantly fetch OpenGraph metadata (title, description, image).
- 🔍 **Command Palette** — Global `Cmd+K` search bar for instant filtering by title, category, or domain.
- 🔒 **Secure Auth** — Built-in JSON Web Token (JWT) authentication using HTTP-only cookies.
- 📱 **Fully Responsive** — Works flawlessly on desktop, tablet, and mobile.

<br />

## 🛠️ Tech Stack

<details>
  <summary>Click to expand</summary>

- **Framework**: [Next.js (App Router)](https://nextjs.org/)
- **UI Library**: [React 19](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [MongoDB](https://www.mongodb.com/) + [Mongoose](https://mongoosejs.com/)
- **Auth**: [Jose](https://github.com/panva/jose) (JWT)
- **Drag & Drop**: [@hello-pangea/dnd](https://github.com/hello-pangea/dnd)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Metadata**: [link-preview-js](https://www.npmjs.com/package/link-preview-js)
</details>

<br />

## 📁 Architecture

Organized by feature using Next.js App Router best practices.

```text
src/
├── app/                  # Next.js App Router (Pages, APIs)
├── components/           
│   ├── kanban/           # Core board logic (KanbanBoard, Column, TaskCard)
│   ├── layout/           # Global shell components (Navbar, CommandPalette)
│   └── ui/               # Reusable primitives (Toast, Modals)
├── contexts/             # React Context Providers
├── lib/                  # Core Utilities (Auth, DB connection)
├── models/               # Mongoose Schemas
└── styles/               # Global CSS Modules
```

<br />

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/chaudhary64/Log-Horizon.git
cd Log-Horizon
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env.local` file in the root directory:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
```

### 4. Run the development server
```bash
npm run dev
```
Navigate to `http://localhost:3000` to view the application.

<br />

## 🎨 Design Philosophy

Log Horizon leans heavily into a digital **Brutalist Aesthetic**, rejecting the soft, round "same-y" feel of modern web templates:

- **Sharp Edges**: `0px` border-radius across the board.
- **Harsh Shadows**: Solid color, offset box-shadows (e.g., `4px 4px 0px`).
- **Tactile Feedback**: Elements physically translate on the screen when hovered.
- **Typography**: Heavy use of the `Space Grotesk` typeface for high legibility and a mechanical feel.

---

<div align="center">
  Built with ❤️ using Next.js
</div>
