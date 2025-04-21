
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/lib/hooks/useAppSelector';
import { useActivityService } from '@/lib/hooks/useActivityService';
import { useToast } from '@/lib/hooks/useToast';
import { Loader } from '@/components/loader';
import { ExternalCoupons } from '@/enums/external-coupons';

interface ModalQuizProps {
  data: {
    title: string;
    desc: string;
  };
  onClose: (value: boolean) => void;
}

const radioOptions = ["Monte Carlo", "Las Vegas", "Macau", "Atlantic City"];

export function ModalQuiz({ data, onClose }: ModalQuizProps) {
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState('');
  const [status, setStatus] = useState<'won' | 'lost' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);

  const loyaltyId = useAppSelector(state => state.member.loyaltyId);
  const { getActivity } = useActivityService();
  const { showError } = useToast();

  const submit = async () => {
    setIsLoading(true);
    const payload = {
      type: "Quiz",
      date: new Date().toISOString(),
      srcChannelType: "Web",
      loyaltyID: loyaltyId,
      couponCode: ExternalCoupons.QUIZ_WON,
    };

    const valid = selectedOption === 'Las Vegas';
    
    if (valid) {
      try {
        const response: any = await getActivity({ ...payload, couponCode: ExternalCoupons.QUIZ_WON }, true);
        setStatus('won');
        const pointsPurse = response.data.purses.find((purse: any) => purse.name === 'Points');
        const points = pointsPurse.new - pointsPurse.prev;
        setEarnedPoints(points);
        if (!points) {
          onClose(true);
        }
      } catch (error: any) {
        onClose(true);
        showError(error?.error?.error || error?.message);
      }
    } else {
      setStatus('lost');
    }
    setIsLoading(false);
  };

  const redirect = () => {
    onClose(true);
    navigate('/rewards', { state: { fragment: 'Vouchers' } });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-7.5 p-5 w-[600px] min-h-[200px]">
        <Loader />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2.5 p-5 w-[600px] min-h-[200px]">
      <div className="flex items-center justify-between w-full border-b pb-1.5">
        <strong>{data.title}</strong>
        <button 
          onClick={() => onClose(status !== null)}
          className="text-primary p-2 rounded-full hover:bg-gray-100"
        >
          &times;
        </button>
      </div>

      {!status ? (
        <>
          <div className="flex flex-col items-center gap-2.5">
            <h3 className="font-bold">{data.title} and {data.desc}</h3>
            <div className="flex flex-col items-start">
              <h4 className="mb-0">
                Which city is famously known as "The Entertainment Capital of the World" due to its abundance of casinos and luxury resorts?
              </h4>
              <small className="text-gray-500">Select 1 option</small>
              <div className="flex flex-col gap-2 mt-2">
                {radioOptions.map(option => (
                  <label key={option} className="flex items-center gap-2">
                    <input
                      type="radio"
                      value={option}
                      checked={selectedOption === option}
                      onChange={(e) => setSelectedOption(e.target.value)}
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2.5">
            <button
              onClick={() => onClose(false)}
              className="px-4 py-2 text-accent hover:bg-gray-100 rounded"
            >
              Cancel
            </button>
            <button
              onClick={submit}
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
            >
              Submit
            </button>
          </div>
        </>
      ) : status === 'won' ? (
        <>
          <div className="flex flex-col items-center gap-2.5">
            <small className="font-bold">Your answer is correct!</small>
            <h4>
              You have received{' '}
              <span className="text-primary text-xl">
                {earnedPoints.toLocaleString()}
              </span>{' '}
              Points
            </h4>
          </div>
          <div className="flex justify-end gap-2.5">
            <button
              onClick={redirect}
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
            >
              Check Available Rewards
            </button>
            <button
              onClick={() => onClose(true)}
              className="px-4 py-2 text-accent hover:bg-gray-100 rounded"
            >
              Close
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-col items-center gap-2.5 w-3/5">
            <span className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center outline outline-4 outline-red-100">
              ×
            </span>
            <small className="text-center">Your answer is incorrect!</small>
          </div>
          <div className="flex justify-end gap-2.5">
            <button
              onClick={() => onClose(false)}
              className="px-4 py-2 text-accent hover:bg-gray-100 rounded"
            >
              Close
            </button>
          </div>
        </>
      )}
    </div>
  );
}
