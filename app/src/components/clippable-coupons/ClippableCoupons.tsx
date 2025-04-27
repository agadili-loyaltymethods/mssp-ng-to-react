import React, { useEffect, useState } from 'react';
import { Card, CardContent, Button } from '@mui/material';
import { useSelector } from 'react-redux';
import { useSegmentService } from '../../hooks/useSegmentService';
import { CardMiniSkeleton } from '../skeletons/CardMiniSkeleton';
// import { NoData } from '../common/NoData';
import useAlertService from '@/hooks/useAlertService';
import { NoData } from '../common/no-data/NoData';
import { Loader } from '../loader/Loader';

export const ClippableCoupons: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [segments, setSegments] = useState<any[]>([]);
  const [memberSegments, setMemberSegments] = useState<any[]>([]);
  const memberInfo = useSelector((state: any) => state.member);
  const segmentService = useSegmentService();
  const alertService = useAlertService();

  useEffect(() => {
    if (memberInfo._id) {
      getSegments();
    }
  }, [memberInfo]);

  const getSegments = async () => {
    setIsLoading(true);
    try {
      const segmentsResponse = await segmentService.getAllSegments(
        JSON.stringify({ "ext.marketing": true })
      );
      setSegments(segmentsResponse);

      const memberSegmentsResponse: any = await segmentService.getMemberSegments(
        5,
        JSON.stringify({
          member: memberInfo._id,
          segment: { $in: segmentsResponse.map((segment: any) => segment._id) }
        })
      );
      setMemberSegments(memberSegmentsResponse);
    } catch (error: any) {
      alertService.errorAlert(error?.error?.error || error?.message);
    } finally {
      setIsLoading(false);
    }
  };

  const isClaimed = (segmentId: string) =>
    !!memberSegments.find(x => x.segment === segmentId);

  const updateSegment = async (segmentId: string) => {
    const existingSegment = memberSegments.findIndex(x => x.segment === segmentId);

    try {
      if (existingSegment > -1) {
        await segmentService.deleteMemberSegment(memberSegments[existingSegment]._id);
        setMemberSegments(prev => {
          const newSegments = [...prev];
          newSegments.splice(existingSegment, 1);
          return newSegments;
        });
        alertService.successAlert('Coupon has been successfully deactivated.');
      } else {
        const response = await segmentService.addMemberSegment(memberInfo._id, segmentId);
        setMemberSegments(prev => [...prev, response]);
        alertService.successAlert('Coupon has been successfully activated.');
      }
    } catch (error: any) {
      alertService.errorAlert(error?.error?.error || error?.message);
    }
  };

  return (
    <>
      {isLoading && <Loader loaderType="skeltonCards"></Loader>}
      {!isLoading && <div className="flex flex-col gap-10 mt-5">
        <div className="min-h-screen p-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {segments.length > 0 ? (segments.map((segment) => (
                <div className="bg-white rounded-lg shadow-md  py-8 px-4 flex flex-col items-center">
                  <img src="/assets/bclc-logo.png" alt="BCLC Logo" className="w-24 h-auto mb-12" />

                  <h2 className="text-2xl font-bold text-center mb-8">
                    {segment.name}
                  </h2>

                  <p className="text-gray-600 text-center text-sm font-light mb-8">
                    {segment.description}
                  </p>

                  <button
                    className={`w-full text-white font-normal text-sm py-2 px-6 rounded-md transition duration-200 ${isClaimed(segment._id) ? 'bg-[#000000] hover:bg-[#000000]' : 'bg-[#FF8201] hover:bg-[#FF8201]'}`}
                    onClick={() => updateSegment(segment._id)}
                  >
                    {isClaimed(segment._id) ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              ))) : (<NoData>No coupons available.</NoData>)}


            </div>
          </div>
        </div>
      </div>}
    </>
  );
};