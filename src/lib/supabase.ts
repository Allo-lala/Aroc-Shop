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
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  price: number;
  created_at?: string;
};

export type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  description?: string;
  artist_name?: string;
  location?: string;
  is_merchandise: boolean;
  active: boolean;
};

export const addToCart = async (productId: string, quantity: number = 1) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: product } = await supabase
    .from('products')
    .select('price')
    .eq('id', productId)
    .single();

  if (!product) return null;

  const { data, error } = await supabase
    .from('cart')
    .upsert({
      user_id: user.id,
      product_id: productId,
      quantity,
      price: product.price
    });

  if (error) throw error;
  return data;
};

export const getCart = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('cart')
    .select(`
      *,
      products (
        name,
        price,
        image,
        category,
        description,
        artist_name,
        location,
        is_merchandise
      )
    `)
    .eq('user_id', user.id);

  if (error) throw error;
  return data;
};

export const updateCartItemQuantity = async (cartItemId: string, quantity: number) => {
  const { data, error } = await supabase
    .from('cart')
    .update({ quantity })
    .eq('id', cartItemId);

  if (error) throw error;
  return data;
};

export const removeFromCart = async (cartItemId: string) => {
  const { error } = await supabase
    .from('cart')
    .delete()
    .eq('id', cartItemId);

  if (error) throw error;
};

export const clearCart = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase
    .from('cart')
    .delete()
    .eq('user_id', user.id);

  if (error) throw error;
};