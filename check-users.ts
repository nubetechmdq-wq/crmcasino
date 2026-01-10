import { supabase } from './services/supabaseClient';

async function checkUsers() {
    try {
        const { data, error } = await supabase.from('users').select('*').limit(1);
        if (error) {
            console.log('Error fetching from users table:', error.message);
        } else {
            console.log('Found users table.');
            if (data && data.length > 0) {
                console.log('Columns found:', Object.keys(data[0]));
            } else {
                console.log('Table exists but is empty');
                // If empty, we can try to get column names via select(id) or something
                const { error: colError } = await supabase.from('users').select('password').limit(1);
                console.log('Password column check:', colError ? 'NOT FOUND' : 'FOUND');
            }
        }
    } catch (e) {
        console.error('Fatal error:', e);
    }
}

checkUsers();
