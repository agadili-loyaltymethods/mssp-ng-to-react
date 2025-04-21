
import { Dialog } from '@mui/material';
import { cn } from '@/lib/utils';

interface CommonModalProps {
  title?: string;
  body: string;
  primaryBtnLabel?: string;
  secondaryBtnLabel?: string;
  onClose: () => void;
  onConfirm: () => void;
  className?: string;
}

export function CommonModal({
  title,
  body,
  primaryBtnLabel = 'Proceed',
  secondaryBtnLabel = 'Cancel',
  onClose,
  onConfirm,
  className
}: CommonModalProps) {
  return (
    <div className={cn("flex flex-col min-w-[600px] min-h-[200px] p-2.5", className)}>
      <div className="flex items-center justify-between text-center">
        {title && <h3>{title}</h3>}
        <button 
          onClick={onClose}
          className="text-primary p-2 rounded-full hover:bg-gray-100"
        >
          &times;
        </button>
      </div>
      
      <div dangerouslySetInnerHTML={{ __html: body }} />
      
      <div className="flex justify-end">
        <div className="flex justify-end gap-5">
          <button
            onClick={onClose}
            className="text-accent hover:bg-gray-100 px-4 py-2 rounded"
          >
            {secondaryBtnLabel}
          </button>
          <button
            onClick={onConfirm}
            className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark"
          >
            {primaryBtnLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
