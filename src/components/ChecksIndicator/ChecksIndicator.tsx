import { Icon, Tooltip } from '@stonal-tech/lib-design-system-react';
import type { ChecksStatus } from '@localTypes/github';

const CHECKS_CONFIG: Record<ChecksStatus, { icon: string; color: 'success' | 'error' | 'pending' | 'info'; label: string }> = {
  success: { icon: 'circle-check', color: 'success', label: 'All checks passed' },
  failure: { icon: 'circle-xmark', color: 'error', label: 'Some checks failed' },
  pending: { icon: 'clock', color: 'pending', label: 'Checks in progress' },
  none: { icon: 'circle-minus', color: 'info', label: 'No checks' },
};

interface ChecksIndicatorProps {
  status: ChecksStatus;
}

export const ChecksIndicator = ({ status }: ChecksIndicatorProps) => {
  const config = CHECKS_CONFIG[status];

  return (
    <Tooltip.Root>
      <Tooltip.Trigger>
        <Icon name={config.icon as any} color={config.color} variantSize="sm" />
      </Tooltip.Trigger>
      <Tooltip.Content placement="top">{config.label}</Tooltip.Content>
    </Tooltip.Root>
  );
};
