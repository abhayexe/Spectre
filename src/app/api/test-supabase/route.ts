import { NextResponse } from 'next/server';
import supabase from '@/utils/supabase';

export async function GET() {
  try {
    // Log environment variables (will only be visible in server logs)
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('Supabase Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    
    // Test direct connection to Supabase
    const { data, error } = await supabase
      .from('device_specs')
      .select('count(*)', { count: 'exact' });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get all tables to check if device_specs exists
    const { data: tables, error: tablesError } = await supabase
      .from('pg_catalog.pg_tables')
      .select('tablename')
      .eq('schemaname', 'public');

    if (tablesError) {
      console.error('Error fetching tables:', tablesError);
    }

    return NextResponse.json({ 
      data,
      tables,
      env: {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'exists' : 'missing',
        supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'exists' : 'missing'
      }
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Failed to test Supabase connection' },
      { status: 500 }
    );
  }
}
