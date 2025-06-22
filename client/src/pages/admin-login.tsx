import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useLocation } from 'wouter';
import { Shield, ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';

const adminLoginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

type AdminLoginData = z.infer<typeof adminLoginSchema>;

export default function AdminLogin() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const form = useForm<AdminLoginData>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const adminLoginMutation = useMutation({
    mutationFn: async (data: AdminLoginData) => {
      console.log('Attempting admin login with:', data);
      
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include',
      });
      
      console.log('Response status:', res.status);
      
      if (!res.ok) {
        const error = await res.json();
        console.error('Login error:', error);
        throw new Error(error.message || 'Login failed');
      }
      
      const result = await res.json();
      console.log('Login successful:', result);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      toast({
        title: "Admin Login Successful",
        description: "Welcome to the admin dashboard",
      });
      setLocation('/admin');
    },
    onError: (error: any) => {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid admin credentials",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AdminLoginData) => {
    adminLoginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-deep-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="text-gray-400 hover:text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Store
            </Button>
          </Link>
        </div>

        <Card className="gaming-card">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-electric/20 p-4 rounded-full">
                <Shield className="h-8 w-8 text-electric" />
              </div>
            </div>
            <CardTitle className="font-orbitron text-2xl">
              ADMIN <span className="text-electric">LOGIN</span>
            </CardTitle>
            <p className="text-gray-400">Access the administrative dashboard</p>
          </CardHeader>
          
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="text"
                          placeholder="Enter admin username"
                          className="bg-deep-black border-electric/30 text-white"
                          disabled={adminLoginMutation.isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          placeholder="Enter admin password"
                          className="bg-deep-black border-electric/30 text-white"
                          disabled={adminLoginMutation.isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full bg-electric text-deep-black hover:bg-electric/80"
                  disabled={adminLoginMutation.isPending}
                >
                  {adminLoginMutation.isPending ? (
                    <div className="flex items-center">
                      <div className="animate-spin h-4 w-4 border-2 border-deep-black border-t-transparent rounded-full mr-2"></div>
                      Signing In...
                    </div>
                  ) : (
                    'Sign In as Admin'
                  )}
                </Button>
              </form>
            </Form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Admin credentials required for system access
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}