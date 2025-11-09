
-- Create the contract_analyses table
CREATE TABLE contract_analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    name TEXT NOT NULL,
    status TEXT NOT NULL,
    risk_level TEXT,
    clauses INTEGER,
    high_risk_clauses INTEGER,
    analysis_data JSONB,
    analyzed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE contract_analyses ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow users to access their own data
CREATE POLICY "Allow individual access"
ON contract_analyses
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create a policy to allow users to read their own data
CREATE POLICY "Allow read access to own data"
ON contract_analyses
FOR SELECT
USING (auth.uid() = user_id);
