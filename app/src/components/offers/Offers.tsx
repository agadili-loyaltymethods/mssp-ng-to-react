
import { useEffect, useState } from 'react';
import { useMemberService } from '@/hooks/useMemberService';
import { useToast } from '@/hooks/useToast';
import { useTokenDetailsHelper } from '@/hooks/useTokenDetailHelper';
import { checkExpiry } from '@/utils/formatters';
import { useAppSelector } from '@/hooks/useAuthService';
import { useActivityService } from '@/hooks/useActivityService';
import { Loader } from '@/components/loader/Loader';
import { NoData } from '../common/no-data/NoData';
import { CardMiniSkeleton } from '../skeletons/CardMiniSkeleton';

export function Offers() {
  const [offers, setOffers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const staticDate = new Date('10/11/2024');

  const memberInfo = useAppSelector(state => state.member);
  const location: any = useAppSelector(state => state.location.location);
  const { getOffers, getPromo } = useMemberService();
  const { showError } = useToast();
  const { openExternalLink } = useTokenDetailsHelper();

  useEffect(() => {
    if (memberInfo._id) {
      getOffersList();
    }
  }, [memberInfo, location]);

  const getOffersList = async () => {
    setIsLoading(true);
    try {
      const [promo, globalOffers]: any = await Promise.all([
        getPromo(memberInfo._id, location.number ?? location),
        getOffers(memberInfo._id, location.number ?? location)
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

  // if (!offers.length) {
  //   return <NoData>No Offers available.</NoData>;
  // }

  return (
    <>
      {isLoading && <Loader loaderType="skeltonCards"></Loader>}
      {!isLoading && <div className="flex flex-col gap-10 mt-5">
        <div className="min-h-screen p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-xl font-semibold text-gray-900">Available offers ({offers.length})</h1>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
              {offers.length > 0 ? (
                offers.map((offer, index) => (
                  <div key={index} className="bg-white rounded-md border border-solid border-[#dedede] p-6 flex items-center">
                    <img
                      src="/assets/bclc-logo.png"
                      alt="BCLC Logo"
                      className="w-16 h-16 object-contain"
                    />

                    <div className="border-l border-dashed border-[#6c757d] mx-4 h-12"></div>

                    <div className="flex flex-col">
                      <h3 className="font-bold text-gray-900 mb-3">{offer.name}</h3>
                      <span className="mb-3 text-md font-normal text-[14px] color-[#6c757d]">{offer.desc}</span>
                      {offer.expirationDate && (<span className="text-sm font-light text-[11px] color-[#6c757d]">Expires {checkExpiry(offer.expirationDate)}</span>)}
                    </div>


                    {offer.ext?.awardType?.toLowerCase() === 'booking offer' && (
                      <div className="flex flex-col flex-[20%] items-end">
                        <button
                          onClick={() => openExternalLink('hotel-booking', offer.name)}
                          className="mt-7.5 px-4 py-2 bg-[#ff8201] text-white rounded-full hover:bg-[#ff8201]"
                        >
                          Book Now
                        </button>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <NoData>No Offers available.</NoData>
              )}

            </div>
          </div>
        </div>
      </div>}
    </>
  );
}
