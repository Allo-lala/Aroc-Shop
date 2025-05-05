import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { PayPalButtons } from "@paypal/react-paypal-js";
import ReactConfetti from 'react-confetti';

function Cart() {
  const [cartItems, setCartItems] = useState<{ id: number; name: string; price: number; quantity: number; image: string; variants?: { size: string; color: string } }[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);

  useEffect(() => {
    const fetchCartItems = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: items } = await supabase
        .from('cart')
        .select('*')
        .eq('user_id', user.id);

      setCartItems(items || []);
      setTotal(items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0);
      setLoading(false);
    };

    fetchCartItems();

    const cartSubscription = supabase
      .channel('cart_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'cart' 
      }, fetchCartItems)
      .subscribe();

    return () => {
      cartSubscription.unsubscribe();
    };
  }, []);

  interface CartItem {
    id: number;
    name: string;
    price: number;
    quantity: number;
    image: string;
    variants?: {
      size: string;
      color: string;
    };
  }

  const handleRemoveItem = async (itemId: CartItem['id']): Promise<void> => {
    await supabase
      .from('cart')
      .delete()
      .eq('id', itemId);
  };

  interface UpdateQuantityParams {
    itemId: number;
    quantity: number;
  }

  const handleUpdateQuantity = async ({ itemId, quantity }: UpdateQuantityParams): Promise<void> => {
    if (quantity > 3) return;

    await supabase
      .from('cart')
      .update({ quantity })
      .eq('id', itemId);
  };


  const handlePaypalSuccess = async (): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setPaymentComplete(true);
      setShowConfetti(true);
      
      setTimeout(async () => {
        await supabase
          .from('cart')
          .delete()
          .eq('user_id', user.id);
          
        setShowConfetti(false);
        window.location.href = '/shop';
      }, 3000);
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
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
              <p className="text-gray-600">Thank you for your purchase.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <h1 className="text-3xl font-bold mb-6">Shopping Cart</h1>
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
                  src={item.image}
                  alt={item.name}
                  className="w-24 h-24 object-cover rounded-lg"
                />
                <div className="flex-grow">
                  <h3 className="text-lg font-semibold">{item.name}</h3>
                  <p className="text-gray-600">${item.price.toFixed(2)}</p>
                  {item.variants && (
                    <div className="text-sm text-gray-500">
                      <p>Size: {item.variants.size}</p>
                      <p>Color: {item.variants.color}</p>
                    </div>
                  )}
                  <div className="flex items-center gap-4 mt-2">
                    <select
                      value={item.quantity}
                      onChange={(e) => handleUpdateQuantity({ itemId: item.id, quantity: parseInt(e.target.value) })}
                      className="border rounded-lg px-2 py-1"
                    >
                      {[1, 2, 3].map((num) => (
                        <option key={num} value={num}>{num}</option>
                      ))}
                    </select>
                    <motion.button
                      onClick={() => handleRemoveItem(item.id)}
                      whileTap={{ scale: 0.95 }}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 h-fit">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          <div className="flex justify-between mb-4">
            <span>Subtotal</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <PayPalButtons
                      createOrder={(_, actions) => {
                        return actions.order.create({
                          intent: "CAPTURE",
                          purchase_units: [
                            {
                              amount: {
                                currency_code: "USD",
                                value: total.toFixed(2),
                              },
                            },
                          ],
                        });
                      }}
            onApprove={(_, actions) => {
              if (actions.order) {
                return actions.order.capture().then(handlePaypalSuccess);
              }
              return Promise.reject(new Error("Order actions are undefined."));
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}

export default Cart;