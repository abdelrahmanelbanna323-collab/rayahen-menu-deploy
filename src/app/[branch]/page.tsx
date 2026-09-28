"use client";
import React, { use } from 'react';
import GuestMenu from '@/components/menu/GuestMenu';

export default function GuestMenuPage({ params }: { params: Promise<{ branch: string }> }) {
  const resolvedParams = use(params);
  const branchParam = resolvedParams.branch;
  return <GuestMenu branchParam={branchParam} />;
}
