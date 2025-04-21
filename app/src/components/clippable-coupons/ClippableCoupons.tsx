import React, { useEffect, useState } from 'react';
import { Card, CardContent, Button } from '@mui/material';
import { useSelector } from 'react-redux';
import { useSegmentService } from '../../hooks/useSegmentService';
import { CardMiniSkeleton } from '../skeletons/CardMiniSkeleton';
// import { NoData } from '../common/NoData';
import useAlertService from '@/hooks/useAlertService';
import { NoData } from '../common/no-data/NoData';

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

  if (isLoading) {
    return <div className="mt-12"><CardMiniSkeleton /></div>;
  }

  if (!segments.length) {
    return <NoData>No coupons available.</NoData>;
  }

  return (
    <div className="flex flex-col mt-5">
      <div className="flex flex-row gap-5">
        <div className="m-0 flex flex-row flex-wrap gap-2.5 grid">
          {segments.map((segment) => (
            <div key={segment._id} className="flex-[0_0_25%]">
              <Card className="box-shadow-none border-gray bg-white h-75">
                <CardContent className="h-full">
                  <div className="flex flex-col justify-between items-center gap-2.5 h-full">
                    <img src="assets/bclc-logo.png" alt="Logo" />
                    <h2 className="m-0 text-accent text-center">{segment.name}</h2>
                    <p className="text-gray-500 mt-2.5">{segment.description}</p>
                    <Button
                      variant="contained"
                      className="w-full"
                      color={isClaimed(segment._id) ? 'secondary' : 'primary'}
                      onClick={() => updateSegment(segment._id)}
                    >
                      {isClaimed(segment._id) ? 'Deactivate' : 'Activate'}
                    </Button>
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