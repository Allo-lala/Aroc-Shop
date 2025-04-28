import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';

function Cart() {
  interface CartItem {
    id: number;
    name: string;
    price: number;
    quantity: number;
    image: string;
  }
  
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    name: ''
  });

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

  const handleRemoveItem = async (itemId: number): Promise<void> => {
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

  interface CheckoutSubmitEvent extends React.FormEvent<HTMLFormElement> {}

  const handleCheckoutSubmit = async (e: CheckoutSubmitEvent): Promise<void> => {
    e.preventDefault();
    // Here you would integrate with your payment processor
    // For now, we'll just show a success message
    alert('Order placed successfully!');
    setShowCheckout(false);
    
    // Clear cart after successful checkout
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from('cart')
        .delete()
        .eq('user_id', user.id);
    }
  };

  interface CheckoutForm {
    cardNumber: string;
    expiryDate: string;
    cvv: string;
    name: string;
  }

  interface InputChangeEvent extends React.ChangeEvent<HTMLInputElement> {}

  const handleInputChange = (e: InputChangeEvent): void => {
    const { name, value } = e.target;
    setCheckoutForm((prev: CheckoutForm) => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container mx-auto px-4 py-8"
    >
      <h1 className="text-3xl font-bold mb-6">Shopping Cart</h1>
      {cartItems.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-500">Your cart is empty</p>
          <Link to="/shop" className="mt-4 inline-block bg-black text-white px-6 py-2 rounded-lg">
            Continue Shopping
          </Link>
        </div>
      ) : (
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
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
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
            <button 
              onClick={() => setShowCheckout(true)}
              className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition"
            >
              Proceed to Checkout
            </button>

            {showCheckout && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
                onClick={(e) => {
                  if (e.target === e.currentTarget) setShowCheckout(false);
                }}
              >
                <div className="bg-white rounded-lg p-6 max-w-md w-full">
                  <h3 className="text-xl font-semibold mb-4">Checkout</h3>
                  <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Card Holder Name</label>
                      <input
                        type="text"
                        name="name"
                        value={checkoutForm.name}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Card Number</label>
                      <input
                        type="text"
                        name="cardNumber"
                        value={checkoutForm.cardNumber}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
                        <input
                          type="text"
                          name="expiryDate"
                          placeholder="MM/YY"
                          value={checkoutForm.expiryDate}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">CVV</label>
                        <input
                          type="text"
                          name="cvv"
                          value={checkoutForm.cvv}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
                          required
                        />
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-6">
                      <span className="font-semibold">Total: ${total.toFixed(2)}</span>
                      <button
                        type="submit"
                        className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition"
                      >
                        Pay Now
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default Cart;