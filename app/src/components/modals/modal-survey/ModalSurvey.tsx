
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/lib/hooks/useAppSelector';
import { useActivityService } from '@/lib/hooks/useActivityService';
import { useToast } from '@/lib/hooks/useToast';
import { ExternalCoupons } from '@/enums/external-coupons';
import { Loader } from '@/components/loader';

interface ModalSurveyProps {
  data: {
    subTitle: string;
    title: string;
    desc: string;
  };
  onClose: (value: boolean) => void;
}

const radioOptions = ["Upto $2,500", "$2,501 to $5,000", "$5,001 to $10,000", "Above $10,000"];

export function ModalSurvey({ data, onClose }: ModalSurveyProps) {
  const navigate = useNavigate();
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState('');
  const [selectedChip, setSelectedChip] = useState('');
  const [earnedPoints, setEarnedPoints] = useState(0);

  const loyaltyId = useAppSelector(state => state.member.loyaltyId);
  const { getActivity } = useActivityService();
  const { showError } = useToast();

  const submit = async () => {
    setIsLoading(true);
    const payload = {
      type: "Survey",
      date: new Date().toISOString(),
      srcChannelType: "Web",
      loyaltyID: loyaltyId,
      couponCode: ExternalCoupons.SURVEY,
    };

    try {
      const response: any = await getActivity(payload, true);
      const pointsPurse = response.data.purses.find((purse: any) => purse.name === 'Anywhere Points');
      if (pointsPurse) {
        const points = pointsPurse.new - pointsPurse.prev;
        if (response.data?.streakBonus) {
          setEarnedPoints(points - response.data.streakBonus);
        } else {
          setEarnedPoints(points);
        }
        if (points) {
          setIsCompleted(true);
        } else {
          onClose(true);
        }
      } else {
        onClose(true);
      }
    } catch (error: any) {
      onClose(true);
      showError(error?.error?.error || error?.message);
    } finally {
      setIsLoading(false);
    }
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
        <strong>{data.subTitle}</strong>
        <button 
          onClick={() => onClose(isCompleted)}
          className="text-primary p-2 rounded-full hover:bg-gray-100"
        >
          &times;
        </button>
      </div>

      {!isCompleted ? (
        <>
          <div className="flex flex-col items-start gap-2.5">
            <ol className="list-decimal pl-5">
              <li className="mb-5">
                <h4 className="mb-2.5">Tell us what you like about BCLC</h4>
                <textarea 
                  rows={5} 
                  cols={50}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </li>

              <li className="mb-5">
                <h4 className="mb-2.5 leading-snug">
                  How satisfied are you with the facilities and services during your recent visit to a BCLC casino?
                </h4>
                <small className="text-gray-500 block mb-2">1= Very Dissatisfied, 5 = Very Satisfied</small>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      onClick={() => setSelectedChip(String(value))}
                      className={`
                        px-4 py-2 rounded-full border
                        ${selectedChip === String(value) 
                          ? 'bg-primary text-white border-primary' 
                          : 'border-gray-300 hover:bg-gray-100'
                        }
                      `}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </li>

              <li>
                <h4 className="mb-2.5">What is your estimated Spend for 2025?</h4>
                <small className="text-gray-500 block mb-2">Select one option</small>
                <div className="flex flex-col gap-2">
                  {radioOptions.map(option => (
                    <label key={option} className="flex items-center gap-2">
                      <input
                        type="radio"
                        value={option}
                        checked={selectedOption === option}
                        onChange={(e) => setSelectedOption(e.target.value)}
                        className="text-primary"
                      />
                      {option}
                    </label>
                  ))}
                </div>
              </li>
            </ol>
          </div>

          <div className="flex justify-end gap-5 mt-5 w-full">
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
      ) : (
        <>
          <div className="flex flex-col items-center gap-2.5">
            <small className="font-bold">Survey submitted successfully!</small>
            <h4 className="mb-0">
              You have received{' '}
              <span className="text-primary text-xl">
                {earnedPoints.toLocaleString()}
              </span>{' '}
              Points
            </h4>
          </div>
          <div className="flex justify-end gap-5">
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
              Cancel
            </button>
          </div>
        </>
      )}
    </div>
  );
}
