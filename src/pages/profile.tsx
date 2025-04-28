import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import { User } from '@supabase/supabase-js'; // ✅ Correct import!

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState({
    avatar_url: '',
    nickname: '',
    shipping_address: '',
    country: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }
      setUser(user);

      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error.message);
        return;
      }

      if (profileData) {
        setProfile(profileData);
      } else {
        setProfile(prev => ({ ...prev, email: user.email || '' }));
      }
    };

    getUser();
  }, [navigate]);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setLoading(true);
      const file = event.target.files?.[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      if (!user) {
        throw new Error('User is not authenticated');
      }
      const filePath = `${user.id}-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      if (!data.publicUrl) throw new Error('Could not get public URL for avatar');

      const publicUrl = data.publicUrl;

      setProfile((prev) => ({ ...prev, avatar_url: publicUrl }));
      await updateProfile({ avatar_url: publicUrl });

    } catch (error: any) {
      console.error('Error uploading avatar:', error.message);
      setMessage('Failed to upload avatar');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const updateProfile = async (updates = {}) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user?.id || '',
          updated_at: new Date().toISOString(),
          ...profile,
          ...updates
        });

      if (error) {
        console.error('Supabase upsert error:', error.message);
        throw error;
      }

      setMessage('Profile updated successfully!');
    } catch (error: any) {
      console.error('Error updating profile:', error.message);
      setMessage('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    await updateProfile();
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (!user) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container mx-auto px-4 py-8"
    >
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-32 h-32 mb-6">
            <img
              src={profile.avatar_url || `https://ui-avatars.com/api/?name=${profile.email}`}
              alt="Profile"
              className="w-full h-full rounded-full object-cover"
            />
            <label className="absolute bottom-0 right-0 bg-black text-white p-2 rounded-full cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
                disabled={loading}
              />
              {loading ? '...' : '📷'}
            </label>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nickname</label>
            <input
              type="text"
              name="nickname"
              value={profile.nickname || ''}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={profile.email || ''}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Shipping Address</label>
            <textarea
              name="shipping_address"
              value={profile.shipping_address || ''}
              onChange={handleInputChange}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Country</label>
            <input
              type="text"
              name="country"
              value={profile.country || ''}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
              disabled={loading}
            />
          </div>

          {message && (
            <div className={`p-4 rounded-md ${message.includes('Failed') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
              {message}
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 transition disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={handleSignOut}
              disabled={loading}
              className="flex-1 border border-black py-2 px-4 rounded-md hover:bg-gray-50 transition disabled:opacity-50"
            >
              Sign Out
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
