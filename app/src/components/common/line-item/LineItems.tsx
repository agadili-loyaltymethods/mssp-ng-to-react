
import { formatters } from '@/lib/utils/formatters';

interface LineItemProps {
  lineItem: {
    label: string;
    value: number;
    color?: string;
    size?: string;
    currency?: string;
  };
}

export function LineItem({ lineItem }: LineItemProps) {
  const { label, value, color, size, currency } = lineItem;

  return (
    <div 
      className={`
        flex w-full items-center justify-between gap-2.5 py-1.5 px-5 font-semibold
        ${!size ? 'text-sm' : ''}
        ${size === 'medium' ? 'text-base' : ''}
        ${color === 'green' ? 'text-green-600' : ''}
      `}
    >
      <div>{label}</div>
      <div>
        {currency ? formatters.formatCurrency(value) : formatters.formatNumber(value)}
      </div>
    </div>
  );
}
