import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yecaekrcukukjxwzpwqn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InllY2Fla3JjdWt1a2p4d3pwd3FuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0MDM5ODAsImV4cCI6MjA4MDk3OTk4MH0.VIOZheCNxMCJNL8Fmrp1Ur2VdZfIzmDqdZlXVg08YJQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
    const { error: usersErr } = await supabase.from('users').select('id').limit(1);
    console.log('users (plural):', usersErr ? 'ERR: ' + usersErr.message : 'OK');

    const { error: userErr } = await supabase.from('user').select('id').limit(1);
    console.log('user (singular):', userErr ? 'ERR: ' + userErr.message : 'OK');
}

check();
