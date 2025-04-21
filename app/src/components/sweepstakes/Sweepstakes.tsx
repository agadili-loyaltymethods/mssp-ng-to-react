```typescript
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Card, CardContent, Button } from '@mui/material';
import { useMemberService } from '../../hooks/useMemberService';
import { useAlertService } from '../../hooks/useAlertService';
import { CardMiniSkeleton } from '../skeletons/CardMiniSkeleton';
import { SweepstakeDialog } from '../dialogs/SweepstakeDialog';
import { NoData } from '../common/NoData';
import { SweepstakesConstant } from '../../constants/sweepstakes.constants';
import { formatExpiryDate } from '../../utils/dateUtils';

export const Sweepstakes: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [claimedTimes, setClaimedTimes] = useState(0);
  
  const memberPoints = useSelector((state: any) => 
    state.member.purses[0]?.availBalance || 0
  );
  const memberService = useMemberService();
  const alertService = useAlertService();

  const showSweepstake = (sweepstake: any) => {
    setTimeout(() => {
      setDialogOpen(true);
    }, 1);
  };

  const handleDialogClose = (result: boolean) => {
    setDialogOpen(false);
    if (result) {
      setClaimedTimes(prev => prev + 1);
      memberService.refreshMember();
    }
  };

  if (isLoading) {
    return <div className="mt-12"><CardMiniSkeleton /></div>;
  }

  if (!SweepstakesConstant) {
    return <NoData>No sweepstakes available.</NoData>;
  }

  return (
    <div className="flex flex-col mt-5">
      <h3 className="mt-0">Sweepstakes</h3>
      <div className="flex gap-5">
        <div className="m-0 flex flex-wrap gap-2.5 grid">
          <div className="flex-[0_0_25%]">
            <Card className="box-shadow-none border-gray bg-white">
              <CardContent className="flex flex-col">
                <div className="flex flex-col items-center gap-5">
                  <img className="w-full" src="assets/logo-login.svg" alt="Logo" />
                  <h3>{SweepstakesConstant.title}</h3>
                  <div className="text-gray-500">{SweepstakesConstant.desc}</div>
                  <small className="text-gray-500">
                    Expires {formatExpiryDate(SweepstakesConstant.expiresOn)}
                  </small>
                  <Button
                    variant="outlined"
                    color="primary"
                    className="w-full mt-5"
                    onClick={() => showSweepstake(SweepstakesConstant)}
                  >
                    Participate Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <SweepstakeDialog
        open={dialogOpen}
        data={SweepstakesConstant}
        onClose={handleDialogClose}
      />
    </div>
  );
};
```