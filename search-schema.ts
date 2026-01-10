import { supabase } from './services/supabaseClient';

async function searchSchema() {
    console.log('🔍 Searching for table "users"...');

    try {
        // Method 1: Try common queries to see what works
        const { data: publicData, error: publicError } = await supabase.from('users').select('*').limit(1);
        if (!publicError) {
            console.log('✅ Found "users" (likely in public). Columns:', data && data[0] ? Object.keys(data[0]) : 'Empty table');
        } else {
            console.log('❌ Error fetching from "users":', publicError.message);
        }

        // Method 2: Use SQL to find the table
        const { data: schemaInfo, error: sqlError } = await supabase.rpc('get_table_info', { table_name: 'users' });
        if (schemaInfo) {
            console.log('📄 Table Info:', schemaInfo);
        } else {
            // Alternative: try to list schemas if possible, or just check information_schema via a trick
            // Supabase doesn't allow raw SQL via RPC unless specifically enabled. 
            // We can try to list common types or something.
        }

    } catch (err) {
        console.error('💥 Unexpected error:', err);
    }
}

searchSchema();
