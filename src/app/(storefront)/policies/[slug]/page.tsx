'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

const policies: Record<string, { title: string; body: string[] }> = {
  shipping: {
    title: 'Shipping Policy',
    body: [
      'We offer free standard shipping on all orders over ₹999 within India.',
      'Orders are processed within 24 hours of placement. Standard delivery takes 3 to 5 business days.',
      'Express shipping (1 to 2 business days) is available at checkout for ₹199.',
      'Once your order ships, you will receive a tracking link via email and SMS.',
    ],
  },
  returns: {
    title: 'Returns & Exchange Policy',
    body: [
      'We want you to love your digital accessories. If you are not completely satisfied, you may return unopened or gently used items within 30 days of delivery.',
      'Items must be returned in their original packaging with all included accessories and documentation.',
      'Refunds are processed to your original payment method within 5 to 7 business days after receipt and inspection.',
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    body: [
      'Lumière respects your privacy. We collect personal information solely to process your orders, provide customer support, and improve your shopping experience.',
      'We do not sell or rent your personal information to third parties. All payment processing is handled securely by Razorpay with SSL encryption.',
    ],
  },
  terms: {
    title: 'Terms of Service',
    body: [
      'By accessing or using the Lumière website, you agree to be bound by these Terms of Service.',
      'All product descriptions, pricing, and availability are subject to change without notice.',
      'Lumière reserves the right to refuse or cancel any order at our discretion.',
    ],
  },
};

export default function PolicyPage({ params }: { params: { slug: string } }) {
  const policy = policies[params.slug] ?? {
    title: 'Store Policy',
    body: ['For information regarding our policies, please contact customer support at support@lumiere.com.'],
  };

  return (
    <div className="container-site py-12 max-w-3xl">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-foreground-secondary hover:text-foreground mb-8 transition-colors">
        <ArrowLeft size={16} />
        Back to Home
      </Link>
      <h1 className="font-serif text-3xl lg:text-4xl font-medium mb-8">{policy.title}</h1>
      <div className="space-y-4 text-foreground-secondary leading-relaxed">
        {policy.body.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </div>
  );
}
