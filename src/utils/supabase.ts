import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gvvuhsiiwouxhfydansg.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2dnVoc2lpd291eGhmeWRhbnNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE1MjU2MDAsImV4cCI6MjA1NzEwMTYwMH0.nDsRjKBel14QXaAOSsVcnnF1MWeN0PQqZmabAznLqvU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Function to get all device specs
export const getDeviceSpecs = async () => {
  const { data, error } = await supabase
    .from('device_specs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching device specs:', error);
    throw new Error(error.message);
  }

  return data || [];
};

// Function to get a specific device spec by device_id
export const getDeviceSpecById = async (deviceId: string) => {
  const { data, error } = await supabase
    .from('device_specs')
    .select('*')
    .eq('device_id', deviceId)
    .single();

  if (error) {
    console.error('Error fetching device spec:', error);
    throw new Error(error.message);
  }

  return data;
};

export const addManualDeviceSpec = async (deviceSpec: any) => {
  const { data, error } = await supabase
    .from('device_specs')
    .insert([deviceSpec])
    .select();
  
  if (error) {
    console.error('Error adding manual device spec:', error);
    throw error;
  }
  
  return data;
};
