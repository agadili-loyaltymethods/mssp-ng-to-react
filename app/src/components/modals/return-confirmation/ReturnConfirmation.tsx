
interface ReturnConfirmationProps {
  onClose: (confirmed: boolean) => void;
}

export function ReturnConfirmation({ onClose }: ReturnConfirmationProps) {
  return (
    <div className="flex flex-col items-center gap-7.5 p-5 w-[600px] min-h-[200px]">
      <div className="flex items-center justify-between w-full border-b pb-1.5">
        <strong>Return Item(s)</strong>
        <button 
          onClick={() => onClose(false)}
          className="text-primary p-2 rounded-full hover:bg-gray-100"
        >
          &times;
        </button>
      </div>
      
      <div className="text-center">
        <p>Are you sure you want to return the item(s)?</p>
      </div>
      
      <div className="flex justify-center gap-2.5">
        <button
          onClick={() => onClose(false)}
          className="px-4 py-2 bg-accent text-white rounded hover:bg-accent-dark"
        >
          Cancel
        </button>
        <button
          onClick={() => onClose(true)}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
        >
          Proceed
        </button>
      </div>
    </div>
  );
}
