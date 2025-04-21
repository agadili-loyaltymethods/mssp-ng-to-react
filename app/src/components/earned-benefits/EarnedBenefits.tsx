import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@mui/material';
import { useSelector } from 'react-redux';
import { useMemberService } from '../../hooks/useMemberService';
import { CardMiniSkeleton } from '../skeletons/CardMiniSkeleton';
import { formatExpiryDate } from '../../utils/formatters';
import useAlertService from '@/hooks/useAlertService';
import { NoData } from '../common/no-data/NoData';

export const EarnedBenefits: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [memberBenefits, setMemberBenefits] = useState([]);
  const memberInfo = useSelector((state: any) => state.member);
  const location = useSelector((state: any) => state.location.location);
  
  const memberService = useMemberService();
  const alertService = useAlertService();

  useEffect(() => {
    if (memberInfo?._id) {
      getMemberBenefits();
    }
  }, [memberInfo, location]);

  const getMemberBenefits = async () => {
    try {
      const offers: any = await memberService.getOffers(
        memberInfo._id, 
        location.number ?? location
      );
      setMemberBenefits(offers.filter((offer: any) => offer.ext?.isBenefit));
    } catch (error: any) {
      alertService.errorAlert(error?.error?.error || error?.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="mt-12"><CardMiniSkeleton /></div>;
  }

  if (!memberBenefits.length) {
    return <NoData>No Benefits available.</NoData>;
  }

  return (
    <div className="flex flex-col mt-5">
      <h3 className="mt-0">Available Member Benefits ({memberBenefits.length})</h3>
      <div className="flex gap-5">
        <div className="flex flex-wrap gap-2.5 grid">
          {memberBenefits.map((benefit: any) => (
            <div key={benefit.id} className="flex-[0_0_50%]">
              <Card className="box-shadow-none border-gray bg-white">
                <CardContent className="flex items-center gap-2.5 h-35">
                  <div className="w-50 img-sec">
                    <img src="assets/bclc-logo.png" alt="Logo" />
                  </div>
                  <div className="flex justify-between w-full">
                    <div className="flex flex-col gap-2.5 flex-[77%]">
                      <h3 className="mt-2.5 card-text-ellipsis">{benefit.name}</h3>
                      <p className="m-0 card-text-ellipsis">{benefit.desc}</p>
                      {benefit.expirationDate && (
                        <small className="text-gray-500 line-height-adjust card-text-ellipsis">
                          Expires {formatExpiryDate(benefit.expirationDate)}
                        </small>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};