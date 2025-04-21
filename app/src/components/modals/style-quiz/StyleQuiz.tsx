
import { useState } from 'react';
import { Loader } from '@/components/loader';

interface StyleQuizProps {
  data: any;
  onClose: (value: boolean) => void;
}

const qtn1Options = [
  'Classic & Timeless: Structured blazers, tailored trousers, and neutral tones.',
  'Casual & Laid-Back: Comfy jeans, cozy sweaters, and sneakers.',
  'Trendy & Bold: Statement pieces, bright colors, and the latest fashion trends.',
  'Minimalist & Clean: Simple silhouettes, neutral colors, and versatile basics.'
];

const qtn2Options = [
  'A chic blazer with skinny jeans: Effortlessly polished yet casual.',
  'A comfy sweater with leggings: Relaxed and cozy.',
  'A floral sundress with sandals: Playful and feminine.',
  'An edgy leather jacket with boots: Cool and confident.'
];

export function StyleQuiz({ onClose }: StyleQuizProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedQtn1Option, setSelectedQtn1Option] = useState('');
  const [selectedQtn2Option, setSelectedQtn2Option] = useState('');

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-7.5 p-5 w-[600px] min-h-[200px]">
        <Loader />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2.5 p-5 w-[700px] min-h-[200px]">
      <div className="flex items-center justify-between w-full border-b pb-1.5">
        <strong>Style Quiz</strong>
        <button 
          onClick={() => onClose(false)}
          className="text-primary p-2 rounded-full hover:bg-gray-100"
        >
          &times;
        </button>
      </div>

      <div className="flex flex-col items-start gap-2.5">
        <div className="flex flex-col items-start">
          <h4 className="mb-0">How would you describe your everyday style?</h4>
          <small className="text-gray-500 mt-1.5">Select any 1 option</small>
          <div className="flex flex-col gap-2 mt-2">
            {qtn1Options.map(option => (
              <label key={option} className="flex items-center gap-2">
                <input
                  type="radio"
                  value={option}
                  checked={selectedQtn1Option === option}
                  onChange={(e) => setSelectedQtn1Option(e.target.value)}
                  className="text-primary"
                />
                {option}
              </label>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-start mt-5">
          <h4 className="mb-0">Which outfit would you choose for a weekend brunch with friends?</h4>
          <small className="text-gray-500 mt-1.5">Select any 1 option</small>
          <div className="flex flex-col gap-2 mt-2">
            {qtn2Options.map(option => (
              <label key={option} className="flex items-center gap-2">
                <input
                  type="radio"
                  value={option}
                  checked={selectedQtn2Option === option}
                  onChange={(e) => setSelectedQtn2Option(e.target.value)}
                  className="text-primary"
                />
                {option}
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-5 mt-5 w-full">
        <button
          onClick={() => onClose(false)}
          className="px-4 py-2 text-accent hover:bg-gray-100 rounded"
        >
          Cancel
        </button>
        <button
          onClick={() => onClose(true)}
          disabled={!selectedQtn1Option || !selectedQtn2Option}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark disabled:opacity-50"
        >
          Submit
        </button>
      </div>
    </div>
  );
}
