# World of Mysore Pak

Premium authentic Mysore Pak and traditional Indian sweets, handcrafted with pure ghee in Mysuru.

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS** + ShadCN UI
- **Framer Motion** (animations)
- **Three.js** (3D hero)
- **Supabase** (PostgreSQL database)

## Project Structure

```
app/           # Next.js App Router pages & API routes
src/views/     # Page-level components (Index, Shop, OurStory, etc.)
src/components/# Shared UI components
src/context/   # React context (Cart)
src/lib/       # Supabase client, API helpers, types
supabase/      # DB schema and seed SQL
public/        # Static assets
```

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```
