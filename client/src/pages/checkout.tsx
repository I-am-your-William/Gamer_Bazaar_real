import { useState } from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { CartItemWithProduct } from '@/lib/types';
import { CreditCard, Shield, Truck } from 'lucide-react';

const checkoutSchema = z.object({
  shippingAddress: z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    address: z.string().min(1, 'Address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    zipCode: z.string().min(5, 'ZIP code must be at least 5 characters'),
    country: z.string().min(1, 'Country is required'),
  }),
  billingAddress: z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    address: z.string().min(1, 'Address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    zipCode: z.string().min(5, 'ZIP code must be at least 5 characters'),
    country: z.string().min(1, 'Country is required'),
  }),
  paymentMethod: z.string().min(1, 'Payment method is required'),
  cardNumber: z.string().optional(),
  expiryDate: z.string().optional(),
  cvv: z.string().optional(),
  cardName: z.string().optional(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [sameAsShipping, setSameAsShipping] = useState(true);

  const { data: cartItems = [], isLoading: cartLoading } = useQuery({
    queryKey: ['/api/cart'],
  });

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      shippingAddress: {
        firstName: '',
        lastName: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'United States',
      },
      billingAddress: {
        firstName: '',
        lastName: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'United States',
      },
      paymentMethod: 'credit_card',
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: async (data: CheckoutFormData) => {
      const orderData = {
        shippingAddress: data.shippingAddress,
        billingAddress: sameAsShipping ? data.shippingAddress : data.billingAddress,
        paymentMethod: data.paymentMethod,
      };
      return await apiRequest('POST', '/api/orders', orderData);
    },
    onSuccess: (response) => {
      toast({
        title: "Order placed successfully!",
        description: "You will receive an email confirmation shortly.",
      });
      setLocation('/orders');
    },
    onError: (error) => {
      toast({
        title: "Order failed",
        description: "There was an error processing your order. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CheckoutFormData) => {
    createOrderMutation.mutate(data);
  };

  const subtotal = cartItems.reduce(
    (sum: number, item: CartItemWithProduct) => 
      sum + (parseFloat(item.product.salePrice || item.product.price) * item.quantity), 
    0
  );

  const tax = subtotal * 0.08;
  const shipping = subtotal > 50 ? 0 : 9.99;
  const total = subtotal + tax + shipping;

  if (cartLoading) {
    return (
      <div className="min-h-screen bg-deep-black text-white">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="animate-pulse">Loading...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-deep-black text-white">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl font-bold mb-4">Your cart is empty</h1>
          <p className="text-gray-400 mb-8">Add some items to your cart before checkout.</p>
          <Button 
            onClick={() => setLocation('/products')}
            className="bg-electric text-deep-black"
          >
            Continue Shopping
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-deep-black text-white">
      <Header />
      
      {/* Header */}
      <section className="hero-gradient py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="font-orbitron font-bold text-4xl lg:text-6xl mb-4">
              SECURE <span className="text-electric">CHECKOUT</span>
            </h1>
            <p className="text-xl text-gray-300">
              Complete your gaming gear purchase
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-8">
              {/* Shipping Address */}
              <Card className="gaming-card">
                <CardHeader>
                  <CardTitle className="flex items-center font-orbitron">
                    <Truck className="h-5 w-5 mr-2 text-electric" />
                    Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="shippingAddress.firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-dark-gray border-electric/30" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="shippingAddress.lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-dark-gray border-electric/30" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="shippingAddress.address"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-dark-gray border-electric/30" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="shippingAddress.city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-dark-gray border-electric/30" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="shippingAddress.state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State</FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-dark-gray border-electric/30" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="shippingAddress.zipCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ZIP Code</FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-dark-gray border-electric/30" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="shippingAddress.country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-dark-gray border-electric/30">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-charcoal border-electric/20">
                            <SelectItem value="United States">United States</SelectItem>
                            <SelectItem value="Canada">Canada</SelectItem>
                            <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Billing Address */}
              <Card className="gaming-card">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between font-orbitron">
                    <div className="flex items-center">
                      <CreditCard className="h-5 w-5 mr-2 text-neon-green" />
                      Billing Address
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="sameAsShipping"
                        checked={sameAsShipping}
                        onCheckedChange={setSameAsShipping}
                      />
                      <Label htmlFor="sameAsShipping" className="text-sm">
                        Same as shipping
                      </Label>
                    </div>
                  </CardTitle>
                </CardHeader>
                {!sameAsShipping && (
                  <CardContent className="grid md:grid-cols-2 gap-4">
                    {/* Billing address fields - same structure as shipping */}
                    <FormField
                      control={form.control}
                      name="billingAddress.firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input {...field} className="bg-dark-gray border-electric/30" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {/* Add other billing fields similar to shipping */}
                  </CardContent>
                )}
              </Card>

              {/* Payment Method */}
              <Card className="gaming-card">
                <CardHeader>
                  <CardTitle className="flex items-center font-orbitron">
                    <Shield className="h-5 w-5 mr-2 text-gaming-purple" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-dark-gray border-electric/30">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-charcoal border-electric/20">
                            <SelectItem value="credit_card">Credit Card</SelectItem>
                            <SelectItem value="paypal">PayPal</SelectItem>
                            <SelectItem value="apple_pay">Apple Pay</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {form.watch('paymentMethod') === 'credit_card' && (
                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="cardNumber"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Card Number</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="1234 5678 9012 3456" className="bg-dark-gray border-electric/30" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="expiryDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Expiry Date</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="MM/YY" className="bg-dark-gray border-electric/30" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="cvv"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>CVV</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="123" className="bg-dark-gray border-electric/30" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="gaming-card sticky top-24">
                <CardHeader>
                  <CardTitle className="font-orbitron">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Cart Items */}
                  <div className="space-y-3">
                    {cartItems.map((item: CartItemWithProduct) => (
                      <div key={item.id} className="flex justify-between items-center text-sm">
                        <div className="flex-1">
                          <p className="font-medium line-clamp-1">{item.product.name}</p>
                          <p className="text-gray-400">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-semibold">
                          ${(parseFloat(item.product.salePrice || item.product.price) * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-electric/20 pt-4 space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax:</span>
                      <span>${tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping:</span>
                      <span>${shipping.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-electric/20 pt-2">
                      <div className="flex justify-between items-center text-lg font-bold">
                        <span>Total:</span>
                        <span className="text-neon-green">${total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <Button 
                    type="submit"
                    disabled={createOrderMutation.isPending}
                    className="w-full bg-gradient-to-r from-electric to-neon-green text-deep-black font-bold py-3 rounded-lg hover:shadow-neon-glow"
                  >
                    {createOrderMutation.isPending ? (
                      <div className="animate-spin h-5 w-5 border-2 border-deep-black border-t-transparent rounded-full mr-2"></div>
                    ) : null}
                    PLACE ORDER
                  </Button>

                  <div className="text-xs text-gray-400 space-y-1">
                    <p>🔒 Your payment information is secure and encrypted</p>
                    <p>📱 QR codes will be generated after order confirmation</p>
                    <p>📧 Order confirmation will be sent to your email</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </form>
        </Form>
      </div>

      <Footer />
    </div>
  );
}
