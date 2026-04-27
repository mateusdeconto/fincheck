import { lazy, Suspense, useEffect, useState } from 'react';
import { readSession, writeSession, removeSession } from './lib/storage.js';

// Landing fica no bundle inicial — é a primeira tela. O resto pode esperar.
import Landing from './components/Landing.jsx';
import Onboarding from './components/Onboarding.jsx';

const Questionnaire    = lazy(() => import('./components/Questionnaire.jsx'));
const Loading          = lazy(() => import('./components/Loading.jsx'));
const Diagnosis        = lazy(() => import('./components/Diagnosis.jsx'));
const Chat             = lazy(() => import('./components/Chat.jsx'));
const MonthlyTracking  = lazy(() => import('./components/MonthlyTracking.jsx'));

const STEPS = {
  LANDING:       'landing',
  ONBOARDING:    'onboarding',
  QUESTIONNAIRE: 'questionnaire',
  LOADING:       'loading',
  DIAGNOSIS:     'diagnosis',
  CHAT:          'chat',
  TRACKING:      'tracking',
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

const SESSION_KEY = 'fincheck_active_session';

function loadSession() {
  return readSession(SESSION_KEY, null);
}

function saveSession(state) {
  writeSession(SESSION_KEY, state);
}

function FullScreenSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 rounded-full border-4 border-ink-100 border-t-accent-500 animate-spin" />
    </div>
  );
}

export default function App() {
  // Restaura sessão (autosave) se houver
  const initial = loadSession();
  const [step, setStep]                 = useState(initial?.step || STEPS.LANDING);
  const [businessData, setBusinessData] = useState(initial?.businessData || { businessName: '', segment: '' });
  const [financialData, setFinancialData] = useState(initial?.financialData || INITIAL_FINANCIAL);
  const [diagnosis, setDiagnosis]       = useState(initial?.diagnosis || '');
  const [initialValues, setInitialValues] = useState(null);

  // Persiste sessão a cada mudança relevante
  useEffect(() => {
    if (step === STEPS.LANDING) {
      removeSession(SESSION_KEY);
      return;
    }
    saveSession({ step, businessData, financialData, diagnosis });
  }, [step, businessData, financialData, diagnosis]);

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
    removeSession(SESSION_KEY);
    setStep(STEPS.LANDING);
    setBusinessData({ businessName: '', segment: '' });
    setFinancialData(INITIAL_FINANCIAL);
    setDiagnosis('');
    setInitialValues(null);
  }

  function handleRefill(prevEntry) {
    setInitialValues(prevEntry || null);
    setDiagnosis('');
    setFinancialData(INITIAL_FINANCIAL);
    setStep(STEPS.QUESTIONNAIRE);
  }

  return (
    <div className={step === STEPS.LANDING ? '' : 'min-h-screen flex items-start sm:items-center justify-center p-4 py-8 bg-ink-50'}>
      {step === STEPS.LANDING && (
        <Landing onEnter={() => setStep(STEPS.ONBOARDING)} />
      )}

      <div className={step === STEPS.LANDING ? 'hidden' : 'w-full max-w-lg'}>
        <Suspense fallback={<FullScreenSpinner />}>
          {step === STEPS.ONBOARDING && (
            <Onboarding onComplete={handleOnboardingComplete} onBack={() => setStep(STEPS.LANDING)} />
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
        </Suspense>
      </div>
    </div>
  );
}
