"use client";
import ChangelogNotification from '@/components/villagerhunt/ChangelogNotification';

export default function VillagerHuntLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <ChangelogNotification />
    </>
  );
}