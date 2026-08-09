'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Cpu, Zap, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function AboutPage() {
  return (
    <div className="container-site py-12 space-y-16">
      <div className="max-w-3xl space-y-4">
        <p className="label-text">Our Philosophy</p>
        <h1 className="font-serif text-4xl lg:text-5xl font-medium leading-tight">
          Curated Tech Accessories for the Modern Desk.
        </h1>
        <p className="text-foreground-secondary text-lg leading-relaxed pt-2">
          Lumière was born from a passion for precision engineering, acoustic purity, and minimalist aesthetics. We design and curate digital essentials that elevate your daily workflow.
        </p>
      </div>

      <div className="relative aspect-[21/9] rounded-3xl overflow-hidden bg-background-secondary">
        <Image
          src="https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=1920&q=80"
          alt="Lumière Desk Setup"
          fill
          sizes="100vw"
          className="object-cover"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { icon: Cpu, title: 'Precision Engineering', desc: 'Every headphone, keyboard, and smartwatch is chosen for superior build quality and performance.' },
          { icon: Zap, title: 'Acoustic & Wireless Excellence', desc: 'High-fidelity audio codecs, zero-latency Bluetooth 5.3, and fast 15W wireless charging.' },
          { icon: ShieldCheck, title: 'Guaranteed Quality', desc: '100% genuine products backed by full warranty and 30-day hassle-free returns.' },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="card p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center">
              <Icon size={20} className="text-foreground-secondary" />
            </div>
            <h3 className="font-serif text-lg font-medium">{title}</h3>
            <p className="text-sm text-foreground-secondary leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>

      <div className="text-center pt-8">
        <Link href="/products">
          <Button size="lg" shimmer rightIcon={<ArrowRight size={18} />}>
            Explore Digital Collection
          </Button>
        </Link>
      </div>
    </div>
  );
}
