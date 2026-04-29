import { lazy, Suspense, useEffect, useState } from 'react';
import { readSession, writeSession, removeSession } from './lib/storage.js';
import { supabase } from './lib/supabase.js';

import Landing from './components/Landing.jsx';
import Onboarding from './components/Onboarding.jsx';
import Auth from './components/Auth.jsx';

const Questionnaire    = lazy(() => import('./components/Questionnaire.jsx'));
const Loading          = lazy(() => import('./components/Loading.jsx'));
const Diagnosis        = lazy(() => import('./components/Diagnosis.jsx'));
const Chat             = lazy(() => import('./components/Chat.jsx'));
const MonthlyTracking  = lazy(() => import('./components/MonthlyTracking.jsx'));

const STEPS = {
  LANDING:       'landing',
  AUTH:          'auth',
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
      <div className="w-12 h-12 rounded-full border-4 border-ink-100 border-t-ink-800 animate-spin" />
    </div>
  );
}

const WIDTH_BY_STEP = {
  questionnaire: 'w-full max-w-5xl',
  diagnosis:     'w-full max-w-2xl',
  default:       'w-full max-w-lg',
};

export default function App() {
  const [authChecked, setAuthChecked] = useState(false);
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);

  const initial = loadSession();
  const [step, setStep]                 = useState(initial?.step || STEPS.LANDING);
  const [businessData, setBusinessData] = useState(initial?.businessData || { businessName: '', segment: '' });
  const [financialData, setFinancialData] = useState(initial?.financialData || INITIAL_FINANCIAL);
  const [diagnosis, setDiagnosis]       = useState(initial?.diagnosis || '');
  const [initialValues, setInitialValues] = useState(null);

  // Verifica sessão Supabase ao carregar
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setUser(data.session.user);
        setAccessToken(data.session.access_token);
        // Se estava em landing ou auth, pula pra onboarding
        if (step === STEPS.LANDING || step === STEPS.AUTH) {
          setStep(initial?.step && initial.step !== STEPS.LANDING && initial.step !== STEPS.AUTH
            ? initial.step
            : STEPS.ONBOARDING);
        }
      }
      setAuthChecked(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser(session.user);
        setAccessToken(session.access_token);
      } else {
        setUser(null);
        setAccessToken(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (step === STEPS.LANDING) {
      removeSession(SESSION_KEY);
      return;
    }
    saveSession({ step, businessData, financialData, diagnosis });
  }, [step, businessData, financialData, diagnosis]);

  function handleAuthComplete(session) {
    setUser(session.user);
    setAccessToken(session.access_token);
    setStep(STEPS.ONBOARDING);
  }

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

  async function handleLogout() {
    await supabase.auth.signOut();
    handleRestart();
  }

  if (!authChecked) return <FullScreenSpinner />;

  return (
    <div className={step === STEPS.LANDING ? '' : 'min-h-screen flex items-start sm:items-center justify-center p-4 py-8 bg-ink-50'}>
      {step === STEPS.LANDING && (
        <Landing onEnter={() => setStep(user ? STEPS.ONBOARDING : STEPS.AUTH)} />
      )}

      <div className={step === STEPS.LANDING ? 'hidden' : (WIDTH_BY_STEP[step] || WIDTH_BY_STEP.default)}>
        {/* Header com email + logout nos steps internos */}
        {user && step !== STEPS.AUTH && (
          <div className="flex items-center justify-between mb-4 text-xs text-ink-400">
            <span>{user.email}</span>
            <button onClick={handleLogout} className="hover:text-ink-600 transition-colors">
              Sair
            </button>
          </div>
        )}

        <Suspense fallback={<FullScreenSpinner />}>
          {step === STEPS.AUTH && (
            <Auth onComplete={handleAuthComplete} />
          )}

          {step === STEPS.ONBOARDING && (
            <Onboarding
              onComplete={handleOnboardingComplete}
              onBack={() => setStep(STEPS.LANDING)}
            />
          )}

          {step === STEPS.QUESTIONNAIRE && (
            <Questionnaire
              onComplete={handleQuestionnaireComplete}
              onBack={() => setStep(STEPS.ONBOARDING)}
              initialValues={initialValues}
              businessData={businessData}
            />
          )}

          {step === STEPS.LOADING && (
            <Loading
              businessData={businessData}
              financialData={financialData}
              accessToken={accessToken}
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
              accessToken={accessToken}
              onBack={() => setStep(STEPS.DIAGNOSIS)}
            />
          )}
        </Suspense>
      </div>
    </div>
  );
}
