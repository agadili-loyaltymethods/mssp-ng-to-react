
import { useEffect, useState } from 'react';
import { useAppSelector } from '@/lib/hooks/useAppSelector';
import { useMemberService } from '@/lib/hooks/useMemberService';
import { useToast } from '@/lib/hooks/useToast';
import { useTokenDetails } from '@/lib/hooks/useTokenDetails';
import { formatters } from '@/lib/utils/formatters';
import { CardMiniSkeleton } from '../card-mini-skeleton';
import { NoData } from '../common/no-data';

export function Offers() {
  const [offers, setOffers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const staticDate = new Date('10/11/2024');

  const memberInfo = useAppSelector(state => state.member);
  const location: any = useAppSelector(state => state.location.location);
  const { getMemberOffers } = useMemberService();
  const { showError } = useToast();
  const { openExternalLink } = useTokenDetails();

  useEffect(() => {
    if (memberInfo._id) {
      getOffers();
    }
  }, [memberInfo, location]);

  const getOffers = async () => {
    try {
      const [promo, globalOffers]: any = await Promise.all([
        getMemberOffers(memberInfo._id, location.number ?? location),
        getMemberOffers(memberInfo._id, location.number ?? location)
      ]);

      setOffers([
        ...promo, 
        ...globalOffers.filter((offer: any) => !offer.ext?.isPerk && !offer.ext?.isBenefit)
      ]);
    } catch (error: any) {
      showError(error?.error?.error || error?.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mt-12.5">
        <CardMiniSkeleton />
      </div>
    );
  }

  if (!offers.length) {
    return <NoData>No Offers available.</NoData>;
  }

  return (
    <div className="flex flex-col mt-5">
      <h3 className="mt-0">Available offers ({offers.length})</h3>
      <div className="flex gap-5">
        <div className="m-0 flex-1 flex flex-wrap gap-2.5">
          {offers.map((offer, index) => (
            <div key={index} className="flex-[0_0_50%]">
              <div className="border border-gray-200 rounded bg-white">
                <div className="flex items-center gap-2.5 p-5 h-[140px]">
                  <div className="w-[100px] border-r border-dashed border-gray-300 pr-5">
                    <img src="/assets/bclc-logo.png" alt="BCLC Logo" />
                  </div>
                  <div className="flex justify-between items-start flex-1 w-[500px]">
                    <div className="flex flex-col gap-2.5 flex-[85%]">
                      <h3 className="mt-2.5 line-clamp-2">{offer.name}</h3>
                      <p className="m-0 line-clamp-2">{offer.desc}</p>
                      {offer.expirationDate && (
                        <small className="text-gray-500 leading-snug line-clamp-2">
                          Expires {formatters.checkExpiry(offer.expirationDate)}
                        </small>
                      )}
                    </div>
                    {offer.ext?.awardType?.toLowerCase() === 'booking offer' && (
                      <div className="flex flex-col flex-[20%] items-end">
                        <button
                          onClick={() => openExternalLink('hotel-booking', offer.name)}
                          className="mt-7.5 px-4 py-2 bg-primary text-white rounded-full hover:bg-primary-dark"
                        >
                          Book Now
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
