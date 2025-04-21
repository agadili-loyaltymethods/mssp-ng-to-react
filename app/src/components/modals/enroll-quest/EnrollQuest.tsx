
import { useEffect, useState } from 'react';
import { Dialog } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { Loader } from '@/components/loader';

interface EnrollQuestProps {
  data: {
    products: any[];
  };
  onClose: (value: boolean) => void;
}

interface FormValues {
  brand: string[];
  size: string;
}

const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export function EnrollQuest({ data, onClose }: EnrollQuestProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [brands, setBrands] = useState<string[]>([]);

  const { control, handleSubmit, formState: { isValid } } = useForm<FormValues>({
    defaultValues: {
      brand: [],
      size: ''
    }
  });

  useEffect(() => {
    const uniqueBrands = Array.from(new Set(
      data.products
        .map(product => product.style)
        .filter(Boolean)
    ));
    setBrands(uniqueBrands);
    setIsLoading(false);
  }, [data.products]);

  const onSubmit = () => {
    onClose(true);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-7.5 p-5 w-[600px] min-h-[200px]">
        <Loader />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 w-[600px] min-h-[200px] p-5">
      <div className="flex items-center justify-between text-center pb-5 border-b">
        <h3 className="m-0">Enroll Quest</h3>
        <button 
          onClick={() => onClose(false)}
          className="text-primary p-2 rounded-full hover:bg-gray-100"
        >
          &times;
        </button>
      </div>

      <div className="flex items-center justify-center gap-2.5 pb-5">
        <form 
          onSubmit={handleSubmit(onSubmit)} 
          className="flex flex-col items-center justify-center gap-5 w-full"
        >
          <Controller
            name="brand"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <select
                {...field}
                multiple
                className="w-4/5 p-2.5 border border-gray-300 rounded"
                // placeholder="Please select your favorite brands"
              >
                {brands.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            )}
          />

          <Controller
            name="size"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <select
                {...field}
                className="w-4/5 p-2.5 border border-gray-300 rounded"
                // placeholder="Please select a T-shirt Size"
              >
                <option value="">Select T-shirt Size</option>
                {sizes.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            )}
          />
        </form>
      </div>

      <div className="flex justify-end items-center gap-5 mt-5">
        <button
          onClick={() => onClose(false)}
          className="px-4 py-2 rounded hover:bg-gray-100"
        >
          Close
        </button>
        <button
          onClick={handleSubmit(onSubmit)}
          disabled={!isValid}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark disabled:opacity-50"
        >
          Confirm
        </button>
      </div>
    </div>
  );
}
