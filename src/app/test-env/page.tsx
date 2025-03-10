'use client';

import { useEffect, useState } from 'react';

export default function TestEnvPage() {
  const [supabaseUrl, setSupabaseUrl] = useState<string>('');
  const [supabaseKey, setSupabaseKey] = useState<string>('');

  useEffect(() => {
    // Get environment variables from the window object
    setSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not found');
    setSupabaseKey(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Key exists' : 'Key not found');
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Environment Variables Test</h1>
      <div className="bg-gray-100 p-4 rounded-lg">
        <p><strong>NEXT_PUBLIC_SUPABASE_URL:</strong> {supabaseUrl}</p>
        <p><strong>NEXT_PUBLIC_SUPABASE_ANON_KEY:</strong> {supabaseKey}</p>
      </div>
    </div>
  );
}
