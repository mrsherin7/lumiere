'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';

export default function ContactPage() {
  const { success } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      success('Message sent!', 'We will respond within 24 hours.');
    }, 600);
  };

  return (
    <div className="container-site py-12 max-w-4xl">
      <div className="text-center max-w-xl mx-auto mb-12 space-y-3">
        <p className="label-text">Get In Touch</p>
        <h1 className="font-serif text-4xl font-medium">Contact Customer Support</h1>
        <p className="text-foreground-secondary text-sm">
          Have a question about our headphones, smartwatches, keyboards, or your order? We&apos;re here to help.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-6">
          <div className="card p-6 space-y-3">
            <Mail size={20} className="text-foreground-secondary" />
            <h3 className="font-medium text-sm">Email Us</h3>
            <p className="text-xs text-foreground-secondary">support@lumiere-tech.com</p>
          </div>
          <div className="card p-6 space-y-3">
            <Phone size={20} className="text-foreground-secondary" />
            <h3 className="font-medium text-sm">Call Us</h3>
            <p className="text-xs text-foreground-secondary">+91 1800-123-4567</p>
          </div>
          <div className="card p-6 space-y-3">
            <MapPin size={20} className="text-foreground-secondary" />
            <h3 className="font-medium text-sm">Headquarters</h3>
            <p className="text-xs text-foreground-secondary">Indiranagar, Bangalore, KA, India</p>
          </div>
        </div>

        <div className="md:col-span-2 card p-8">
          {submitted ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-12 h-12 bg-success rounded-full flex items-center justify-center mx-auto text-white">
                <Check size={24} />
              </div>
              <h3 className="font-serif text-xl font-medium">Message Received!</h3>
              <p className="text-sm text-foreground-secondary">Thank you for reaching out. We will be in touch shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input label="Your Name" required />
              <Input label="Email Address" type="email" required />
              <Input label="Order Number (optional)" />
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-foreground">Message</label>
                <textarea
                  rows={4}
                  required
                  placeholder="How can we help you?"
                  className="w-full px-4 py-3 text-sm border border-border-strong rounded-xl focus:outline-none focus:border-accent resize-none"
                />
              </div>
              <Button type="submit" fullWidth size="lg" shimmer isLoading={loading} rightIcon={<Send size={16} />}>
                Send Message
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
