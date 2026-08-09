'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';

const faqs = [
  {
    q: 'Are all digital products covered under warranty?',
    a: 'Yes! All headphones, earpods, smartwatches, keyboards, and electronic accessories sold on Lumière carry a minimum 1-year brand warranty.',
  },
  {
    q: 'How long does shipping take?',
    a: 'Standard delivery takes 3 to 5 business days across India. Express delivery options (1-2 business days) are available at checkout.',
  },
  {
    q: 'What is your return & exchange policy?',
    a: 'We offer a 30-day return policy for unopened or gently tested products. Simply initiate a return from your Account dashboard or contact support.',
  },
  {
    q: 'Are the mechanical keyboards hot-swappable?',
    a: 'Yes, our Tactile Pro mechanical keyboards feature universal hot-swappable sockets compatible with 3-pin and 5-pin Cherry, Gateron, and Kailh switches.',
  },
  {
    q: 'Which payment methods do you accept?',
    a: 'We accept Credit/Debit cards (Visa, Mastercard, Amex), UPI (GPay, PhonePe, Paytm), Net Banking, and Wallets securely via Razorpay.',
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="container-site py-12 max-w-3xl">
      <div className="text-center max-w-xl mx-auto mb-12 space-y-3">
        <p className="label-text">Help Center</p>
        <h1 className="font-serif text-4xl font-medium">Frequently Asked Questions</h1>
        <p className="text-foreground-secondary text-sm">
          Everything you need to know about our products, shipping, warranty, and returns.
        </p>
      </div>

      <div className="divide-y divide-border border-y border-border">
        {faqs.map((faq, i) => {
          const isOpen = openIndex === i;
          return (
            <div key={i} className="py-5">
              <button
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="w-full flex items-center justify-between text-left font-medium text-lg hover:text-accent transition-colors cursor-pointer"
              >
                {faq.q}
                <motion.div animate={{ rotate: isOpen ? 45 : 0 }} transition={{ duration: 0.2 }}>
                  <Plus size={18} className="shrink-0 text-foreground-secondary" />
                </motion.div>
              </button>
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <p className="pt-3 text-sm text-foreground-secondary leading-relaxed">{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
