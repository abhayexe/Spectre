import { NextResponse } from 'next/server';
import {supabase} from '@/utils/supabase';

export async function GET() {
  try {
    // Log environment variables for debugging
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('Supabase Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    
    const { data, error } = await supabase
      .from('device_specs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message, details: error }, { status: 500 });
    }

    // Check if data is empty
    if (!data || data.length === 0) {
      console.log('No data found in device_specs table');
      
      // Try to get a list of tables to verify connection is working
      const { data: tables, error: tablesError } = await supabase
        .from('pg_catalog.pg_tables')
        .select('tablename')
        .eq('schemaname', 'public');
        
      if (tablesError) {
        console.error('Error fetching tables:', tablesError);
      } else {
        console.log('Available tables:', tables);
      }
      
      return NextResponse.json({ 
        data: [], 
        message: 'No device specifications found',
        tables: tables || []
      });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch device specifications', details: error },
      { status: 500 }
    );
  }
}
