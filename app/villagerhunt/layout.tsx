"use client";
import ChangelogNotification from '@/components/villagerhunt/notifications/ChangelogNotification';
import Navigation from '@/components/common/Navigation';
import { usePathname, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isOverlay = pathname?.includes('/overlay');
  const isModEmbed = searchParams?.get('modembed') === 'true';

  return (
    <>
      {!isOverlay && !isModEmbed && <Navigation />}
      {children}
      {!isOverlay && !isModEmbed && <ChangelogNotification />}
    </>
  );
}

export default function VillagerHuntLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<>{children}</>}>
      <LayoutContent>{children}</LayoutContent>
    </Suspense>
  );
}