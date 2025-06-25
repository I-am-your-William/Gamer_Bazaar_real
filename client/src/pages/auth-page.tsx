import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLocalAuth } from '@/hooks/useLocalAuth';
import { useLocation } from 'wouter';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(4, 'Password must be at least 4 characters'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useLocalAuth();
  const [activeTab, setActiveTab] = useState('login');
  const [, setLocation] = useLocation();

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      firstName: '',
      lastName: '',
    },
  });

  // Redirect if already logged in
  if (user) {
    setTimeout(() => setLocation('/'), 0);
    return null;
  }

  const onLogin = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  const onRegister = (data: RegisterFormData) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center lg:text-left">
            <h1 className="text-5xl font-bold text-white mb-6">
              Gaming <span className="text-electric">Paradise</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Discover the ultimate gaming equipment collection. From high-performance laptops to professional gaming accessories.
            </p>
            <div className="space-y-4 text-gray-300">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-electric rounded-full"></div>
                <span>Premium gaming hardware</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-electric rounded-full"></div>
                <span>Authentic products with serial verification</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-electric rounded-full"></div>
                <span>Secure QR code authentication</span>
              </div>
            </div>
          </div>

          {/* Auth Forms */}
          <Card className="bg-gray-800/50 border-gray-700 max-w-md mx-auto w-full">
            <CardHeader>
              <CardTitle className="text-white text-center">Welcome</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 bg-gray-700">
                  <TabsTrigger value="login" className="text-white data-[state=active]:bg-electric">
                    Login
                  </TabsTrigger>
                  <TabsTrigger value="register" className="text-white data-[state=active]:bg-electric">
                    Register
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="space-y-4">
                  <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                    <div>
                      <Label htmlFor="username" className="text-white">Username</Label>
                      <Input
                        id="username"
                        {...loginForm.register('username')}
                        className="bg-gray-800 border-gray-600 text-white"
                        placeholder="Enter your username"
                      />
                      {loginForm.formState.errors.username && (
                        <p className="text-red-400 text-sm mt-1">
                          {loginForm.formState.errors.username.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="password" className="text-white">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        {...loginForm.register('password')}
                        className="bg-gray-800 border-gray-600 text-white"
                        placeholder="Enter your password"
                      />
                      {loginForm.formState.errors.password && (
                        <p className="text-red-400 text-sm mt-1">
                          {loginForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>
                    <Button
                      type="submit"
                      disabled={loginMutation.isPending}
                      className="w-full bg-electric hover:bg-electric/80"
                    >
                      {loginMutation.isPending ? 'Logging in...' : 'Login'}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="register" className="space-y-4">
                  <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName" className="text-white">First Name</Label>
                        <Input
                          id="firstName"
                          {...registerForm.register('firstName')}
                          className="bg-gray-800 border-gray-600 text-white"
                          placeholder="First name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName" className="text-white">Last Name</Label>
                        <Input
                          id="lastName"
                          {...registerForm.register('lastName')}
                          className="bg-gray-800 border-gray-600 text-white"
                          placeholder="Last name"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="registerUsername" className="text-white">Username</Label>
                      <Input
                        id="registerUsername"
                        {...registerForm.register('username')}
                        className="bg-gray-800 border-gray-600 text-white"
                        placeholder="Choose a username"
                      />
                      {registerForm.formState.errors.username && (
                        <p className="text-red-400 text-sm mt-1">
                          {registerForm.formState.errors.username.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-white">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        {...registerForm.register('email')}
                        className="bg-gray-800 border-gray-600 text-white"
                        placeholder="Enter your email"
                      />
                      {registerForm.formState.errors.email && (
                        <p className="text-red-400 text-sm mt-1">
                          {registerForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="registerPassword" className="text-white">Password</Label>
                      <Input
                        id="registerPassword"
                        type="password"
                        {...registerForm.register('password')}
                        className="bg-gray-800 border-gray-600 text-white"
                        placeholder="Choose a password"
                      />
                      {registerForm.formState.errors.password && (
                        <p className="text-red-400 text-sm mt-1">
                          {registerForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>
                    <Button
                      type="submit"
                      disabled={registerMutation.isPending}
                      className="w-full bg-electric hover:bg-electric/80"
                    >
                      {registerMutation.isPending ? 'Creating account...' : 'Create Account'}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}