import React from 'react';

interface CommonModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onSubmit?: () => void;
  title: string;
  width?: string;
  height?: string;
  children?: React.ReactNode;
}

const CommonModalPopup: React.FC<CommonModalProps> = ({
  isOpen,
  onClose,
  title,
  width = 'max-w-2xl',
  height = 'min-h-[200px]',
  children
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className={`bg-white rounded-lg shadow-xl ${width} ${height} w-full mx-4`}>
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <span className="text-2xl">×</span>
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default CommonModalPopup;