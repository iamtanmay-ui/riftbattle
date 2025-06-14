"use client";

import { ReactNode, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAtom } from 'jotai';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, KeyRound } from 'lucide-react';
import { 
  userAtom, 
  isLoginDialogOpenAtom, 
  otpSentAtom, 
  isLoadingAtom,
  resendDisabledAtom,
  countdownAtom
} from '@/lib/atoms';
import { useAuthStore } from '@/lib/store';
import { AuthStorage } from '@/lib/auth-storage';
import { api } from '@/lib/api-client';

const formSchema = z.object({
  email: z.string().email('Invalid email address'),
  code: z.string().optional(), // Remove length validation for initial submission
});

interface LoginDialogProps {
  children?: ReactNode;
}

export function LoginDialog({ children }: LoginDialogProps) {
  const [isOpen, setIsOpen] = useAtom(isLoginDialogOpenAtom);
  const [otpSent, setOtpSent] = useAtom(otpSentAtom);
  const [isLoading, setIsLoading] = useAtom(isLoadingAtom);
  const [resendDisabled, setResendDisabled] = useAtom(resendDisabledAtom);
  const [countdown, setCountdown] = useAtom(countdownAtom);
  const [user, setJotaiUser] = useAtom(userAtom);
  const setZustandUser = useAuthStore((state) => state.setUser);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      code: '',
    },
  });

  // Cleanup timer on unmount
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (resendDisabled && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setResendDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [resendDisabled, countdown, setCountdown, setResendDisabled]);

  // Add useEffect to check for stored email
  useEffect(() => {
    const storedEmail = AuthStorage.getStoredEmail();
    if (storedEmail) {
      form.setValue('email', storedEmail);
    }
  }, [form]);

  const startResendCountdown = () => {
    setResendDisabled(true);
    setCountdown(30);
  };

  const handleSendOTP = async (email: string) => {
    try {
      setIsLoading(true);
      
      await api.auth.sendOTP(email);
      
      setOtpSent(true);
      form.setValue('email', email);
      toast({
        title: 'Verification Code Sent',
        description: 'Please check your email for the 6-digit verification code.',
      });
      startResendCountdown();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send verification code. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (email: string, code: string) => {
    try {
      setIsLoading(true);
      
      // Login with OTP
      const loginResponse = await api.auth.login(email, parseInt(code));
      
      // Get user role
      const roleData = await api.auth.getRole();
      
      // Create user data with role information
      const finalUserData = {
        id: 0,
        email,
        username: email.split('@')[0],
        role: roleData || 'user',
        balance: 0,
        banned: false,
        reg_date: Math.floor(Date.now() / 1000),
        ip_reg: '',
        ip_auth: '',
        user_agent: navigator.userAgent,
        seller_name: null,
        seller_avatar: null,
        authorization: loginResponse.authorization,
        isSellerAllowed: roleData === 'seller' || roleData === 'admin'
      };
      
      // Store authentication data
      AuthStorage.setAuthData(
        loginResponse.authorization,
        email,
        finalUserData
      );
      
      // Update both state management systems
      setJotaiUser(finalUserData);
      setZustandUser(finalUserData);
      
      // Reset form and dialog state
      setIsOpen(false);
      form.reset();
      setOtpSent(false);
      setResendDisabled(false);
      setCountdown(0);
      
      toast({
        title: 'Welcome back!',
        description: 'You have successfully logged in.',
      });
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Invalid verification code. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!otpSent) {
      if (!values.email) {
        toast({
          title: 'Error',
          description: 'Please enter your email address',
          variant: 'destructive',
        });
        return;
      }
      await handleSendOTP(values.email);
    } else {
      if (!values.code || values.code.length !== 6) {
        toast({
          title: 'Error',
          description: 'Please enter a valid 6-digit verification code',
          variant: 'destructive',
        });
        return;
      }
      await handleVerifyOTP(values.email, values.code);
    }
  };

  const handleResendOTP = async () => {
    const email = form.getValues('email');
    if (!email) {
      toast({
        title: 'Error',
        description: 'Please enter your email first',
        variant: 'destructive',
      });
      return;
    }
    await handleSendOTP(email);
  };

  const onOpenChange = (open: boolean) => {
    if (!open) {
      form.reset();
      setOtpSent(false);
      setResendDisabled(false);
      setCountdown(0);
    }
    setIsOpen(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {children || (
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20">
            Login
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{otpSent ? 'Enter Verification Code' : 'Login to Your Account'}</DialogTitle>
          <DialogDescription>
            {otpSent 
              ? 'Enter the 6-digit code sent to your email'
              : 'Enter your email to receive a verification code'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input 
                        placeholder="Enter your email" 
                        type="email"
                        autoComplete="email"
                        className="pl-10"
                        {...field} 
                        disabled={otpSent && isLoading}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {otpSent && (
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Verification Code</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input 
                          placeholder="Enter 6-digit code"
                          type="text"
                          inputMode="numeric"
                          autoComplete="one-time-code"
                          className="pl-10"
                          {...field}
                          maxLength={6}
                          disabled={isLoading}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {otpSent ? 'Verifying...' : 'Sending...'}
                </>
              ) : (
                otpSent ? 'Verify Code' : 'Send Verification Code'
              )}
            </Button>
            
            {otpSent && (
              <div className="flex justify-center text-sm">
                <Button 
                  variant="link" 
                  className="p-0 h-auto" 
                  onClick={handleResendOTP}
                  disabled={resendDisabled}
                  type="button"
                >
                  {resendDisabled 
                    ? `Resend code in ${countdown}s` 
                    : 'Resend code'}
                </Button>
              </div>
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}