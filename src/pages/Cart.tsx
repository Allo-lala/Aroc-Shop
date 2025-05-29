import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { Link, useNavigate } from 'react-router-dom';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import ReactConfetti from 'react-confetti';
import type { CartItem, Product } from '../lib/supabase';
import { FiPlus, FiMinus, FiTrash2 } from 'react-icons/fi';

interface CartItemWithProduct extends CartItem {
  products: Product;
}

function Cart() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItemWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [showCardForm, setShowCardForm] = useState(false);

  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setCartItems([]);
        setTotal(0);
        setLoading(false);
        return;
      }

      const { data: items, error } = await supabase
        .from('cart')
        .select('*, products(*)')
        .eq('user_id', user.id);

      if (error) throw error;

      setCartItems(items || []);
      setTotal(items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0);
    } catch (error) {
      console.error('Error fetching cart items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = async (itemId: string, change: number) => {
    const item = cartItems.find(item => item.id === itemId);
    if (!item) return;

    const newQuantity = item.quantity + change;
    if (newQuantity < 1 || newQuantity > 10) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('cart')
        .update({ quantity: newQuantity })
        .eq('id', itemId)
        .eq('user_id', user.id);

      if (error) throw error;
      fetchCartItems();
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('cart')
        .delete()
        .eq('id', itemId)
        .eq('user_id', user.id);

      if (error) throw error;
      fetchCartItems();
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const handlePaypalSuccess = async (details: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      // Create order
      const { data: order } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total_amount: total,
          status: 'completed',
          payment_method: 'paypal',
          payment_id: details.id
        })
        .select()
        .single();

      if (order) {
        await supabase
          .from('cart')
          .delete()
          .eq('user_id', user.id);
        setPaymentComplete(true);
        setShowConfetti(true);
        
        setTimeout(() => {
          setShowConfetti(false);
          navigate('/shop');
        }, 3000);
      }
    } catch (error) {
      console.error('Error processing order:', error);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8 text-center">
          <img
            src="https://images.pexels.com/photos/2872879/pexels-photo-2872879.jpeg"
            alt="Empty cart"
            className="w-64 h-64 object-cover mx-auto mb-6 rounded-lg"
          />
          <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Looks like you haven't added anything to your cart yet.</p>
          <Link 
            to="/shop" 
            className="inline-block bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container mx-auto px-4 py-8"
    >
      {showConfetti && <ReactConfetti recycle={false} numberOfPieces={200} />}
      
      <AnimatePresence>
        {paymentComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
          >
            <div className="bg-white p-8 rounded-lg text-center">
              <h2 className="text-2xl font-bold mb-4">Payment Complete!</h2>
              <p className="text-gray-600">Thank you for supporting Aroc</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {cartItems.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-white rounded-lg shadow-md p-6 mb-4"
            >
              <div className="flex items-center gap-4">
                <img
                  src={item.products.image}
                  alt={item.products.name}
                  className="w-24 h-24 object-cover rounded-lg"
                />
                <div className="flex-grow">
                  <h3 className="text-lg font-semibold">{item.products.name}</h3>
                  <p className="text-gray-600">${item.price.toFixed(2)}</p>
                  
                  {!item.products.is_merchandise && (
                    <div className="text-sm text-gray-500 mt-2">
                      <p>Artist: {item.products.artist_name}</p>
                      <p>Location: {item.products.location}</p>
                    </div>
                  )}

                  {item.products.is_merchandise && (
                    <div className="text-sm text-gray-500 mt-2">
                      <p>Size: {item.size}</p>
                      <p>Color: {item.color}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleQuantityChange(item.id, -1)}
                        className="p-1 rounded-full hover:bg-gray-100"
                      >
                        <FiMinus />
                      </button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item.id, 1)}
                        className="p-1 rounded-full hover:bg-gray-100"
                      >
                        <FiPlus />
                      </button>
                    </div>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-red-500 hover:text-red-700 flex items-center gap-1"
                    >
                      <FiTrash2 />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 h-fit">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          
          <div className="space-y-3 mb-6">
            <div className="flex justify-between mb-4">
              <span>Subtotal</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div className="border-t pt-3">
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <PayPalScriptProvider options={{ clientId: "AW6cg6fCQcDpX_Y8BsjIQ1S9JmNxe0iHpLu5Ug7q14HxRJM6brAjrL7zo9HVUQNB-JfSMozTlAswxzE1" }}>
              <PayPalButtons
                createOrder={() => {
                  return Promise.resolve(
                    JSON.stringify({
                      purchase_units: [
                        {
                          amount: {
                            value: total.toFixed(2),
                          },
                        },
                      ],
                    })
                  );
                }}
                onApprove={(actions) => {
                  return new Promise<void>((resolve, reject) => {
                    if (actions.orderID) {
                      supabase
                        .from('orders')
                        .select()
                        .eq('payment_id', actions.orderID)
                        .single()
                        .then(() => {
                          handlePaypalSuccess({ id: actions.orderID });
                          resolve();
                        }, (error) => {
                          console.error('Error fetching order:', error);
                          reject(error);
                        });
                    } else {
                      console.error('Order ID is undefined.');
                      reject('Order ID is undefined.');
                    }
                  });
                }}
              />
            </PayPalScriptProvider>

            <button
              onClick={() => setShowCardForm(!showCardForm)}
              className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition"
            >
              {showCardForm ? 'Hide Card Form' : 'Pay with Card'}
            </button>

            <AnimatePresence>
              {showCardForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      className="w-full px-3 py-2 border rounded-lg"
                      disabled
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        className="w-full px-3 py-2 border rounded-lg"
                        disabled
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CVC
                      </label>
                      <input
                        type="text"
                        placeholder="123"
                        className="w-full px-3 py-2 border rounded-lg"
                        disabled
                      />
                    </div>
                  </div>

                  <button
                    disabled
                    className="w-full bg-gray-400 text-white py-3 rounded-lg cursor-not-allowed"
                  >
                    Card Payment Coming Soon
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default Cart;