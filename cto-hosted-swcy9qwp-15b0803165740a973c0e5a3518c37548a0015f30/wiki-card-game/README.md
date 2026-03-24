# Wiki Cards

A minimalist Apple-style Wikipedia Trading Card Game featuring pack opening, collection management, and real-time multiplayer battles.

## Features

- 🎴 **Pack Opening** - Open packs to collect Wikipedia articles as cards
- 📚 **Collection Management** - Build your collection with a 25-card limit
- ⚔️ **Deck Building** - Select 5 cards for your battle deck
- 🎮 **Real-time Battles** - Battle other players with 4-digit room codes
- 🍎 **Apple Design** - Clean, minimal interface with smooth animations

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations and 3D card flips
- **Supabase** - Database and real-time subscriptions
- **Wikipedia API** - Dynamic card content

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase account

### Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/wiki-cards.git
cd wiki-cards
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run database migrations in Supabase SQL Editor (see `supabase/migrations/001_initial_schema.sql`)

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

## Game Mechanics

### Card Stats
Cards are generated from random Wikipedia articles with stats based on:
- **Power**: Calculated from article length (longer = more powerful)
- **Defense**: Based on extract word count
- **Rarity**: Common, Rare, Epic, Legendary based on total stats

### Collection Limits
- Maximum 25 cards in collection
- Sell cards for 10 gems each
- Build a 5-card battle deck

### Battle System
- Create a room with a 4-digit code
- Share the code with an opponent
- First player to reduce opponent's health to 0 wins
- Real-time updates via Supabase subscriptions

## Database Schema

See `supabase/migrations/001_initial_schema.sql` for complete schema.

## License

MIT
