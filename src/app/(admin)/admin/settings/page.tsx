'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Save } from 'lucide-react';
import type { SiteSettings } from '@/types';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Partial<SiteSettings>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { success, error: showError } = useToast();
  const supabase = createClient();

  useEffect(() => {
    supabase.from('site_settings').select('*').single().then(({ data }) => {
      if (data) setSettings(data as SiteSettings);
      setIsLoading(false);
    });
  }, [supabase]);

  const handleSave = async () => {
    setIsSaving(true);
    const { error } = await supabase
      .from('site_settings')
      .update(settings)
      .eq('id', settings.id!);
    setIsSaving(false);
    if (error) showError('Save failed', error.message);
    else success('Settings saved!');
  };

  const set = (field: keyof SiteSettings, value: string) =>
    setSettings((prev) => ({ ...prev, [field]: value }));

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-14 skeleton rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Site Settings</h1>
        <Button isLoading={isSaving} onClick={handleSave} leftIcon={<Save size={16} />}>
          Save Changes
        </Button>
      </div>

      {/* Brand */}
      <Section title="Brand Identity">
        <Input label="Store Name" value={settings.store_name ?? ''} onChange={(e) => set('store_name', e.target.value)} />
        <Input label="Contact Email" type="email" value={settings.contact_email ?? ''} onChange={(e) => set('contact_email', e.target.value)} />
        <Input label="Contact Phone" type="tel" value={settings.contact_phone ?? ''} onChange={(e) => set('contact_phone', e.target.value)} />
        <Input label="Store Address" value={settings.address ?? ''} onChange={(e) => set('address', e.target.value)} />
      </Section>

      {/* Announcement bar */}
      <Section title="Announcement Bar">
        <Input label="Announcement Text" value={settings.announcement_bar_text ?? ''} onChange={(e) => set('announcement_bar_text', e.target.value)} hint="Leave blank to hide the announcement bar" />
        <Input label="Announcement Link (optional)" value={settings.announcement_bar_link ?? ''} onChange={(e) => set('announcement_bar_link', e.target.value)} />
      </Section>

      {/* Social */}
      <Section title="Social Media">
        {[
          { field: 'social_instagram' as keyof SiteSettings, label: 'Instagram URL' },
          { field: 'social_facebook' as keyof SiteSettings, label: 'Facebook URL' },
          { field: 'social_twitter' as keyof SiteSettings, label: 'Twitter/X URL' },
          { field: 'social_youtube' as keyof SiteSettings, label: 'YouTube URL' },
          { field: 'social_tiktok' as keyof SiteSettings, label: 'TikTok URL' },
        ].map(({ field, label }) => (
          <Input key={field} label={label} type="url" value={(settings[field] as string) ?? ''} onChange={(e) => set(field, e.target.value)} />
        ))}
      </Section>

      <div className="pt-4">
        <Button isLoading={isSaving} onClick={handleSave} size="lg" shimmer leftIcon={<Save size={16} />}>
          Save All Changes
        </Button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-border shadow-card p-6 space-y-4">
      <h2 className="font-semibold text-base border-b border-border pb-3">{title}</h2>
      {children}
    </div>
  );
}
