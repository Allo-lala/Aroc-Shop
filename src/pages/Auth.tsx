import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "../lib/supabase";

export default function Auth() {
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        navigate('/shop');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <div className="bg-white p-8 rounded-lg shadow-md">
        {/* <h2 className="text-2xl font-bold mb-6 text-center">Sign In / Sign Up</h2> */}
        <SupabaseAuth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#000000',
                  brandAccent: '#333333',
                }
              }
            },
            style: {
              button: {
                borderRadius: '8px',
                margin: '8px 0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              },
              container: {
                gap: '16px',
              },
              anchor: {
                color: '#000000',
                textDecoration: 'underline',
              }
            }
          }}
          providers={['google', 'apple']}
          view="sign_in"
          showLinks={true}
          redirectTo={`${window.location.origin}/shop`}
        />
      </div>
    </div>
  );
}