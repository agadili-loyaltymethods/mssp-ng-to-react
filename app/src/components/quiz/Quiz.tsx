```typescript
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Card, CardContent, Button } from '@mui/material';
import { useMemberService } from '../../hooks/useMemberService';
import { useAlertService } from '../../hooks/useAlertService';
import { CardMiniSkeleton } from '../skeletons/CardMiniSkeleton';
import { NoData } from '../common/NoData';
import { SurveyDialog } from '../dialogs/SurveyDialog';
import { SurveyConstant } from '../../constants/survey.constants';
import { formatExpiryDate } from '../../utils/dateUtils';

export const Quiz: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [surveyClaimedTimes, setSurveyClaimedTimes] = useState(0);
  const surveys = [SurveyConstant];
  
  const memberService = useMemberService();
  const alertService = useAlertService();

  const handleDialogOpen = (item: any) => {
    alertService.closeAlert();
    setDialogOpen(true);
  };

  const handleDialogClose = (result: boolean) => {
    setDialogOpen(false);
    if (result) {
      setSurveyClaimedTimes(prev => prev + 1);
      memberService.refreshMember();
    }
  };

  if (isLoading) {
    return <div className="mt-12"><CardMiniSkeleton /></div>;
  }

  if (!surveys.length) {
    return <NoData>No quiz available.</NoData>;
  }

  return (
    <div className="flex flex-col mt-5">
      <h3 className="mt-0">Survey ({surveys.length})</h3>
      <div className="flex gap-5">
        <div className="m-0 flex flex-wrap gap-2.5 grid">
          {surveys.map((survey) => (
            <div key={survey.title} className="flex-[0_0_25%]">
              <Card className="box-shadow-none border-gray bg-white">
                <CardContent className="flex flex-col">
                  <div className="flex flex-col items-center gap-5">
                    <img className="w-full" src="assets/bclc-logo.png" alt="Logo" />
                    <h3>{survey.title}</h3>
                    <div className="text-gray-500">{survey.desc}</div>
                    <small className="text-gray-500">
                      Expires {formatExpiryDate(survey.expiresOn)}
                    </small>
                    <Button
                      variant="outlined"
                      color="primary"
                      className="w-full"
                      onClick={() => handleDialogOpen(survey)}
                    >
                      Participate Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>

      <SurveyDialog
        open={dialogOpen}
        data={SurveyConstant}
        onClose={handleDialogClose}
      />
    </div>
  );
};
```