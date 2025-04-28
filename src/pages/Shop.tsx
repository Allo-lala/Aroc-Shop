import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase, addToCart, CartItem } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import { FiSearch } from 'react-icons/fi';

const products = [
  {
    id: 1,
    name: "Abstract Dreams",
    price: 299.99,
    category: "Original Art",
    image: "https://images.pexels.com/photos/1579708/pexels-photo-1579708.jpeg",
    artist: "Elena Rodriguez",
    location: "Barcelona, Spain",
    story: "Inspired by the vibrant energy of Mediterranean sunsets, this piece captures the dynamic interplay of light and shadow in abstract form."
  },
  {
    id: 2,
    name: "Artist Series T-Shirt",
    price: 34.99,
    category: "Apparel",
    image: "https://images.pexels.com/photos/8532616/pexels-photo-8532616.jpeg",
    artist: "Urban Collective",
    location: "Berlin, Germany",
    story: "Each shirt is individually screen printed with designs from our featured artists, making every piece unique."
  },
  {
    id: 3,
    name: "Artistic Hoodie",
    price: 59.99,
    category: "Apparel",
    image: "https://images.pexels.com/photos/6046183/pexels-photo-6046183.jpeg",
    artist: "Urban Collective",
    location: "Berlin, Germany",
    story: "Premium quality hoodies featuring exclusive artwork from our global artist community."
  },
  {
    id: 4,
    name: "Designer Coffee Mug",
    price: 24.99,
    category: "Accessories",
    image: "https://images.pexels.com/photos/1793035/pexels-photo-1793035.jpeg",
    artist: "Ceramic Studio",
    location: "Portland, USA",
    story: "Hand-crafted ceramic mugs featuring wraparound prints of original artwork."
  },
  {
    id: 5,
    name: "Urban Landscape",
    price: 449.99,
    category: "Original Art",
    image: "https://images.pexels.com/photos/3705539/pexels-photo-3705539.jpeg",
    artist: "Marcus Chen",
    location: "Tokyo, Japan",
    story: "A contemporary take on urban architecture, exploring the intersection of nature and city life."
  },
  {
    id: 6,
    name: "Artist Cap",
    price: 29.99,
    category: "Accessories",
    image: "https://images.pexels.com/photos/984619/pexels-photo-984619.jpeg",
    artist: "Urban Collective",
    location: "Berlin, Germany",
    story: "Premium embroidered caps featuring minimalist designs from our artist collaborations."
  }
];

const ITEMS_PER_PAGE = 6;

export default function Shop() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<LoadingState>({});
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  const filteredProducts = products
    .filter(product => selectedCategory === "All" || product.category === selectedCategory)
    .filter(product => 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  interface Product {
    id: number;
    name: string;
    price: number;
    category: string;
    image: string;
    artist: string;
    location: string;
    story: string;
  }

  interface LoadingState {
    [key: number]: boolean;
  }

  const handleAddToCart = async (product: Product): Promise<void> => {
    if (!user) {
      navigate('/auth');
      return;
    }

    setLoading((prev: LoadingState) => ({ ...prev, [product.id]: true }));
    try {
      const cartItem: CartItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1
      };
      await addToCart(cartItem);
      navigate('/cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setLoading((prev: LoadingState) => ({ ...prev, [product.id]: false }));
    }
  };

  const handleBuyNow = async (product: Product) => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    await handleAddToCart(product);
    navigate('/cart');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8"
    >
      {/* Search Bar */}
      <div className="max-w-2xl mx-auto mb-12">
        <div className="relative">
          <input
            type="text"
            placeholder="Search products, artists, or categories..."
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
          <button 
            onClick={() => setSelectedCategory("All")}
            className={`px-4 py-2 rounded-full ${
              selectedCategory === "All" 
                ? "bg-black text-white" 
                : "border border-gray-300 hover:border-gray-400"
            }`}
          >
            All
          </button>
          <button 
            onClick={() => setSelectedCategory("Original Art")}
            className={`px-4 py-2 rounded-full ${
              selectedCategory === "Original Art" 
                ? "bg-black text-white" 
                : "border border-gray-300 hover:border-gray-400"
            }`}
          >
            Original Art
          </button>
          <button 
            onClick={() => setSelectedCategory("Apparel")}
            className={`px-4 py-2 rounded-full ${
              selectedCategory === "Apparel" 
                ? "bg-black text-white" 
                : "border border-gray-300 hover:border-gray-400"
            }`}
          >
            Apparel
          </button>
          <button 
            onClick={() => setSelectedCategory("Accessories")}
            className={`px-4 py-2 rounded-full ${
              selectedCategory === "Accessories" 
                ? "bg-black text-white" 
                : "border border-gray-300 hover:border-gray-400"
            }`}
          >
            Accessories
          </button>
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
            className="bg-white rounded-lg overflow-hidden shadow-lg"
          >
            <div className="aspect-square overflow-hidden">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover transition hover:scale-105"
              />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
              <p className="text-gray-600 text-lg mb-4">${product.price.toFixed(2)}</p>
              <div className="mb-4">
                <p className="text-sm text-gray-500">By {product.artist}</p>
                <p className="text-sm text-gray-500">{product.location}</p>
              </div>
              <p className="text-gray-600 mb-4">{product.story}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleBuyNow(product)}
                  disabled={loading[product.id]}
                  className="flex-1 bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Buy Now
                </button>
                <button
                  onClick={() => handleAddToCart(product)}
                  disabled={loading[product.id]}
                  className="flex-1 border border-black py-2 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add to Cart
                </button>
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