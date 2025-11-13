'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult,
} from 'firebase/auth';
import { useUser, useFirebaseApp } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    confirmationResult?: ConfirmationResult;
  }
}

export default function LoginPage() {
  const firebaseApp = useFirebaseApp();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/');
    }
  }, [user, isUserLoading, router]);

  useEffect(() => {
    const auth = getAuth(firebaseApp);
    if (typeof window !== 'undefined' && !window.recaptchaVerifier) {
      // It's important that the reCAPTCHA container is visible.
      // Firebase will throw an error if it's hidden with display: none.
      // We use opacity-0 and h-0 to "hide" it visually without triggering the error.
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
      });
    }
  }, [firebaseApp]);

  const handleSendCode = async () => {
    if (!phoneNumber) {
      setError('Please enter a phone number.');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const auth = getAuth(firebaseApp);
      const appVerifier = window.recaptchaVerifier!;
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      window.confirmationResult = confirmationResult;
      setIsCodeSent(true);
      toast({
        title: 'Verification Code Sent',
        description: `A code has been sent to ${phoneNumber}.`,
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to send verification code. Make sure the phone number format is correct (e.g., +15551234567).');
      // Reset reCAPTCHA to allow retries
       const auth = getAuth(firebaseApp);
       window.recaptchaVerifier?.render().then((widgetId) => {
         // @ts-ignore
         grecaptcha.reset(widgetId);
       });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode) {
      setError('Please enter the verification code.');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      if (!window.confirmationResult) {
        throw new Error('No confirmation result found. Please request a new code.');
      }
      await window.confirmationResult.confirm(verificationCode);
      // On successful sign-in, the onAuthStateChanged listener in
      // the useUser hook will update the user state, and the
      // useEffect hook will redirect to the home page.
      toast({
        title: 'Success!',
        description: 'You have been logged in.',
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to verify code. It might be incorrect or expired.');
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
      <div id="recaptcha-container" className="h-0 opacity-0"></div>
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Welcome to Prod OS</CardTitle>
          <CardDescription>Sign in with your phone number to continue</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 p-8">
          {!isCodeSent ? (
            <div className="space-y-4">
              <Input
                type="tel"
                placeholder="Phone number (e.g., +15551234567)"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={isSubmitting}
                className="h-12 text-lg"
              />
              <Button onClick={handleSendCode} disabled={isSubmitting || !phoneNumber} className="w-full h-12 text-lg">
                {isSubmitting ? <Loader2 className="h-6 w-6 animate-spin" /> : 'Send Code'}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Input
                type="text"
                placeholder="Verification code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                disabled={isSubmitting}
                className="h-12 text-lg text-center tracking-[0.5em]"
                maxLength={6}
              />
              <Button onClick={handleVerifyCode} disabled={isSubmitting || !verificationCode} className="w-full h-12 text-lg">
                {isSubmitting ? <Loader2 className="h-6 w-6 animate-spin" /> : 'Verify and Sign In'}
              </Button>
               <Button variant="link" onClick={() => setIsCodeSent(false)} className="w-full">
                Use a different phone number
              </Button>
            </div>
          )}
          {error && <p className="text-sm text-center text-destructive">{error}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
