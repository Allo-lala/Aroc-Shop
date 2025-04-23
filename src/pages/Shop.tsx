import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

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

export default function Shop() {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredProducts = selectedCategory === "All" 
    ? products 
    : products.filter(product => product.category === selectedCategory);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Shop</h1>
        <div className="flex gap-2">
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
        {filteredProducts.map((product) => (
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
              <p className="text-gray-600 text-lg mb-4">${product.price}</p>
              <div className="mb-4">
                <p className="text-sm text-gray-500">By {product.artist}</p>
                <p className="text-sm text-gray-500">{product.location}</p>
              </div>
              <p className="text-gray-600 mb-4">{product.story}</p>
              <div className="flex gap-2">
                <button className="flex-1 bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition">
                  Buy Now
                </button>
                <button className="flex-1 border border-black py-2 rounded-lg hover:bg-gray-50 transition">
                  Add to Cart
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}