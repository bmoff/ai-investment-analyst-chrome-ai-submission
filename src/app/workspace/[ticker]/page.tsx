'use client';

import { use } from 'react';
import { useSearchParams } from 'next/navigation';
import { WorkspaceLayout } from '@/features/workspace/components/WorkspaceLayout';
import { AppLayout } from '@/shared/components/AppLayout';

interface PageProps {
  params: Promise<{
    ticker: string;
  }>;
}

export default function WorkspacePage({ params }: PageProps) {
  const { ticker } = use(params);
  const searchParams = useSearchParams();
  const noteParam = searchParams.get('note');

  return (
    <AppLayout>
      <WorkspaceLayout ticker={ticker} initialNote={noteParam || undefined} />
    </AppLayout>
  );
}