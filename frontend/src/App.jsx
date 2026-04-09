import { useState } from 'react';
import Landing from './components/Landing.jsx';
import Onboarding from './components/Onboarding.jsx';
import Questionnaire from './components/Questionnaire.jsx';
import Loading from './components/Loading.jsx';
import Diagnosis from './components/Diagnosis.jsx';
import Chat from './components/Chat.jsx';
import MonthlyTracking from './components/MonthlyTracking.jsx';

const STEPS = {
  LANDING:      'landing',
  ONBOARDING:   'onboarding',
  QUESTIONNAIRE: 'questionnaire',
  LOADING:      'loading',
  DIAGNOSIS:    'diagnosis',
  CHAT:         'chat',
  TRACKING:     'tracking',
};

const INITIAL_FINANCIAL = {
  revenue: 0,
  cogs: 0,
  fixedExpenses: 0,
  fixedExpensesItems: [],
  cashBalance: 0,
  debtPayment: 0,
  debtPaymentItems: [],
  accountsReceivable: 0,
  mixedAccounts: false,
  investments: 0,
};

export default function App() {
  const [step, setStep]                 = useState(STEPS.LANDING);
  const [businessData, setBusinessData] = useState({ businessName: '', segment: '' });
  const [financialData, setFinancialData] = useState(INITIAL_FINANCIAL);
  const [diagnosis, setDiagnosis]       = useState('');
  const [initialValues, setInitialValues] = useState(null); // pre-fill for questionnaire

  function handleOnboardingComplete(data) {
    setBusinessData(data);
    setStep(STEPS.QUESTIONNAIRE);
  }

  function handleQuestionnaireComplete(data) {
    setFinancialData(data);
    setStep(STEPS.LOADING);
  }

  function handleDiagnosisComplete(text) {
    setDiagnosis(text);
    setStep(STEPS.DIAGNOSIS);
  }

  function handleRestart() {
    setStep(STEPS.LANDING);
    setBusinessData({ businessName: '', segment: '' });
    setFinancialData(INITIAL_FINANCIAL);
    setDiagnosis('');
    setInitialValues(null);
  }

  // "Refazer diagnóstico do mês" — pré-preenche questionário com mês anterior
  function handleRefill(prevEntry) {
    setInitialValues(prevEntry || null);
    setDiagnosis('');
    setFinancialData(INITIAL_FINANCIAL);
    setStep(STEPS.QUESTIONNAIRE);
  }

  return (
    <div className={step === STEPS.LANDING ? '' : 'min-h-screen flex items-center justify-center p-4'}>
      {step === STEPS.LANDING && (
        <Landing onEnter={() => setStep(STEPS.ONBOARDING)} />
      )}

      <div className={step === STEPS.LANDING ? 'hidden' : 'w-full max-w-lg'}>
        {step === STEPS.ONBOARDING && (
          <Onboarding onComplete={handleOnboardingComplete} />
        )}

        {step === STEPS.QUESTIONNAIRE && (
          <Questionnaire
            onComplete={handleQuestionnaireComplete}
            onBack={() => setStep(STEPS.ONBOARDING)}
            initialValues={initialValues}
          />
        )}

        {step === STEPS.LOADING && (
          <Loading
            businessData={businessData}
            financialData={financialData}
            onComplete={handleDiagnosisComplete}
            onError={() => setStep(STEPS.QUESTIONNAIRE)}
          />
        )}

        {step === STEPS.DIAGNOSIS && (
          <Diagnosis
            businessData={businessData}
            financialData={financialData}
            diagnosis={diagnosis}
            onOpenChat={() => setStep(STEPS.CHAT)}
            onOpenTracking={() => setStep(STEPS.TRACKING)}
            onRestart={handleRestart}
          />
        )}

        {step === STEPS.TRACKING && (
          <MonthlyTracking
            businessData={businessData}
            financialData={financialData}
            onBack={() => setStep(STEPS.DIAGNOSIS)}
            onRefill={handleRefill}
          />
        )}

        {step === STEPS.CHAT && (
          <Chat
            businessData={businessData}
            financialData={financialData}
            diagnosis={diagnosis}
            onBack={() => setStep(STEPS.DIAGNOSIS)}
          />
        )}
      </div>
    </div>
  );
}

