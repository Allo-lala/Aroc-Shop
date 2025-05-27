import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { FiSearch } from 'react-icons/fi';
import ReactConfetti from 'react-confetti';

const categories = [
  "All",
  "Paintings",
  "Crochets",
  "Designs",
  "Ceramics",
  "Merchandise",
  "Totes Bags",
];

const products = [
  {
    id: 1,
    name: "Abstract Dreams",
    price: 299.99,
    category: "Paintings",
    image: "https://images.pexels.com/photos/139764/pexels-photo-139764.jpeg?auto=compress&cs=tinysrgb&w=600",
    story: "Inspired by the vibrant energy of Mediterranean sunsets.",
    variants: null
  },
  {
    id: 2,
    name: "T-Shirt",
    price: 34.99,
    category: "Merchandise",
    image: "https://images.pexels.com/photos/8532616/pexels-photo-8532616.jpeg",
    story: " ",
    variants: {
      type: "clothing",
      sizes: ["S", "M", "L", "XL", "XXL", "XXXL"],
      colors: ["Black", "White", "Beige", "Pink", "Custom"]
    }
  },
  {
    id: 3,
    name: "Artistic Hoodie",
    price: 59.99,
    category: "Merchandise",
    image: "https://images.pexels.com/photos/8217406/pexels-photo-8217406.jpeg?auto=compress&cs=tinysrgb&w=600",
    story: " ",
    variants: {
      type: "clothing",
      sizes: ["S", "M", "L", "XL", "XXL", "XXXL"],
      colors: ["Black", "Gray", "Beige", "Pink", "Brown", "Army Green", "Custom"]
    }
  },
  {
    id: 4,
    name: "Ceramic Vase",
    price: 149.99,
    category: "Ceramics",
    image: "https://images.pexels.com/photos/2130570/pexels-photo-2130570.jpeg?auto=compress&cs=tinysrgb&w=600",
    story: "Hand-crafted ceramic vase with unique glazing technique.",
    variants: null
  },
  {
    id: 5,
    name: "T-Totes Bag",
    price: 34.99,
    category: "Totes Bags",
    image: "https://images.pexels.com/photos/1214212/pexels-photo-1214212.jpeg?auto=compress&cs=tinysrgb&w=600",
    story: " ",
    variants: {
      type: "bag",
      sizes: ["S", "M", "L", "XL"],
      colors: ["Black", "Brown", "Beige", "Custom"]
    }
  }
];

const ITEMS_PER_PAGE = 6;

export default function Shop() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [loading, setLoading] = useState<Record<number, boolean>>({});
  const [selectedVariants, setSelectedVariants] = useState<Record<number, VariantSelection>>({});
  const [showVariants, setShowVariants] = useState<number | null>(null);
  const [customColor, setCustomColor] = useState<Record<number, string>>({});
  const [showConfetti, setShowConfetti] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user ? { id: user.id, email: user.email || '' } : null);
    };
    getUser();
  }, []);

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

  interface VariantSelection {
    size?: string;
    color?: string;
  }

  const handleVariantChange = (productId: number, type: keyof VariantSelection, value: string) => {
    setSelectedVariants((prev: Record<number, VariantSelection>) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [type]: value
      }
    }));
  };

  interface Product {
    id: number;
    name: string;
    price: number;
    category: string;
    image: string;
    story: string;
    variants: {
      type: string;
      sizes: string[];
      colors: string[];
    } | null;
  }

  interface CartItem {
    id: number;
    name: string;
    price: number;
    image: string;
    quantity: number;
    variants: {
      size?: string;
      color?: string;
    } | null;
  }

  const handleBuyNow = async (product: Product): Promise<void> => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (product.variants && (!selectedVariants[product.id]?.size || !selectedVariants[product.id]?.color)) {
      alert('Please select size and color');
      return;
    }

    const finalColor = selectedVariants[product.id]?.color === 'Custom' 
      ? customColor[product.id] 
      : selectedVariants[product.id]?.color;

    setLoading(prev => ({ ...prev, [product.id]: true }));
    try {
      const cartItem: CartItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1,
        variants: product.variants ? {
          ...selectedVariants[product.id],
          color: finalColor
        } : null
      };
      await supabase.from('cart').insert([cartItem]);
      setShowConfetti(true);
      setTimeout(() => {
        setShowConfetti(false);
        navigate('/cart');
      }, 2000);
    } catch (error) {
      console.error('Error buying product:', error);
    } finally {
      setLoading(prev => ({ ...prev, [product.id]: false }));
    }
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
            className="bg-white rounded-lg overflow-hidden shadow-lg relative group"
            onMouseEnter={() => product.variants && setShowVariants(product.id)}
            onMouseLeave={() => setShowVariants(null)}
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
              <p className="text-gray-600 mb-4">{product.story}</p>

              <AnimatePresence>
                {showVariants === product.id && product.variants && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute inset-0 bg-white/95 p-6 flex flex-col justify-center"
                  >
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Size</label>
                        <select
                          value={selectedVariants[product.id]?.size || ''}
                          onChange={(e) => handleVariantChange(product.id, 'size', e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
                        >
                          <option value=""disabled hidden>Select Size</option>
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
                          <option value=""disabled hidden>Select Color</option>
                          {product.variants.colors.map(color => (
                            <option key={color} value={color}>{color}</option>
                          ))}
                        </select>
                      </div>
                      {selectedVariants[product.id]?.color === 'Custom' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Custom Color</label>
                          <input
                            type="text"
                            placeholder="Describe your preferances"
                            value={customColor[product.id] || ''}
                            onChange={(e) => setCustomColor(prev => ({
                              ...prev,
                              [product.id]: e.target.value
                            }))}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
                          />
                        </div>
                      )}
                      <motion.button
                        onClick={() => handleBuyNow(product)}
                        disabled={loading[product.id]}
                        whileTap={{ scale: 0.95 }}
                        className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                      >
                        {loading[product.id] ? 'Processing...' : 'Buy Now'}
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {!product.variants && (
                <motion.button
                  onClick={() => handleBuyNow(product)}
                  disabled={loading[product.id]}
                  whileTap={{ scale: 0.95 }}
                  className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading[product.id] ? 'Processing...' : 'Buy Now'}
                </motion.button>
              )}
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