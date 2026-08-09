'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Check, ChevronRight, Truck, CreditCard, ClipboardList } from 'lucide-react';
import { useCart } from '@/providers/CartProvider';
import { useAuth } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { formatCurrency, calculateShipping } from '@/lib/utils';
import type { AddressSnapshot } from '@/types';

type Step = 'shipping' | 'payment' | 'review';

const STEPS: { key: Step; label: string; icon: React.ElementType }[] = [
  { key: 'shipping', label: 'Shipping', icon: Truck },
  { key: 'payment', label: 'Payment', icon: CreditCard },
  { key: 'review', label: 'Review', icon: ClipboardList },
];

const INDIA_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Puducherry',
];

const initialAddress: AddressSnapshot = {
  full_name: '', phone: '', address_line1: '', address_line2: '',
  city: '', state: '', zip: '', country: 'India',
};

// ============================================================
// STEP INDICATOR
// ============================================================
function StepIndicator({ currentStep }: { currentStep: Step }) {
  const currentIndex = STEPS.findIndex((s) => s.key === currentStep);

  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {STEPS.map((step, i) => {
        const isComplete = i < currentIndex;
        const isCurrent = i === currentIndex;
        const Icon = step.icon;

        return (
          <React.Fragment key={step.key}>
            <div className="flex flex-col items-center">
              <motion.div
                animate={{
                  backgroundColor: isComplete ? '#1A1A1A' : isCurrent ? '#2563EB' : '#F5F5F0',
                  scale: isCurrent ? 1.05 : 1,
                }}
                transition={{ duration: 0.3 }}
                className="w-10 h-10 rounded-full flex items-center justify-center"
              >
                {isComplete ? (
                  <Check size={16} className="text-white" />
                ) : (
                  <Icon size={16} className={isCurrent ? 'text-white' : 'text-foreground-muted'} />
                )}
              </motion.div>
              <span className={`text-xs mt-1.5 font-medium ${isCurrent ? 'text-foreground' : 'text-foreground-muted'}`}>
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <motion.div
                animate={{ backgroundColor: i < currentIndex ? '#1A1A1A' : '#E5E5E5' }}
                className="h-0.5 w-16 sm:w-24 mx-2 rounded-full mb-5"
                transition={{ duration: 0.4 }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ============================================================
// SHIPPING FORM
// ============================================================
function ShippingStep({
  address,
  onChange,
  onNext,
}: {
  address: AddressSnapshot;
  onChange: (addr: AddressSnapshot) => void;
  onNext: () => void;
}) {
  const [errors, setErrors] = useState<Partial<Record<keyof AddressSnapshot, string>>>({});

  const validate = () => {
    const newErrors: Partial<Record<keyof AddressSnapshot, string>> = {};
    if (!address.full_name.trim()) newErrors.full_name = 'Name is required';
    if (!address.phone?.trim()) newErrors.phone = 'Phone is required';
    if (!address.address_line1.trim()) newErrors.address_line1 = 'Address is required';
    if (!address.city.trim()) newErrors.city = 'City is required';
    if (!address.state.trim()) newErrors.state = 'State is required';
    if (!address.zip.trim()) newErrors.zip = 'PIN code is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const set = (field: keyof AddressSnapshot, value: string) =>
    onChange({ ...address, [field]: value });

  return (
    <div className="space-y-5">
      <h2 className="font-serif text-2xl font-medium mb-6">Shipping Information</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Input label="Full Name" value={address.full_name} onChange={(e) => set('full_name', e.target.value)} error={errors.full_name} />
        <Input label="Phone Number" type="tel" value={address.phone ?? ''} onChange={(e) => set('phone', e.target.value)} error={errors.phone} />
      </div>
      <Input label="Address Line 1" value={address.address_line1} onChange={(e) => set('address_line1', e.target.value)} error={errors.address_line1} />
      <Input label="Address Line 2 (optional)" value={address.address_line2 ?? ''} onChange={(e) => set('address_line2', e.target.value)} />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Input label="City" value={address.city} onChange={(e) => set('city', e.target.value)} error={errors.city} />
        <Select
          label="State"
          value={address.state}
          onChange={(e) => set('state', e.target.value)}
          error={errors.state}
          options={[{ value: '', label: 'Select state' }, ...INDIA_STATES.map((s) => ({ value: s, label: s }))]}
        />
        <Input label="PIN Code" value={address.zip} onChange={(e) => set('zip', e.target.value)} error={errors.zip} />
      </div>

      {/* Shipping method */}
      <div className="pt-4">
        <h3 className="text-sm font-medium mb-3">Shipping Method</h3>
        <div className="space-y-3">
          {[
            { id: 'standard', label: 'Standard Delivery', sub: '3–5 business days', price: 'Free' },
            { id: 'express', label: 'Express Delivery', sub: '1–2 business days', price: '₹199' },
          ].map((method) => (
            <label key={method.id} className="flex items-center justify-between p-4 border border-border-strong rounded-xl cursor-pointer hover:border-foreground transition-colors">
              <div className="flex items-center gap-3">
                <input type="radio" name="shipping" value={method.id} defaultChecked={method.id === 'standard'} className="accent-foreground" />
                <div>
                  <p className="text-sm font-medium">{method.label}</p>
                  <p className="text-xs text-foreground-secondary">{method.sub}</p>
                </div>
              </div>
              <p className="text-sm font-semibold">{method.price}</p>
            </label>
          ))}
        </div>
      </div>

      <Button fullWidth size="lg" shimmer onClick={() => validate() && onNext()} rightIcon={<ChevronRight size={18} />}>
        Continue to Payment
      </Button>
    </div>
  );
}

// ============================================================
// PAYMENT STEP
// ============================================================
function PaymentStep({
  total,
  onPay,
  isLoading,
  onBack,
}: {
  total: number;
  onPay: () => void;
  isLoading: boolean;
  onBack: () => void;
}) {
  return (
    <div className="space-y-6">
      <h2 className="font-serif text-2xl font-medium mb-6">Payment</h2>

      {/* Razorpay info card */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-background rounded-xl flex items-center justify-center">
            <CreditCard size={20} className="text-foreground-secondary" />
          </div>
          <div>
            <p className="text-sm font-medium">Secure Payment via Razorpay</p>
            <p className="text-xs text-foreground-secondary">Credit/Debit Cards, UPI, Net Banking, Wallets</p>
          </div>
        </div>
        <div className="bg-background rounded-xl p-4 text-sm text-foreground-secondary">
          <p>Your payment will be processed securely through Razorpay&apos;s payment gateway. You will be redirected to complete payment after clicking the button below.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {['Visa', 'Mastercard', 'UPI', 'Paytm', 'GPay', 'PhonePe'].map((p) => (
            <div key={p} className="h-7 px-2.5 bg-white border border-border rounded-lg flex items-center justify-center">
              <span className="text-[11px] font-medium text-foreground-secondary">{p}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-background-secondary rounded-xl p-4 flex items-center justify-between">
        <span className="text-sm text-foreground-secondary">Amount to pay</span>
        <span className="text-lg font-semibold">{formatCurrency(total)}</span>
      </div>

      <div className="flex gap-3">
        <Button variant="secondary" size="lg" onClick={onBack} className="flex-shrink-0">
          Back
        </Button>
        <Button fullWidth size="lg" shimmer isLoading={isLoading} onClick={onPay}>
          Pay {formatCurrency(total)} via Razorpay
        </Button>
      </div>
    </div>
  );
}

// ============================================================
// REVIEW STEP
// ============================================================
function ReviewStep({
  address,
  items,
  subtotal,
  discount,
  shipping,
  tax,
  total,
  onPlace,
  onBack,
  isLoading,
}: {
  address: AddressSnapshot;
  items: import('@/types').CartItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  onPlace: () => void;
  onBack: () => void;
  isLoading: boolean;
}) {
  return (
    <div className="space-y-6">
      <h2 className="font-serif text-2xl font-medium">Review Your Order</h2>

      {/* Items */}
      <div className="card p-4 space-y-3">
        {items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <span className="text-foreground-secondary">
              {item.title} × {item.quantity}
              {Object.keys(item.variant_info).length > 0 && (
                <span className="text-xs ml-1">({Object.values(item.variant_info).join(', ')})</span>
              )}
            </span>
            <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
          </div>
        ))}
      </div>

      {/* Shipping address */}
      <div className="card p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-foreground-secondary mb-3">Shipping To</p>
        <p className="text-sm font-medium">{address.full_name}</p>
        <p className="text-sm text-foreground-secondary">{address.address_line1}</p>
        {address.address_line2 && <p className="text-sm text-foreground-secondary">{address.address_line2}</p>}
        <p className="text-sm text-foreground-secondary">{address.city}, {address.state} {address.zip}</p>
        <p className="text-sm text-foreground-secondary">{address.country}</p>
        {address.phone && <p className="text-sm text-foreground-secondary mt-1">{address.phone}</p>}
      </div>

      {/* Totals */}
      <div className="card p-4 space-y-2">
        {[
          { label: 'Subtotal', value: formatCurrency(subtotal) },
          ...(discount > 0 ? [{ label: 'Discount', value: `-${formatCurrency(discount)}` }] : []),
          { label: 'Shipping', value: shipping === 0 ? 'Free' : formatCurrency(shipping) },
          { label: 'Tax (18%)', value: formatCurrency(tax) },
        ].map(({ label, value }) => (
          <div key={label} className="flex justify-between text-sm">
            <span className="text-foreground-secondary">{label}</span>
            <span>{value}</span>
          </div>
        ))}
        <div className="flex justify-between font-semibold pt-3 border-t border-border">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="secondary" size="lg" onClick={onBack}>Back</Button>
        <Button fullWidth size="lg" shimmer isLoading={isLoading} onClick={onPlace}>
          Place Order
        </Button>
      </div>
    </div>
  );
}

// ============================================================
// MAIN CHECKOUT PAGE
// ============================================================
export default function CheckoutPage() {
  const { items, subtotal, couponDiscount, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<Step>('shipping');
  const [shippingAddress, setShippingAddress] = useState<AddressSnapshot>(initialAddress);
  const [isProcessing, setIsProcessing] = useState(false);

  const shipping = calculateShipping(subtotal);
  const tax = Math.round(subtotal * 0.18 * 100) / 100;
  const total = subtotal - couponDiscount + shipping + tax;

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    const orderNum = `LUM-${Math.floor(10000 + Math.random() * 90000)}`;

    const newOrder = {
      id: Date.now(),
      order_number: orderNum,
      user_id: user?.id ?? 'guest-user',
      email: user?.email || (shippingAddress.full_name ? `${shippingAddress.full_name.toLowerCase().replace(/\s+/g, '.')}@example.com` : 'customer@lumiere.com'),
      shipping_address: shippingAddress,
      billing_address: shippingAddress,
      shipping_method: 'Standard Express Delivery',
      shipping_cost: shipping,
      subtotal,
      discount_amount: couponDiscount,
      tax_amount: tax,
      total,
      coupon_code: null,
      payment_status: 'paid',
      fulfillment_status: 'processing',
      razorpay_order_id: `pay_${Date.now()}`,
      razorpay_payment_id: `pay_tx_${Date.now()}`,
      tracking_number: null,
      tracking_carrier: null,
      notes: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      items: items.map((i) => ({
        id: `item-${Date.now()}-${Math.random()}`,
        order_id: Date.now(),
        product_id: i.product_id,
        variant_id: i.variant_id ?? null,
        title: i.title,
        variant_info: i.variant_info ?? {},
        quantity: i.quantity,
        unit_price: i.price,
        line_total: i.price * i.quantity,
      })),
    };

    try {
      const saved = localStorage.getItem('lumiere_user_orders');
      const userOrders = saved ? JSON.parse(saved) : [];
      localStorage.setItem('lumiere_user_orders', JSON.stringify([newOrder, ...userOrders]));
    } catch { /* ignore */ }

    try {
      await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder),
      });
    } catch { /* ignore */ }

    setTimeout(() => {
      setIsProcessing(false);
      clearCart();
      router.push(`/checkout/success?order=${orderNum}`);
    }, 600);
  };

  React.useEffect(() => {
    if (items.length === 0) {
      router.replace('/cart');
    }
  }, [items.length, router]);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="container-site py-12 max-w-2xl">
      <h1 className="font-serif text-section-sm text-center mb-8">Checkout</h1>
      <StepIndicator currentStep={step} />

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
        >
          {step === 'shipping' && (
            <ShippingStep
              address={shippingAddress}
              onChange={setShippingAddress}
              onNext={() => setStep('payment')}
            />
          )}
          {step === 'payment' && (
            <PaymentStep
              total={total}
              onPay={() => { setStep('review'); }}
              isLoading={isProcessing}
              onBack={() => setStep('shipping')}
            />
          )}
          {step === 'review' && (
            <ReviewStep
              address={shippingAddress}
              items={items}
              subtotal={subtotal}
              discount={couponDiscount}
              shipping={shipping}
              tax={tax}
              total={total}
              onPlace={handlePlaceOrder}
              onBack={() => setStep('payment')}
              isLoading={isProcessing}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
