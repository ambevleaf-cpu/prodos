'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  getAuth,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
} from 'firebase/auth';
import { useUser, useFirebaseApp } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2, MailCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const firebaseApp = useFirebaseApp();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/');
    }
  }, [user, isUserLoading, router]);

  useEffect(() => {
    // This effect runs on the client after the page loads.
    // It checks if the current URL is a sign-in link.
    const auth = getAuth(firebaseApp);
    if (isSignInWithEmailLink(auth, window.location.href)) {
      // Get the email from local storage.
      let storedEmail = window.localStorage.getItem('emailForSignIn');
      if (!storedEmail) {
        // If email is not in local storage, prompt user for it.
        // This can happen if they open the link on a different device.
        storedEmail = window.prompt('Please provide your email for confirmation');
      }

      if (storedEmail) {
        setIsSubmitting(true);
        signInWithEmailLink(auth, storedEmail, window.location.href)
          .then(() => {
            window.localStorage.removeItem('emailForSignIn');
            // The useUser hook will detect the signed-in state and redirect to '/'
          })
          .catch((err) => {
            console.error(err);
            setError('Failed to sign in. The link may be expired or invalid.');
            setIsSubmitting(false);
          });
      }
    }
  }, [firebaseApp]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    setIsSubmitting(true);
    setError(null);

    const auth = getAuth(firebaseApp);
    const actionCodeSettings = {
      url: window.location.origin, // URL to redirect back to
      handleCodeInApp: true, // This must be true
    };

    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      // Save the email to local storage to be used when the user clicks the link
      window.localStorage.setItem('emailForSignIn', email);
      setEmailSent(true);
      toast({
        title: 'Check your email',
        description: `A sign-in link has been sent to ${email}.`,
      });
    } catch (err: any) {
      console.error(err);
      let friendlyMessage = 'An error occurred.';
      if (err.code === 'auth/invalid-email') {
        friendlyMessage = 'Please enter a valid email address.';
      } else {
        friendlyMessage = err.message;
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
            {emailSent ? 'Check Your Inbox' : 'Prod OS Sign In'}
          </CardTitle>
          <CardDescription>
            {emailSent
              ? 'A sign-in link has been sent to your email address.'
              : 'Enter your email to receive a passwordless sign-in link.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 p-8">
          {emailSent ? (
            <div className="flex flex-col items-center text-center space-y-4">
              <MailCheck className="h-16 w-16 text-green-500" />
              <p className="text-muted-foreground">
                Click the link in the email to complete your sign-in. You can close this tab.
              </p>
              <Button variant="link" onClick={() => setEmailSent(false)}>
                Use a different email
              </Button>
            </div>
          ) : (
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
              <Button type="submit" disabled={isSubmitting || !email} className="w-full h-12 text-lg">
                {isSubmitting ? <Loader2 className="h-6 w-6 animate-spin" /> : 'Send Sign-In Link'}
              </Button>
            </form>
          )}

          {error && <p className="text-sm text-center text-destructive">{error}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
