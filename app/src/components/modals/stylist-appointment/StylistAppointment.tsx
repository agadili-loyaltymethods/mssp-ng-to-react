
import { useEffect, useState } from 'react';
import { formatters } from '@/lib/utils/formatters';
import { Loader } from '@/components/loader';

interface StylistAppointmentProps {
  data: {
    products: any[];
  };
  onClose: (value: boolean) => void;
}

export function StylistAppointment({ data, onClose }: StylistAppointmentProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    setProducts(data.products.filter(item => item.name === 'Stylist Appointment'));
    setIsLoading(false);
  }, [data.products]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-end justify-center gap-7.5 p-5 w-[600px] min-h-[200px]">
        <Loader />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2.5 p-5 w-[450px]">
      <div className="flex items-center justify-between w-full border-b pb-1.5">
        <strong>Book a Stylist Appointment</strong>
        <button 
          onClick={() => onClose(false)}
          className="text-primary p-2 rounded-full hover:bg-gray-100"
        >
          &times;
        </button>
      </div>
      
      <div className="flex flex-col items-center gap-2.5">
        <div className="flex-1 container flex flex-col items-center">
          <img 
            src={products[0]?.url} 
            alt={products[0]?.name} 
            className="w-full h-auto"
            loading="lazy"
          />
          <h4 className="mb-0 px-2.5 w-[90%]">{products[0]?.name}</h4>
          <p className="description mt-1.5 px-2.5 w-[90%]">{products[0]?.desc}</p>
          <strong className="text-lg px-2.5 w-[90%]">
            {formatters.formatCurrency(products[0]?.cost)}
          </strong>
        </div>
      </div>
      
      <div className="flex justify-end gap-5 pt-7.5 w-full">
        <button
          onClick={() => onClose(false)}
          className="px-4 py-2 text-accent hover:bg-gray-100 rounded"
        >
          Cancel
        </button>
        <button
          onClick={() => onClose(true)}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
        >
          Confirm Booking
        </button>
      </div>
    </div>
  );
}
