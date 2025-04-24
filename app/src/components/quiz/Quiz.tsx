
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Card, CardContent, Button } from '@mui/material';
import { useMemberService } from '../../hooks/useMemberService';
import { CardMiniSkeleton } from '../skeletons/CardMiniSkeleton';
import { SurveyConstant } from '../../constants/survey.constants';
import { formatExpiryDate } from '@/utils/formatters';
import useAlertService from '@/hooks/useAlertService';
import { NoData } from '../common/no-data/NoData';
import { ModalSurvey } from '../modals/modal-survey/ModalSurvey';
import { checkExpiry } from '@/utils/formatters';
import './quiz.css';
import ModalSurveyPopup from '../modals/modal-survey/ModalSurveyPage';

export const QuizPage: React.FC = () => {
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

    <div className="flex flex-col gap-10 mt-5">
      <div className="min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Survey ({surveys.length})</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

            {surveys.map((survey) => (
              <div className="bg-white rounded-lg shadow-md  py-8 px-4 flex flex-col items-center">
                <img src="/assets/bclc-logo.png" alt="BCLC Logo" className="w-24 h-auto mb-8" />

                <h2 className="text-lg font-bold text-center mb-6">
                  {survey.title}
                </h2>

                <p className="text-gray-600 text-center text-sm font-light mb-6">
                  {survey.desc}
                </p>

                <small className="text-gray-600 text-center text-sm font-light mb-8">
                  Expires {checkExpiry(survey.expiresOn)}
                </small>
                <button onClick={() => handleDialogOpen(survey)} className="border-gray w-full px-4 py-2 bg-[white] hover:bg-[white] text-[#FF8201]" >  Participate Now </button>
              </div>
            ))}

          </div>
        </div>
      </div>
      <ModalSurveyPopup isOpen={dialogOpen} onClose={() => handleDialogClose(false)} />
    </div>
  );
};
