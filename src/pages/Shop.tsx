import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase, addToCart } from '../lib/supabase';
import { FiSearch, FiShoppingCart } from 'react-icons/fi';
import ReactConfetti from 'react-confetti';
import type { Product as BaseProduct } from '../lib/supabase';

interface Product extends BaseProduct {
  variants?: {
    sizes: string[];
    colors: string[];
  };
}

const categories = [
  "All",
  "Paintings",
  "Crochets",
  "Designs",
  "Ceramics",
  "Merchandise",
  "Totes Bags",
];

function Shop() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [selectedVariants, setSelectedVariants] = useState<Record<string, VariantSelection>>({});
  const [customColors, setCustomColors] = useState<Record<string, string>>({});
  const [products, setProducts] = useState<Product[]>([]);
  const [expandedDescriptions, setExpandedDescriptions] = useState<Record<string, boolean>>({});
  const [showConfetti, setShowConfetti] = useState(false);
  const navigate = useNavigate();

  const ITEMS_PER_PAGE = 6;

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user ? { id: user.id, email: user.email || '' } : null);
    };
    getUser();
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('active', true);
    setProducts(data || []);
  };

  interface VariantSelection {
    size?: string;
    color?: string;
  }

  const filteredProducts = products
    .filter(product => selectedCategory === "All" || product.category === selectedCategory)
    .filter(product => 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleVariantChange = (productId: string, type: keyof VariantSelection, value: string) => {
    setSelectedVariants(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [type]: value
      }
    }));

    // Reset custom color when changing color selection
    if (type === 'color' && value !== 'Custom') {
      setCustomColors(prev => {
        const newColors = { ...prev };
        delete newColors[productId];
        return newColors;
      });
    }
  };

  const handleCustomColorChange = (productId: string, value: string) => {
    setCustomColors(prev => ({
      ...prev,
      [productId]: value
    }));
  };

  const getEffectiveColor = (productId: string) => {
    const variant = selectedVariants[productId];
    if (variant?.color === 'Custom') {
      return customColors[productId] || '';
    }
    return variant?.color || '';
  };

  const handleAddToCart = async (product: Product) => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (product.is_merchandise) {
      const effectiveColor = getEffectiveColor(product.id);
      if (!selectedVariants[product.id]?.size || !effectiveColor) {
        alert('Please select size and color');
        return;
      }
    }

    setLoading(prev => ({ ...prev, [product.id]: true }));
    try {
      await addToCart(
        product.id,
        1,
        selectedVariants[product.id]?.size,
        getEffectiveColor(product.id)
      );
      showSuccessAnimation();
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setLoading(prev => ({ ...prev, [product.id]: false }));
    }
  };

  const handleBuyNow = async (product: Product) => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (product.is_merchandise) {
      const effectiveColor = getEffectiveColor(product.id);
      if (!selectedVariants[product.id]?.size || !effectiveColor) {
        alert('Please select size and color');
        return;
      }
    }

    setLoading(prev => ({ ...prev, [product.id]: true }));
    try {
      await addToCart(
        product.id,
        1,
        selectedVariants[product.id]?.size,
        getEffectiveColor(product.id)
      );
      showSuccessAnimation();
      setTimeout(() => navigate('/cart'), 1000);
    } catch (error) {
      console.error('Error buying product:', error);
    } finally {
      setLoading(prev => ({ ...prev, [product.id]: false }));
    }
  };

  const showSuccessAnimation = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 2000);
  };

  const toggleDescription = (productId: string) => {
    setExpandedDescriptions(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8"
    >
      {showConfetti && <ReactConfetti recycle={false} numberOfPieces={200} />}

      {/* Search Bar */}
      <div className="max-w-2xl mx-auto mb-12">
        <div className="relative">
          <input
            type="text"
            placeholder="Search products or categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 pl-12 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          />
          <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        </div>
      </div>

      {/* Categories */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Shop</h1>
        <div className="flex gap-2 flex-wrap">
          {categories.map(category => (
            <button 
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full ${
                selectedCategory === category 
                  ? "bg-black text-white" 
                  : "border border-gray-300 hover:border-gray-400"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {paginatedProducts.map((product) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-lg overflow-hidden shadow-lg relative"
          >
            <div className="aspect-square overflow-hidden">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover transition group-hover:scale-105"
              />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
              <p className="text-gray-600 text-lg mb-4">${product.price.toFixed(2)}</p>
              
              {!product.is_merchandise && product.description && (
                <div className="mb-4">
                  <p className="text-gray-600">
                    {expandedDescriptions[product.id]
                      ? product.description
                      : `${product.description.slice(0, 100)}${product.description.length > 100 ? '...' : ''}`
                    }
                  </p>
                  {product.description.length > 100 && (
                    <button
                      onClick={() => toggleDescription(product.id)}
                      className="text-black hover:underline mt-1 text-sm"
                    >
                      {expandedDescriptions[product.id] ? 'Read less' : 'Read more'}
                    </button>
                  )}
                </div>
              )}

              {!product.is_merchandise && (
                <div className="text-sm text-gray-500 mb-4">
                  <p>Artist: {product.artist_name}</p>
                  <p>Location: {product.location}</p>
                </div>
              )}

              {product.is_merchandise && product.variants && (
                <div className="space-y-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Size</label>
                    <select
                      value={selectedVariants[product.id]?.size || ''}
                      onChange={(e) => handleVariantChange(product.id, 'size', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
                    >
                      <option value="">Select Size</option>
                      {product.variants.sizes.map(size => (
                        <option key={size} value={size}>{size}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Color</label>
                    <select
                      value={selectedVariants[product.id]?.color || ''}
                      onChange={(e) => handleVariantChange(product.id, 'color', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
                    >
                      <option value="">Select Color</option>
                      {[
                        ...product.variants.colors.filter((color) => color !== 'Custom'),
                        'Custom',
                      ].map((color) => (
                        <option key={color} value={color}>{color}</option>
                      ))}
                    </select>
                  </div>
                  {selectedVariants[product.id]?.color === 'Custom' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Custom Color Description</label>
                      <input
                        type="text"
                        value={customColors[product.id] || ''}
                        onChange={(e) => handleCustomColorChange(product.id, e.target.value)}
                        placeholder="Describe your desired color"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                <motion.button
                  onClick={() => handleAddToCart(product)}
                  disabled={loading[product.id] || (product.is_merchandise && (!selectedVariants[product.id]?.size || !getEffectiveColor(product.id)))}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 bg-white border-2 border-black text-black py-3 rounded-lg hover:bg-black hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <FiShoppingCart />
                  Add to Cart
                </motion.button>
                <motion.button
                  onClick={() => handleBuyNow(product)}
                  disabled={loading[product.id] || (product.is_merchandise && (!selectedVariants[product.id]?.size || !getEffectiveColor(product.id)))}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Buy Now
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-12 flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-4 py-2 rounded-lg ${
                currentPage === page
                  ? "bg-black text-white"
                  : "border border-gray-300 hover:border-gray-400"
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}

export default Shop;