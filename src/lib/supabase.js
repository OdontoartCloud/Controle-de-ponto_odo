
// Supabase client configuration
// This will be configured once user completes Supabase integration

let supabaseUrl = '';
let supabaseAnonKey = '';

// Mock client for development
export const supabase = {
  auth: {
    signUp: async ({ email, password }) => {
      // Mock implementation
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            data: { user: { id: '1', email }, session: null },
            error: null
          });
        }, 1000);
      });
    },
    signInWithPassword: async ({ email, password }) => {
      // Mock implementation
      return new Promise((resolve) => {
        setTimeout(() => {
          if (email === 'admin@empresa.com' && password === 'admin123') {
            const user = { id: '1', email, role: 'admin' };
            const session = { access_token: 'mock-token', user };
            localStorage.setItem('supabase-session', JSON.stringify(session));
            resolve({ data: { user, session }, error: null });
          } else {
            resolve({ data: { user: null, session: null }, error: { message: 'Credenciais inválidas' } });
          }
        }, 1000);
      });
    },
    signOut: async () => {
      localStorage.removeItem('supabase-session');
      return { error: null };
    },
    getSession: async () => {
      const session = localStorage.getItem('supabase-session');
      return { 
        data: { session: session ? JSON.parse(session) : null }, 
        error: null 
      };
    },
    onAuthStateChange: (callback) => {
      // Mock implementation
      const session = localStorage.getItem('supabase-session');
      if (session) {
        callback('SIGNED_IN', JSON.parse(session));
      } else {
        callback('SIGNED_OUT', null);
      }
      
      return {
        data: { subscription: { unsubscribe: () => {} } }
      };
    }
  },
  from: (table) => ({
    select: () => ({
      eq: () => Promise.resolve({ data: [], error: null })
    }),
    insert: () => Promise.resolve({ data: [], error: null }),
    update: () => Promise.resolve({ data: [], error: null }),
    delete: () => Promise.resolve({ data: [], error: null })
  })
};

// Function to initialize real Supabase client (will be called after integration)
export const initializeSupabase = (url, key) => {
  supabaseUrl = url;
  supabaseAnonKey = key;
  // Real Supabase client initialization will happen here
};
