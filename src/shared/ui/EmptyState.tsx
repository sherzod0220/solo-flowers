import type { ReactNode } from 'react';
import { Empty } from 'antd';

interface EmptyStateProps {
  description: ReactNode;
}

export function EmptyState({ description }: EmptyStateProps) {
  return (
    <div style={{ padding: '64px 0', textAlign: 'center' }}>
      <Empty description={description} />
    </div>
  );
}
