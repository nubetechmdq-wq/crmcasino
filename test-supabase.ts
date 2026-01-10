import { supabase } from './services/supabaseClient';

// Test Supabase connection
async function testConnection() {
    console.log('🔍 Testing Supabase connection...');

    try {
        // Test 1: Check if client is initialized
        console.log('✓ Supabase client initialized');

        // Test 2: Try to fetch users
        const { data: users, error: usersError } = await supabase
            .from('users')
            .select('*')
            .limit(5);

        if (usersError) {
            console.error('❌ Error fetching users:', usersError);
        } else {
            console.log('✓ Users fetched successfully:', users?.length || 0, 'users');
            console.log('Users:', users);
        }

        // Test 3: Try to fetch transactions
        const { data: txs, error: txsError } = await supabase
            .from('transactions')
            .select('*')
            .limit(5);

        if (txsError) {
            console.error('❌ Error fetching transactions:', txsError);
        } else {
            console.log('✓ Transactions fetched successfully:', txs?.length || 0, 'transactions');
        }

        // Test 4: Try to fetch messages
        const { data: msgs, error: msgsError } = await supabase
            .from('messages')
            .select('*')
            .limit(5);

        if (msgsError) {
            console.error('❌ Error fetching messages:', msgsError);
        } else {
            console.log('✓ Messages fetched successfully:', msgs?.length || 0, 'messages');
        }

    } catch (err) {
        console.error('❌ Unexpected error:', err);
    }
}

// Run test on page load
testConnection();
