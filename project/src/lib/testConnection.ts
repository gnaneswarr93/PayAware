
import { supabase } from './supabase';

export const testSupabaseConnection = async () => {
  try {
    // Step 1: Check basic network connectivity to Supabase Auth
    // This doesn't require any tables to exist.
    const { error: authError } = await supabase.auth.getSession();
    
    if (authError) {
        // If this fails, it's likely a network issue or bad credentials
        console.error("Supabase Auth check failed:", authError);
        return { success: false, error: authError };
    }

    // Step 2: Check Database Access (RLS / Table existence)
    // We try to fetch a single row. If the table 'transactions' doesn't exist, this will error.
    const { error: dbError } = await supabase.from('transactions').select('count', { count: 'exact', head: true });
    
    if (dbError) {
       // Code '42P01' means relation (table) does not exist. This is "Connected but Schema Missing".
       if (dbError.code === '42P01') {
           return { success: true, message: "Connected to Supabase! (Note: 'transactions' table is missing. Run the SQL script.)" };
       }
       
       // Other DB errors (like RLS) imply we ARE connected.
       if (dbError.code) {
           return { success: true, message: `Connected, but DB error: ${dbError.message} (${dbError.code})` };
       }
       
       console.error("Supabase DB check failed:", dbError);
       return { success: false, error: dbError };
    }
    
    return { success: true, message: "Fully Connected & Schema Ready" };
  } catch (error: any) {
    console.error("Supabase connection test exception:", error);
    return { 
        success: false, 
        error: { message: error.message || "Unknown Network Error" } 
    };
  }
};
