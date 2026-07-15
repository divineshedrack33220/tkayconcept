# TK Concepts

> Faith. Purpose. Identity.

## Tech Stack

- **Frontend**: Next.js 14+, TypeScript, Tailwind CSS, Clerk Auth
- **Backend**: Node.js, Express.js, MongoDB (Mongoose)
- **Payments**: Stripe
- **Storage**: Cloudinary
- **Deployment**: Vercel (FE), Render (BE), MongoDB Atlas (DB)

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account
- Clerk account
- Cloudinary account
- Stripe account

### Installation

```bash
# Clone repo
git clone <repo-url>
cd tkayconcept

# Backend
cd backend
cp .env.example .env  # Fill in env vars
npm install
npm run dev

# Frontend (new terminal)
cd frontend
cp .env.example .env  # Fill in env vars
npm install
npm run dev
```

### Environment Variables

See `.env.example` in both `frontend/` and `backend/` for required variables.

## Project Structure

```
tkayconcept/
├── frontend/          # Next.js App Router
├── backend/           # Express.js API
└── README.md
```
