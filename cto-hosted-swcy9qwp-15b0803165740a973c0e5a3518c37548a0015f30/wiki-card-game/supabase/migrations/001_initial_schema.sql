-- Profiles table
CREATE TABLE profiles (
    id UUID PRIMARY KEY,
    gems INTEGER DEFAULT 0,
    last_free_pack TIMESTAMP WITH TIME ZONE
);

-- Cards table
CREATE TABLE cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wiki_id TEXT NOT NULL,
    title TEXT NOT NULL,
    image_url TEXT,
    owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    is_in_deck BOOLEAN DEFAULT false,
    stats JSONB NOT NULL DEFAULT '{"power": 0, "defense": 0}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Battles table
CREATE TABLE battles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player1_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    player2_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'waiting', -- waiting, active, completed
    winner_id UUID REFERENCES profiles(id),
    room_code TEXT UNIQUE NOT NULL,
    current_turn INTEGER DEFAULT 1,
    player1_deck JSONB,
    player2_deck JSONB,
    player1_health INTEGER DEFAULT 100,
    player2_health INTEGER DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_cards_owner ON cards(owner_id);
CREATE INDEX idx_cards_deck ON cards(owner_id, is_in_deck);
CREATE INDEX idx_battles_room ON battles(room_code);
CREATE INDEX idx_battles_status ON battles(status);

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE battles ENABLE ROW LEVEL SECURITY;

-- Profile RLS
CREATE POLICY "Profiles are viewable by everyone" ON profiles
    FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (true);

-- Cards RLS
CREATE POLICY "Users can view their own cards" ON cards
    FOR SELECT USING (true);
CREATE POLICY "Users can insert cards" ON cards
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own cards" ON cards
    FOR UPDATE USING (true);
CREATE POLICY "Users can delete their own cards" ON cards
    FOR DELETE USING (true);

-- Battles RLS
CREATE POLICY "Users can view battles" ON battles
    FOR SELECT USING (true);
CREATE POLICY "Users can create battles" ON battles
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update battles" ON battles
    FOR UPDATE USING (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE battles;
ALTER PUBLICATION supabase_realtime ADD TABLE cards;

-- Function to add gems
CREATE OR REPLACE FUNCTION add_gems(user_id UUID, amount INTEGER)
RETURNS VOID AS $$
BEGIN
    UPDATE profiles 
    SET gems = gems + amount 
    WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;
