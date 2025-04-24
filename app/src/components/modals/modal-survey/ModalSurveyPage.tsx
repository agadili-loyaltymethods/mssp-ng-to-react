import React, { useState } from 'react';
import CommonModalPopup from '../common-modal-popup/CommonModalPopup';

interface ModalSurveyProps {
  isOpen: boolean;
  onClose?: () => void;

  onSubmit?: () => void;
}

const ModalSurveyPopup: React.FC<ModalSurveyProps> = ({ isOpen, onClose, onSubmit }) => {
  const [feedback, setFeedback] = useState('');
  const [satisfaction, setSatisfaction] = useState<number | null>(null);
  const [estimatedSpend, setEstimatedSpend] = useState<string>('');

  const handleSubmit = () => {
    // Handle survey submission
    console.log({ feedback, satisfaction, estimatedSpend });
    if(onSubmit){
        onSubmit();
    }
    if(onClose){
        onClose();
    }
  };

  return (
    <CommonModalPopup
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={onSubmit}
      title="Survey"
      width="max-w-2xl"
    >
      <div className="space-y-6">
        <div>
          <label className="block mb-2 font-medium">
            1. Tell us what you like about BCLC
          </label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="w-full p-2 border rounded-md h-32 resize-none"
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">
            2. How satisfied are you with the facilities and services during your recent visit to a BCLC casino?
          </label>
          <div className="text-sm text-gray-500 mb-2">
            1= Very Dissatisfied, 5 = Very Satisfied
          </div>
          <div className="flex gap-3">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                onClick={() => setSatisfaction(value)}
                className={`w-8 h-8 rounded-full border ${
                  satisfaction === value
                    ? 'bg-orange-500 text-white border-orange-500'
                    : 'border-gray-300 hover:border-orange-500'
                }`}
              >
                {value}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block mb-2 font-medium">
            3. What is your estimated Spend for 2025?
          </label>
          <div className="space-y-2">
            {[
              'Upto $2,500',
              '$2,501 to $5,000',
              '$5,001 to $10,000',
              'Above $10,000'
            ].map((option) => (
              <div key={option} className="flex items-center">
                <input
                  type="radio"
                  id={option}
                  name="estimatedSpend"
                  value={option}
                  checked={estimatedSpend === option}
                  onChange={(e) => setEstimatedSpend(e.target.value)}
                  className="w-4 h-4 text-orange-500 border-gray-300 focus:ring-orange-500"
                />
                <label htmlFor={option} className="ml-2">
                  {option}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-white bg-orange-500 rounded-md hover:bg-orange-600"
          >
            Submit
          </button>
        </div>
      </div>
    </CommonModalPopup>
  );
};

export default ModalSurveyPopup;

export { ModalSurveyPopup }