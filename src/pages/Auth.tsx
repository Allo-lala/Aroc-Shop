import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "../lib/supabase";
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { BsApple } from 'react-icons/bs';

export default function Auth() {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  });
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        navigate('/shop');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  interface FormData {
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: FormData) => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match');
        }

        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              first_name: formData.firstName,
              last_name: formData.lastName,
            }
          }
        });

        if (signUpError) throw signUpError;

        if (authData.user) {
          await supabase.from('profiles').insert({
            id: authData.user.id,
            first_name: formData.firstName,
            last_name: formData.lastName,
            email: formData.email
          });
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (signInError) throw signInError;
      }
    } catch (error: any) {
      if (error instanceof Error) {
        setError(error instanceof Error ? error.message : 'An unknown error occurred');
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'apple') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/shop`
        }
      });
      if (error) throw error;
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unknown error occurred');
      }
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResetMessage('');
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      if (error) throw error;
      setResetMessage('Password reset email sent! Check your inbox.');
    } catch (error: any) {
      setResetMessage(error.message || 'Failed to send reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div>
          <h2 className="text-3xl font-extrabold text-center text-gray-900">
            {showForgotPassword
              ? 'Reset your password'
              : isSignUp
              ? 'Create your account'
              : 'Welcome'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {showForgotPassword
              ? 'Enter your email to receive a password reset link'
              : isSignUp
              ? 'For humanity...'
              : 'Sign in to continue'}
          </p>
        </div>

        {!showForgotPassword ? (
          <>
            <div className="flex flex-col gap-4">
              <button
                onClick={() => handleSocialLogin('google')}
                className="flex items-center justify-center gap-3 w-full py-3 px-4 rounded-full border-2 hover:bg-gray-50 transition"
              >
                <FcGoogle className="w-5 h-5" />
                <span>Continue with Google</span>
              </button>
              
              <button
                onClick={() => handleSocialLogin('apple')}
                className="flex items-center justify-center gap-3 w-full py-3 px-4 rounded-full bg-black text-white hover:bg-gray-900 transition"
              >
                <BsApple className="w-5 h-5" />
                <span>Continue with Apple</span>
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with email</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {isSignUp && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      placeholder="first"
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-black focus:ring-black pl-7 py-2 text-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      placeholder="last"
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-black focus:ring-black pl-7 py-2 text-lg"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <div className="mt-1 relative">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="you@example.com"
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-black focus:ring-black pl-7 py-2 text-lg placeholder:text-gray-400 placeholder:text-sm sm:placeholder:text-base  "
                  />
                  {/* <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" /> */}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <div className="mt-1 relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    placeholder="•••••••••••"
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-black focus:ring-black pl-7 py-2 text-lg placeholder:text-gray-400 placeholder:text-sm sm:placeholder:text-base "
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                {!isSignUp && (
                  <button
                    type="button"
                    className="text-xs text-gray-500 hover:text-black mt-2"
                    onClick={() => setShowForgotPassword(true)}
                  >
                    Forgot password?
                  </button>
                )}
              </div>

              {isSignUp && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                  <div className="mt-1 relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                      placeholder="•••••••••••"
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-black focus:ring-black pl-7 py-2 text-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white py-3 px-4 rounded-lg hover:bg-gray-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-sm text-gray-600 hover:text-black"
                >
                  {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                </button>
              </div>
            </form>
          </>
        ) : (
          <form onSubmit={handleForgotPassword} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                type="email"
                value={resetEmail}
                onChange={e => setResetEmail(e.target.value)}
                required
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-black focus:ring-black py-2 text-lg"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-900 transition disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Reset Email'}
            </button>
            {resetMessage && (
              <div className="text-sm text-center mt-2 text-green-600">{resetMessage}</div>
            )}
            <button
              type="button"
              className="text-xs text-gray-500 hover:text-black mt-2 block mx-auto"
              onClick={() => setShowForgotPassword(false)}
            >
              Back to sign in
            </button>
          </form>
        )}
      </div>
    </div>
  );
}