/*
  # Create products and orders tables

  1. New Tables
    - `products`
      - `id` (uuid, primary key)
      - `name` (text)
      - `price` (numeric)
      - `category` (text)
      - `image` (text)
      - `description` (text)
      - `artist_name` (text)
      - `location` (text)
      - `is_merchandise` (boolean)
      - `created_at` (timestamp)
      - `active` (boolean)

    - `orders`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `total_amount` (numeric)
      - `status` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add appropriate policies for access control
*/

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  price numeric(10,2) NOT NULL,
  category text NOT NULL,
  image text NOT NULL,
  description text,
  artist_name text,
  location text,
  is_merchandise boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  active boolean DEFAULT true
);

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  total_amount numeric(10,2) NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Products policies
CREATE POLICY "Anyone can view active products"
  ON products
  FOR SELECT
  USING (active = true);

CREATE POLICY "Only admins can modify products"
  ON products
  USING (auth.jwt() ->> 'email' LIKE '%@admin.com')
  WITH CHECK (auth.jwt() ->> 'email' LIKE '%@admin.com');

-- Orders policies
CREATE POLICY "Users can view their own orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);