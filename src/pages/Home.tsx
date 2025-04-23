import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-16"
    >
      {/* Hero Section */}
      <motion.section 
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative h-[600px] flex items-center"
      >
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.pexels.com/photos/1266808/pexels-photo-1266808.jpeg"
            alt="Hero background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50"></div>
        </div>
        <div className="relative z-10 container mx-auto px-4">
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-5xl md:text-7xl font-bold text-white mb-6"
          >
            Discover Unique Art
          </motion.h1>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-white/90 mb-8 max-w-2xl"
          >
            Explore our collection of original artworks and exclusive merchandise. 
            Each piece tells a story, crafted with passion and creativity.
          </motion.p>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Link 
              to="/shop" 
              className="bg-white text-black px-8 py-3 rounded-full text-lg font-semibold hover:bg-gray-100 transition"
            >
              Shop Now
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Featured Categories */}
      <section className="container mx-auto px-4">
        <motion.h2 
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="text-3xl font-bold mb-8"
        >
          Featured Categories
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="relative h-[400px] group overflow-hidden rounded-lg"
          >
            <img
              src="https://images.pexels.com/photos/1647976/pexels-photo-1647976.jpeg"
              alt="Original Art"
              className="w-full h-full object-cover transition group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/40 flex items-end p-6">
              <h3 className="text-2xl font-bold text-white">Original Art</h3>
            </div>
          </motion.div>
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="relative h-[400px] group overflow-hidden rounded-lg"
          >
            <img
              src="https://images.pexels.com/photos/1656684/pexels-photo-1656684.jpeg"
              alt="Apparel"
              className="w-full h-full object-cover transition group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/40 flex items-end p-6">
              <h3 className="text-2xl font-bold text-white">Apparel</h3>
            </div>
          </motion.div>
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="relative h-[400px] group overflow-hidden rounded-lg"
          >
            <img
              src="https://images.pexels.com/photos/1148955/pexels-photo-1148955.jpeg"
              alt="Accessories"
              className="w-full h-full object-cover transition group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/40 flex items-end p-6">
              <h3 className="text-2xl font-bold text-white">Accessories</h3>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-4">
        <motion.h2 
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="text-3xl font-bold mb-8"
        >
          Featured Products
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="group"
          >
            <div className="aspect-square overflow-hidden rounded-lg mb-4">
              <img
                src="https://images.pexels.com/photos/1579708/pexels-photo-1579708.jpeg"
                alt="Abstract Painting"
                className="w-full h-full object-cover transition group-hover:scale-105"
              />
            </div>
            <h3 className="font-semibold mb-2">Abstract Dreams</h3>
            <p className="text-gray-600">$299.99</p>
          </motion.div>
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="group"
          >
            <div className="aspect-square overflow-hidden rounded-lg mb-4">
              <img
                src="https://images.pexels.com/photos/8532616/pexels-photo-8532616.jpeg"
                alt="Graphic T-Shirt"
                className="w-full h-full object-cover transition group-hover:scale-105"
              />
            </div>
            <h3 className="font-semibold mb-2">Artist Series T-Shirt</h3>
            <p className="text-gray-600">$34.99</p>
          </motion.div>
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="group"
          >
            <div className="aspect-square overflow-hidden rounded-lg mb-4">
              <img
                src="https://images.pexels.com/photos/6046183/pexels-photo-6046183.jpeg"
                alt="Hoodie"
                className="w-full h-full object-cover transition group-hover:scale-105"
              />
            </div>
            <h3 className="font-semibold mb-2">Artistic Hoodie</h3>
            <p className="text-gray-600">$59.99</p>
          </motion.div>
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="group"
          >
            <div className="aspect-square overflow-hidden rounded-lg mb-4">
              <img
                src="https://images.pexels.com/photos/1793035/pexels-photo-1793035.jpeg"
                alt="Coffee Mug"
                className="w-full h-full object-cover transition group-hover:scale-105"
              />
            </div>
            <h3 className="font-semibold mb-2">Designer Coffee Mug</h3>
            <p className="text-gray-600">$24.99</p>
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
}