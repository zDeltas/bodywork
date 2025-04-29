import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Header } from '@/app/components/Header';

interface StatsHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function StatsHeader({ searchQuery, setSearchQuery }: StatsHeaderProps) {
  const { t } = useTranslation();

  return (
    <Header
      title={t('stats.title')}
      showBackButton={true}
    />
  );
} 
