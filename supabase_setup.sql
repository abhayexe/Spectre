-- Create the device_specs table
CREATE TABLE IF NOT EXISTS device_specs (
  id BIGSERIAL PRIMARY KEY,
  device_id UUID NOT NULL,
  system TEXT,
  node_name TEXT,
  release TEXT,
  version TEXT,
  machine TEXT,
  processor TEXT,
  cpu_brand TEXT,
  cpu_cores_physical INTEGER,
  cpu_cores_logical INTEGER,
  cpu_frequency JSONB,
  memory_total BIGINT,
  memory_available BIGINT,
  memory_percent_used FLOAT,
  disk_info JSONB,
  gpu_info JSONB,
  network_info JSONB,
  timestamp BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create an index on device_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_device_specs_device_id ON device_specs(device_id);

-- Create a policy to allow anyone to select from the table (for the frontend)
CREATE POLICY "Allow public read access" 
  ON device_specs FOR SELECT 
  USING (true);

-- Create a policy to allow authenticated users to insert into the table
CREATE POLICY "Allow authenticated insert access" 
  ON device_specs FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

-- Enable RLS (Row Level Security)
ALTER TABLE device_specs ENABLE ROW LEVEL SECURITY;

-- Create a function to get the latest device specs
CREATE OR REPLACE FUNCTION get_latest_device_specs()
RETURNS SETOF device_specs
LANGUAGE sql
AS $$
  SELECT DISTINCT ON (device_id) *
  FROM device_specs
  ORDER BY device_id, created_at DESC;
$$;
