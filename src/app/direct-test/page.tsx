'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

export default function DirectTestPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function testSupabase() {
      try {
        // Get environment variables directly
        const supabaseUrl = "https://gvvuhsiiwouxhfydansg.supabase.co";
        const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2dnVoc2lpd291eGhmeWRhbnNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE1MjU2MDAsImV4cCI6MjA1NzEwMTYwMH0.nDsRjKBel14QXaAOSsVcnnF1MWeN0PQqZmabAznLqvU";
        
        // Create a direct Supabase client
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        // Test connection by getting all tables
        const { data: tables, error: tablesError } = await supabase
          .from('pg_catalog.pg_tables')
          .select('tablename')
          .eq('schemaname', 'public');
          
        if (tablesError) {
          throw new Error(`Error fetching tables: ${tablesError.message}`);
        }
        
        // Check if device_specs table exists
        const deviceSpecsTable = tables?.find(t => t.tablename === 'device_specs');
        
        let deviceSpecsData = null;
        let deviceSpecsError = null;
        
        if (deviceSpecsTable) {
          // Try to get data from device_specs
          const { data, error } = await supabase
            .from('device_specs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(1);
            
          deviceSpecsData = data;
          deviceSpecsError = error;
        }
        
        setResult({
          connection: 'success',
          tables,
          deviceSpecsExists: !!deviceSpecsTable,
          deviceSpecsData,
          deviceSpecsError: deviceSpecsError ? deviceSpecsError.message : null
        });
      } catch (err: any) {
        console.error('Error testing Supabase:', err);
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    }
    
    testSupabase();
  }, []);
  
  if (loading) {
    return <div className="p-8">Testing Supabase connection...</div>;
  }
  
  if (error) {
    return <div className="p-8 text-red-500">Error: {error}</div>;
  }
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Direct Supabase Test</h1>
      
      <div className="bg-gray-100 p-4 rounded-lg mb-4">
        <h2 className="text-lg font-semibold mb-2">Connection Status</h2>
        <p className="text-green-500">{result.connection}</p>
      </div>
      
      <div className="bg-gray-100 p-4 rounded-lg mb-4">
        <h2 className="text-lg font-semibold mb-2">Available Tables</h2>
        {result.tables && result.tables.length > 0 ? (
          <ul className="list-disc list-inside">
            {result.tables.map((table: any, index: number) => (
              <li key={index}>{table.tablename}</li>
            ))}
          </ul>
        ) : (
          <p>No tables found</p>
        )}
      </div>
      
      <div className="bg-gray-100 p-4 rounded-lg mb-4">
        <h2 className="text-lg font-semibold mb-2">device_specs Table</h2>
        {result.deviceSpecsExists ? (
          <p className="text-green-500">Table exists</p>
        ) : (
          <p className="text-red-500">Table does not exist</p>
        )}
      </div>
      
      {result.deviceSpecsExists && (
        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">device_specs Data</h2>
          {result.deviceSpecsError ? (
            <p className="text-red-500">Error: {result.deviceSpecsError}</p>
          ) : result.deviceSpecsData && result.deviceSpecsData.length > 0 ? (
            <pre className="bg-gray-200 p-2 rounded overflow-auto max-h-96">
              {JSON.stringify(result.deviceSpecsData, null, 2)}
            </pre>
          ) : (
            <p>No data found in device_specs table</p>
          )}
        </div>
      )}
    </div>
  );
}
