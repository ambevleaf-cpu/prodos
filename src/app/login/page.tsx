'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { useUser, useFirebaseApp } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const firebaseApp = useFirebaseApp();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/');
    }
  }, [user, isUserLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    setIsSubmitting(true);
    setError(null);

    const auth = getAuth(firebaseApp);
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
        toast({
          title: 'Account Created',
          description: "You've been successfully signed up and logged in.",
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast({
          title: 'Signed In',
          description: 'Welcome back!',
        });
      }
      // On successful sign-in/up, the useUser hook will trigger the redirect.
    } catch (err: any) {
      console.error(err);
      let friendlyMessage = 'An authentication error occurred.';
      switch (err.code) {
        case 'auth/email-already-in-use':
          friendlyMessage = 'This email is already in use. Please sign in or use a different email.';
          break;
        case 'auth/invalid-email':
          friendlyMessage = 'Please enter a valid email address.';
          break;
        case 'auth/weak-password':
          friendlyMessage = 'The password is too weak. It should be at least 6 characters long.';
          break;
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          friendlyMessage = 'Invalid email or password. Please try again.';
          break;
        default:
          friendlyMessage = err.message;
          break;
      }
      setError(friendlyMessage);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isUserLoading || user) {
    return (
     <div className="flex h-screen w-screen items-center justify-center bg-background">
       <Loader2 className="h-12 w-12 animate-spin text-primary" />
     </div>
   );
 }

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gradient-to-br from-blue-50 to-purple-100">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">
            {isSignUp ? 'Create an Account' : 'Welcome Back'}
          </CardTitle>
          <CardDescription>
            {isSignUp
              ? 'Enter your details to create a new account'
              : 'Sign in to access your Prod OS desktop'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                className="h-12 text-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                className="h-12 text-lg"
              />
            </div>
            <Button type="submit" disabled={isSubmitting || !email || !password} className="w-full h-12 text-lg">
              {isSubmitting ? <Loader2 className="h-6 w-6 animate-spin" /> : (isSignUp ? 'Sign Up' : 'Sign In')}
            </Button>
          </form>

          {error && <p className="text-sm text-center text-destructive">{error}</p>}
          
          <div className="text-center text-sm">
            {isSignUp ? (
              <>
                Already have an account?{' '}
                <Button variant="link" className="p-0 h-auto" onClick={() => setIsSignUp(false)}>
                  Sign In
                </Button>
              </>
            ) : (
              <>
                Don't have an account?{' '}
                <Button variant="link" className="p-0 h-auto" onClick={() => setIsSignUp(true)}>
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
