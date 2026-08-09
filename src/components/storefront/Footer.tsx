'use client';

import React from 'react';
import Link from 'next/link';


interface IconProps { size?: number }

const InstagramIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);
const FacebookIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);
const TwitterIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
  </svg>
);
const YoutubeIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-1.96C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.4 19.54C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/>
  </svg>
);

const navSections = [
  {
    title: 'Shop Tech',
    links: [
      { label: 'Headphones & Audio', href: '/products?category=audio' },
      { label: 'Smartwatches', href: '/products?category=wearables' },
      { label: 'Keyboards & Mice', href: '/products?category=keyboards-mice' },
      { label: 'Desk Setup', href: '/products?category=desk-essentials' },
      { label: 'Deals & Sale', href: '/products?sale=true' },
    ],
  },
  {
    title: 'Info',
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'Contact', href: '/contact' },
      { label: 'FAQ', href: '/faq' },
      { label: 'Shipping Policy', href: '/policies/shipping' },
      { label: 'Returns Policy', href: '/policies/returns' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/policies/privacy' },
      { label: 'Terms of Service', href: '/policies/terms' },
    ],
  },
];

const paymentIcons = ['visa', 'mastercard', 'amex', 'upi', 'razorpay'];

const socialLinks = [
  { icon: InstagramIcon, href: '#', label: 'Instagram' },
  { icon: FacebookIcon, href: '#', label: 'Facebook' },
  { icon: TwitterIcon, href: '#', label: 'Twitter' },
  { icon: YoutubeIcon, href: '#', label: 'YouTube' },
];

export function Footer() {
  return (
    <footer className="bg-foreground text-white mt-20">
      <div className="container-site py-16 lg:py-20">
        {/* Main grid */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12 pb-12 border-b border-white/10">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-2">
            <Link
              href="/"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="font-serif text-2xl font-medium text-white hover:opacity-80 transition-opacity"
            >
              Lumière
            </Link>
            <p className="text-sm text-white/50 mt-4 leading-relaxed max-w-xs">
              Curated digital accessories for the modern workspace. Premium audio, precision peripherals, and smart wearables.
            </p>
            {/* Social */}
            <div className="flex items-center gap-3 mt-6">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-white/40 transition-colors"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Nav sections */}
          {navSections.map((section) => (
            <div key={section.title}>
              <p className="text-[11px] uppercase tracking-[0.15em] font-semibold text-white/40 mb-4">
                {section.title}
              </p>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/60 hover:text-white transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} Lumière. All rights reserved.
          </p>

          {/* Payment icons */}
          <div className="flex items-center gap-3">
            {paymentIcons.map((name) => (
              <div
                key={name}
                className="h-6 px-2 bg-white/10 rounded flex items-center justify-center"
              >
                <span className="text-[10px] text-white/50 font-medium uppercase tracking-wide">
                  {name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
