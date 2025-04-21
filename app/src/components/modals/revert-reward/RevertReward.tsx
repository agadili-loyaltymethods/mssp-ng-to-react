
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/lib/hooks/useAppSelector';
import { useActivityService } from '@/lib/hooks/useActivityService';
import { useToast } from '@/lib/hooks/useToast';
import { Loader } from '@/components/loader';

interface RevertRewardProps {
  data: {
    name: string;
    desc: string;
    activity: string;
  };
  onClose: (value: boolean) => void;
}

export function RevertReward({ data, onClose }: RevertRewardProps) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const loyaltyId = useAppSelector(state => state.member.loyaltyId);
  const { getActivity } = useActivityService();
  const { showError } = useToast();

  const submit = async () => {
    setIsLoading(true);
    const payload = {
      type: "Cancellation",
      date: new Date().toISOString(),
      srcChannelType: "Web",
      srcChannelID: "Corporate",
      loyaltyID: loyaltyId,
      couponCode: data.activity,
    };

    try {
      await getActivity(payload, true);
      redirect();
    } catch (error: any) {
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
    <div className="flex flex-col items-center gap-2.5 w-[600px] min-h-[200px]">
      <div className="flex flex-col items-center gap-2.5 pb-5">
        <h4>Do you want to revert {data.name}?</h4>
        <span className="pt-4">{data.desc}</span>
      </div>
      <div className="flex justify-end gap-2.5">
        <button
          onClick={submit}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
        >
          Confirm
        </button>
        <button
          onClick={() => onClose(true)}
          className="px-4 py-2 text-accent hover:bg-gray-100 rounded"
        >
          Close
        </button>
      </div>
    </div>
  );
}
