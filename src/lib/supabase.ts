import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

export type CartItem = {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
};

export const addToCart = async (item: CartItem) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('cart')
    .upsert({
      user_id: user.id,
      product_id: item.id,
      quantity: item.quantity,
      price: item.price
    });

  if (error) throw error;
  return data;
};

export const getCart = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('cart')
    .select('*')
    .eq('user_id', user.id);

  if (error) throw error;
  return data;
};