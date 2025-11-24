"use client";
import ChangelogNotification from '@/components/villagerhunt/ChangelogNotification';
import Navigation from '@/components/common/Navigation';
import { usePathname } from 'next/navigation';

export default function VillagerHuntLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isOverlay = pathname?.includes('/overlay');

  return (
    <>
      {!isOverlay && <Navigation />}
      {children}
      {!isOverlay && <ChangelogNotification />}
    </>
  );
}