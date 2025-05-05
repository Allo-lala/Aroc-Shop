import { Link } from 'react-router-dom';
import { BsCart3 } from 'react-icons/bs';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import logo from '/./src/assets/logo.png';

export default function Navbar() {
  const [cartCount, setCartCount] = useState(0);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    const getCartCount = async () => {
      const { data: cartItems } = await supabase
        .from('cart')
        .select('*');
      setCartCount(cartItems?.length || 0);
    };

    getUser();
    getCartCount();

    const cartSubscription = supabase
      .channel('cart_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'cart' 
      }, () => {
        getCartCount();
      })
      .subscribe();

    return () => {
      cartSubscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
        <Link to="/">
            <img src={logo} alt="Aroc Logo" className="h-12 w-auto" />
          </Link>
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-gray-700 hover:text-gray-900">Home</Link>
            <Link to="/shop" className="text-gray-700 hover:text-gray-900">Shop</Link>
            <Link to="/cart" className="text-gray-700 hover:text-gray-900 relative">
              <BsCart3 className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-black text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            {user ? (
              <button onClick={handleSignOut} className="text-gray-700 hover:text-gray-900">
                Sign Out
              </button>
            ) : (
              <Link to="/auth" className="text-gray-700 hover:text-gray-900">Sign In</Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}