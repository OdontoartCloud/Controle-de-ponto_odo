import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { data, error } = await supabase.from('configurations').select().limit(1);

    if (error) {
      console.error('Erro ao manter o projeto ativo:', error);
      return res.status(500).json({ error: 'Erro ao acessar Supabase' });
    }

    console.log('Projeto mantido ativo:', data);
    return res.status(200).json({ message: 'Projeto mantido ativo' });
  } catch (error) {
    console.error('Erro na função keepAlive:', error);
    return res.status(500).json({ error: 'Erro ao manter o projeto ativo' });
  }
}
