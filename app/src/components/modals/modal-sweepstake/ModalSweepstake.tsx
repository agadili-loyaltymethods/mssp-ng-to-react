
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/lib/hooks/useAppSelector';
import { useActivityService } from '@/lib/hooks/useActivityService';
import { useToast } from '@/lib/hooks/useToast';
import { ExternalCoupons } from '@/enums/external-coupons';
import { Loader } from '@/components/loader';

interface ModalSweepstakeProps {
  data: {
    title: string;
    summary?: string;
    desc: string;
  };
  onClose: (value: boolean) => void;
}

export function ModalSweepstake({ data, onClose }: ModalSweepstakeProps) {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'won' | 'lost' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);

  const loyaltyId = useAppSelector(state => state.member.loyaltyId);
  const { getActivity } = useActivityService();
  const { showError } = useToast();

  const submit = async () => {
    setIsLoading(true);
    const payload = {
      type: "Sweepstakes",
      date: new Date().toISOString(),
      srcChannelType: "Web",
      loyaltyID: loyaltyId,
      couponCode: ExternalCoupons.SWEEPSTAKES,
    };

    try {
      const result: any = await getActivity(payload, true);
      if (result.data.sweepStakesPoints > 0) {
        const pointsPurse = result.data.purses.find((purse: any) => purse.name === 'Points');
        const points = pointsPurse.new - pointsPurse.prev;
        setEarnedPoints(points);
        if (points) {
          setStatus('won');
        } else {
          onClose(true);
        }
      } else {
        setStatus('lost');
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
    <div className="flex flex-col items-center gap-7.5 p-5 w-[600px] min-h-[200px]">
      <div className="flex items-center justify-between w-full">
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
            <img src="/assets/sweepstake.png" alt="Sweepstake" />
            <small className="font-bold">{data.summary ?? data.desc}</small>
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
      ) : status === 'lost' ? (
        <>
          <div className="flex flex-col items-center gap-2.5 w-3/5">
            <span className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center outline outline-4 outline-red-100">
              ×
            </span>
            <small className="text-center">
              We appreciate your entry, we regret to inform you that you were not selected as one
              of the winners this time.
            </small>
          </div>
          <div className="flex justify-end gap-2.5">
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
          <div className="flex flex-col items-center gap-2.5">
            <img src="/assets/sweepstake.png" alt="Sweepstake" />
            <small className="font-bold">Congratulations!</small>
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
              Cancel
            </button>
          </div>
        </>
      )}
    </div>
  );
}
