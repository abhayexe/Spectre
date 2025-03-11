CREATE POLICY "Allow anonymous inserts" 
ON "device_specs" FOR INSERT 
TO anon 
WITH CHECK (true);