import { Link } from 'react-router-dom';
import logo from '/./src/assets/logo.png';

export default function Navbar() {
  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/">
            <img src={logo} alt="Aroc Logo" className="h-12 w-auto" />
          </Link>
          <div className="flex space-x-4">
            <Link to="/" className="text-gray-700 hover:text-gray-900">Home</Link>
            <Link to="/shop" className="text-gray-700 hover:text-gray-900">Shop</Link>
            <Link to="/cart" className="text-gray-700 hover:text-gray-900">Cart</Link>
            <Link to="/auth" className="text-gray-700 hover:text-gray-900">Sign In</Link>
          </div>
        </div>
      </div>
    </nav>
  );
}