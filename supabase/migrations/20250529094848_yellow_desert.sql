ALTER TABLE products
ADD COLUMN IF NOT EXISTS variants jsonb DEFAULT NULL;

-- Update existing merchandise products with variants
UPDATE products 
SET variants = jsonb_build_object(
  'sizes', ARRAY['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'],
  'colors', ARRAY['Black', 'White', 'Navy', 'Gray', 'Beige']
)
WHERE is_merchandise = true;

-- Update T-Shirts specifically
UPDATE products 
SET variants = jsonb_build_object(
  'sizes', ARRAY['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'],
  'colors', ARRAY['Black', 'White', 'Navy', 'Gray', 'Beige', 'Pink']
)
WHERE category = 'Merchandise' AND name ILIKE '%T-Shirt%';

-- Update Hoodies
UPDATE products 
SET variants = jsonb_build_object(
  'sizes', ARRAY['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'],
  'colors', ARRAY['Black', 'Gray', 'Navy', 'Beige', 'Brown', 'Army Green']
)
WHERE category = 'Merchandise' AND name ILIKE '%Hoodie%';

-- Update Tote Bags
UPDATE products 
SET variants = jsonb_build_object(
  'sizes', ARRAY['Standard'],
  'colors', ARRAY['Black', 'Natural', 'Navy', 'Gray']
)
WHERE category = 'Totes Bags';