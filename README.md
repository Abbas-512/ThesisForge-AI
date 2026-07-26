# ThesisForge AI

ThesisForge AI is an intelligent assistant designed to transform final-year (capstone) project ideas into comprehensive, structured project plans for university students.

---

## Features

ThesisForge AI generates 9 specialized planning modules for any capstone concept:

1. **AI Project Analysis**: Scope assessment, strengths, risks, and refinements.
2. **Objectives Generator**: Specific, measurable primary and secondary objectives.
3. **Functional Requirements**: Clear, testable system requirement statements.
4. **Non-Functional Requirements**: Measurable criteria for performance, security, usability, and maintainability.
5. **Technology Stack**: Recommended layers, alternative trade-offs, and learning curve notes.
6. **Database Planning**: Core entities, relationships, constraints, and data volume notes.
7. **Development Timeline**: Week-by-week term breakdown with key milestones.
8. **Feasibility Score**: AI-scored evaluation (0–100) with rating band and detailed justification.
9. **Supervisor Feedback**: Simulated academic supervisor review and key examiner questions.

---

## Tech Stack

- **Framework**: React 19 + TanStack Start (SSR & Server Functions) + TanStack Router
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4 + Lucide Icons + Sonner Toasts
- **Language**: TypeScript
- **AI Integration**: Official `@google/genai` SDK (`gemini-3.6-flash`)

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm / bun

### 1. Installation

```bash
git clone https://github.com/Abbas-512/thesis-plan-forge.git
cd thesis-plan-forge
npm install
```

### 2. Environment Variables

Create a `.env` file in the project root based on `.env.example`:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

Get a free Gemini API key from [Google AI Studio](https://aistudio.google.com/).

### 3. Development Server

Start the local development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Production Build

To test the production build locally:

```bash
npm run build
npm run preview
```

---

## Deployment (Vercel)

This project is built with TanStack Start and standard Vite/Node server functions, making it fully ready for Vercel deployment:

1. Push your repository to GitHub.
2. Import the project in [Vercel](https://vercel.com).
3. Set the Environment Variable:
   - `GEMINI_API_KEY`: Your Google Gemini API Key
4. Deploy!

---

## Project Structure

```
.
├── .env.example              # Environment variables template
├── README.md                 # Project documentation
├── components.json           # UI components config
├── package.json              # Dependencies and scripts
├── src/
│   ├── components/           # UI and Markdown rendering components
│   │   ├── markdown.tsx
│   │   └── ui/               # Radix / Tailwind UI elements
│   ├── lib/                  # Utilities, prompts, and server functions
│   │   ├── generate.functions.ts  # TanStack Server Function calling @google/genai
│   │   ├── prompts.server.ts     # System prompts for all 9 modules
│   │   ├── modules.ts            # Shared module definitions
│   │   ├── project-store.ts      # Client session state
│   │   └── export-plan.ts        # Printable PDF export generator
│   ├── routes/               # TanStack Router page routes
│   │   ├── __root.tsx        # Root layout & shell
│   │   ├── index.tsx         # Landing page
│   │   ├── new-project.tsx   # Project setup form
│   │   └── workspace.tsx     # Planning workspace & module generator
│   ├── router.tsx            # Router configuration
│   ├── server.ts            # SSR entry point
│   └── styles.css            # Global CSS with Tailwind setup
└── vite.config.ts            # Vite configuration
```
