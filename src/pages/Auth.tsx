
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

const Auth = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        // For signup, we'll use the identifier as both email and username
        const { data, error } = await supabase.auth.signUp({
          email: identifier,
          password,
          options: {
            data: {
              user_name: identifier.split('@')[0], // Use part before @ as username
            }
          }
        });
        
        if (error) throw error;

        // Insert into profiles table
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([{ 
            id: data.user?.id,
            email: identifier,
            user_name: identifier.split('@')[0]
          }]);

        if (profileError) throw profileError;
        
        toast({
          title: "Success!",
          description: "Please check your email to verify your account. If verification is disabled in Supabase, you can now sign in.",
        });
        
        console.log("Sign up successful:", data);
      } else {
        // For sign in, we'll try with email
        const { data, error } = await supabase.auth.signInWithPassword({
          email: identifier,
          password,
        });
        
        if (error) {
          // If email login fails, try to find user by username
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('email')
            .eq('user_name', identifier)
            .single();

          if (profileError) throw error; // Use original email error if profile lookup fails

          if (profileData) {
            // Try login with email from profile
            const { error: secondAttemptError } = await supabase.auth.signInWithPassword({
              email: profileData.email,
              password,
            });
            if (secondAttemptError) throw secondAttemptError;
          }
        }
        
        console.log("Sign in successful");
        navigate("/");
      }
    } catch (error: any) {
      console.error("Authentication error:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-purple-100 to-indigo-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md border border-purple-100">
        <h1 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
          {isSignUp ? "Create Account" : "Welcome Back"}
        </h1>
        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <Label htmlFor="identifier">Email or Username</Label>
            <Input
              id="identifier"
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="border-purple-200 focus:border-purple-400 focus:ring-purple-400"
              required
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border-purple-200 focus:border-purple-400 focus:ring-purple-400"
              required
            />
          </div>
          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : isSignUp ? (
              "Sign Up"
            ) : (
              "Sign In"
            )}
          </Button>
        </form>
        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="mt-4 text-sm text-purple-600 hover:text-purple-800 hover:underline w-full text-center"
        >
          {isSignUp
            ? "Already have an account? Sign in"
            : "Don't have an account? Sign up"}
        </button>
      </div>
    </div>
  );
};

export default Auth;
