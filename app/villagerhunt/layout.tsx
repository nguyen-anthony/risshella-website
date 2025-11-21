"use client";
import ChangelogNotification from '@/components/villagerhunt/ChangelogNotification';
import Navigation from '@/components/common/Navigation';

export default function VillagerHuntLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navigation />
      {children}
      <ChangelogNotification />
    </>
  );
}