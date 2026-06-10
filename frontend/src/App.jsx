import * as Sentry from '@sentry/react';
import { lazy, Suspense, useEffect, useState } from 'react';
import { readSession, writeSession, removeSession, removeKey } from './lib/storage.js';
import { supabase } from './lib/supabase.js';
import { saveDiagnosis, loadAllDiagnoses } from './lib/diagnoses.js';
import { loadUserPlan, getPlanLimits } from './lib/plans.js';
import {
  loadSavedCompanies,
  mergeCompanies,
  recordsForCompany,
  saveCompanyProfile,
  syncLegacyCompaniesToSupabase,
} from './lib/companies.js';
import { syncDocumentFromMetadata } from './lib/documents.js';
import {
  loadAllActiveWeeklyPlans,
  companyPlanKey,
  countWeeklyPlansThisMonth,
} from './lib/weeklyPlans.js';
import { loadLastDecision } from './lib/canOrNot.js';
import { setAnalyticsUser, trackEvent } from './lib/analytics.js';

const Landing = lazy(() => import('./components/Landing.jsx'));
import Onboarding from './components/Onboarding.jsx';
import Auth from './components/Auth.jsx';
import CompanySelector from './components/CompanySelector.jsx';
import History from './components/History.jsx';
import Comparison from './components/Comparison.jsx';
import UpgradeModal from './components/UpgradeModal.jsx';

const Questionnaire = lazy(() => import('./components/Questionnaire.jsx'));
const Loading = lazy(() => import('./components/Loading.jsx'));
const Diagnosis = lazy(() => import('./components/Diagnosis.jsx'));
const Chat = lazy(() => import('./components/Chat.jsx'));
const MonthlyTracking = lazy(() => import('./components/MonthlyTracking.jsx'));
const WeeklyPlan = lazy(() => import('./components/WeeklyPlan.jsx'));
const CanOrNot = lazy(() => import('./components/CanOrNot.jsx'));

const STEPS = {
  LANDING: 'landing',
  AUTH: 'auth',
  PREVIOUS: 'previous',
  ONBOARDING: 'onboarding',
  QUESTIONNAIRE: 'questionnaire',
  LOADING: 'loading',
  DIAGNOSIS: 'diagnosis',
  HISTORY: 'history',
  COMPARISON: 'comparison',
  CHAT: 'chat',
  TRACKING: 'tracking',
  WEEKLY_PLAN: 'weekly_plan',
  CAN_OR_NOT: 'can_or_not',
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

const SESSION_KEY = 'folego_capital_active_session';

function loadSession() { return readSession(SESSION_KEY, null); }
function saveSession(state) { writeSession(SESSION_KEY, state); }

function FullScreenSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 rounded-full border-4 border-ink-100 border-t-ink-800 animate-spin" />
    </div>
  );
}

const WIDTH_BY_STEP = {
  questionnaire: 'w-full max-w-5xl',
  diagnosis: 'w-full max-w-2xl',
  history: 'w-full max-w-2xl',
  previous: 'w-full max-w-2xl',
  comparison: 'w-full max-w-2xl',
  weekly_plan: 'w-full max-w-lg',
  can_or_not: 'w-full max-w-lg',
  default: 'w-full max-w-lg',
};

function toBusinessDataFromRecord(record) {
  return {
    businessName: record.business_name,
    segment: record.segment,
    customSegment: record.financial_data?._customSegment || null,
  };
}

export default function App() {
  const initial = loadSession();

  const [authChecked, setAuthChecked] = useState(false);
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [step, setStep] = useState(initial?.step || STEPS.LANDING);
  const [businessData, setBusinessData] = useState(initial?.businessData || { businessName: '', segment: '' });
  const [financialData, setFinancialData] = useState(initial?.financialData || INITIAL_FINANCIAL);
  const [diagnosis, setDiagnosis] = useState('');
  const [initialValues, setInitialValues] = useState(null);
  const [allDiagnoses, setAllDiagnoses] = useState([]);
  const [savedCompanies, setSavedCompanies] = useState([]);
  const [activeCompany, setActiveCompany] = useState(initial?.businessData?.businessName ? initial.businessData : null);
  const [onboardingPrefill, setOnboardingPrefill] = useState(initial?.businessData?.businessName ? initial.businessData : null);
  const [comparisonPair, setComparisonPair] = useState(null);
  const [chatOrigin, setChatOrigin] = useState(STEPS.DIAGNOSIS);
  const [chatContext, setChatContext] = useState(null);
  const [trackingOrigin, setTrackingOrigin] = useState(STEPS.DIAGNOSIS);
  const [weeklyPlanOrigin, setWeeklyPlanOrigin] = useState(STEPS.DIAGNOSIS);
  const [plan, setPlan] = useState('free');
  const [macroData, setMacroData] = useState(null);
  const [diagnosisResult, setDiagnosisResult] = useState(null); // JSON estruturado do backend
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [weeklyPlansByCompany, setWeeklyPlansByCompany] = useState({});
  const [canOrNotOrigin, setCanOrNotOrigin] = useState(STEPS.PREVIOUS);

  const companyDiagnoses = recordsForCompany(allDiagnoses, activeCompany);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      try {
        if (data.session) {
          setUser(data.session.user);
          setAccessToken(data.session.access_token);
          await handleUserLoggedIn(data.session.user, initial?.step);
        }
      } catch (err) {
        console.error('[auth] session restore failed:', err);
      } finally {
        setAuthChecked(true);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (_event === 'PASSWORD_RECOVERY') {
        setRecoveryMode(true);
        setUser(session?.user || null);
        setAccessToken(session?.access_token || null);
        setStep(STEPS.AUTH);
        return;
      }
      if (session) {
        setUser(session.user);
        setAccessToken(session.access_token);
        setRecoveryMode(false);
      } else {
        setUser(null);
        setAccessToken(null);
        setRecoveryMode(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  function indexWeeklyPlans(plans) {
    const byCompany = {};
    for (const plan of plans) {
      const key = `${plan.business_name}__${plan.segment}__${plan.custom_segment || ''}`;
      byCompany[key] = plan;
    }
    setWeeklyPlansByCompany(byCompany);
  }

  async function handleUserLoggedIn(loggedUser, currentStep) {
    setAnalyticsUser(loggedUser.id);
    loadUserPlan(loggedUser.id).then(setPlan).catch(err => {
      console.error('[user] loadUserPlan failed:', err);
      Sentry.captureException(err, { tags: { fn: 'loadUserPlan' } });
    });
    syncDocumentFromMetadata(loggedUser).catch(err => {
      console.error('[user] syncDocumentFromMetadata failed:', err);
      Sentry.captureException(err, { tags: { fn: 'syncDocumentFromMetadata' } });
    });
    loadAllActiveWeeklyPlans(loggedUser.id).then(indexWeeklyPlans).catch(err => {
      console.error('[user] loadAllActiveWeeklyPlans failed:', err);
      Sentry.captureException(err, { tags: { fn: 'loadAllActiveWeeklyPlans' } });
    });

    const records = await loadAllDiagnoses(loggedUser.id);
    const syncedCompanies = await syncLegacyCompaniesToSupabase(loggedUser.id);
    const mergedCompanies = mergeCompanies(syncedCompanies, records);

    setAllDiagnoses(records);
    setSavedCompanies(mergedCompanies);

    const inProgress = currentStep && ![STEPS.LANDING, STEPS.AUTH, STEPS.PREVIOUS].includes(currentStep);
    if (inProgress) {
      if (initial?.businessData?.businessName) {
        setActiveCompany(initial.businessData);
        setOnboardingPrefill(initial.businessData);
      }
      return;
    }

    if (mergedCompanies.length > 0) {
      setActiveCompany(mergedCompanies[0]);
      setOnboardingPrefill(mergedCompanies[0]);
      setStep(STEPS.PREVIOUS);
      return;
    }

    setActiveCompany(null);
    setOnboardingPrefill(null);
    setStep(STEPS.ONBOARDING);
  }

  useEffect(() => {
    if (step === STEPS.LANDING) {
      removeSession(SESSION_KEY);
      return;
    }
    // Guard: PREVIOUS sem empresas → vai para ONBOARDING (estado inconsistente)
    if (step === STEPS.PREVIOUS && savedCompanies.length === 0) {
      setStep(STEPS.ONBOARDING);
      return;
    }
    if (step === STEPS.PREVIOUS && user) {
      loadAllActiveWeeklyPlans(user.id).then(indexWeeklyPlans);
    }

    saveSession({ step, businessData, financialData });
  }, [step, businessData, financialData, diagnosis, savedCompanies]); // eslint-disable-line react-hooks/exhaustive-deps

  // Navigation tracking — fires on every step change for authenticated users.
  // Skips LOADING (transient spinner, not a user-intentional page).
  useEffect(() => {
    if (step === STEPS.LOADING) return;
    trackEvent('page_viewed', {
      page: step,
      company: businessData?.businessName || null,
    });
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleAuthComplete(session) {
    setRecoveryMode(false);
    setUser(session.user);
    setAccessToken(session.access_token);
    await handleUserLoggedIn(session.user, null);
  }

  function syncCompanyState(company) {
    setActiveCompany(company);
    setOnboardingPrefill(company);
  }

  function handleViewPrevious(company = activeCompany) {
    const latestRecord = recordsForCompany(allDiagnoses, company)[0];
    if (!latestRecord) return;

    syncCompanyState(company);
    setBusinessData(toBusinessDataFromRecord(latestRecord));
    setFinancialData(latestRecord.financial_data);
    setDiagnosis(latestRecord.diagnosis_text);
    setStep(STEPS.DIAGNOSIS);
  }

  function handleUseCompany(company) {
    syncCompanyState(company);
    setBusinessData({
      businessName: company.businessName,
      segment: company.segment,
      customSegment: company.customSegment || null,
    });
    setInitialValues(null);
    setDiagnosis('');
    setDiagnosisResult(null);
    setFinancialData(INITIAL_FINANCIAL);
    trackEvent('company_selected', {
      company_name: company.businessName,
      segment: company.segment,
    });
    setStep(STEPS.ONBOARDING);
  }

  function handleCreateAnotherCompany() {
    const limits = getPlanLimits(plan);
    if (savedCompanies.length >= limits.maxCompanies) {
      openUpgradeModal('company_limit');
      return;
    }
    setActiveCompany(null);
    setOnboardingPrefill(null);
    setBusinessData({ businessName: '', segment: '' });
    setInitialValues(null);
    setDiagnosis('');
    setDiagnosisResult(null);
    setFinancialData(INITIAL_FINANCIAL);
    setStep(STEPS.ONBOARDING);
  }

  function getCompanySummary(company) {
    const records = recordsForCompany(allDiagnoses, company);
    const latest = records[0] || null;

    return {
      latestRecord: latest,
      recordsCount: records.length,
      lastCreatedAt: latest?.created_at || company.updatedAt || company.createdAt || null,
      lastReferenceMonth: latest?.financial_data?.referenceMonth || null,
    };
  }

  function handleOpenHistory(company = activeCompany) {
    if (!company) return;
    syncCompanyState(company);
    setStep(STEPS.HISTORY);
  }

  function handleOpenTracking(company = activeCompany, origin = STEPS.HISTORY) {
    const latestRecord = recordsForCompany(allDiagnoses, company)[0];
    if (!latestRecord) return;

    syncCompanyState(company);
    setBusinessData(toBusinessDataFromRecord(latestRecord));
    setFinancialData(latestRecord.financial_data);
    setTrackingOrigin(origin);
    setStep(STEPS.TRACKING);
  }

  function getWeeklyPlanSummary(company) {
    const key = companyPlanKey(company);
    return weeklyPlansByCompany[key] || null;
  }

  function getCanOrNotSummary(company) {
    return loadLastDecision({
      businessName: company.businessName,
      segment:      company.segment,
    });
  }

  async function handleOpenWeeklyPlan(origin = STEPS.DIAGNOSIS) {
    const limits = getPlanLimits(plan);
    if (limits.weeklyPlansPerMonth === 0) { openUpgradeModal('weekly_plan_limit'); return; }
    if (user) {
      const monthCount = await countWeeklyPlansThisMonth(user.id);
      if (monthCount >= limits.weeklyPlansPerMonth) { openUpgradeModal('weekly_plan_limit'); return; }
    }
    setWeeklyPlanOrigin(origin);
    setStep(STEPS.WEEKLY_PLAN);
  }

  async function handleOpenWeeklyPlanFromPrevious(company) {
    const limits = getPlanLimits(plan);
    if (limits.weeklyPlansPerMonth === 0) { openUpgradeModal('weekly_plan_limit'); return; }
    if (user) {
      const monthCount = await countWeeklyPlansThisMonth(user.id);
      if (monthCount >= limits.weeklyPlansPerMonth) { openUpgradeModal('weekly_plan_limit'); return; }
    }
    const latestRecord = recordsForCompany(allDiagnoses, company)[0];
    if (!latestRecord) return;

    syncCompanyState(company);
    setBusinessData(toBusinessDataFromRecord(latestRecord));
    setFinancialData(latestRecord.financial_data);
    setWeeklyPlanOrigin(STEPS.PREVIOUS);
    setStep(STEPS.WEEKLY_PLAN);
  }

  function handleOpenCanOrNot(company, origin = STEPS.PREVIOUS) {
    if (!getPlanLimits(plan).hasCanOrNot) { openUpgradeModal('can_or_not_gate'); return; }
    const latestRecord = recordsForCompany(allDiagnoses, company)[0];
    if (!latestRecord) return;

    syncCompanyState(company);
    setBusinessData(toBusinessDataFromRecord(latestRecord));
    setFinancialData(latestRecord.financial_data);
    setCanOrNotOrigin(origin);
    setStep(STEPS.CAN_OR_NOT);
  }

  async function handleOnboardingComplete(data) {
    if (user) {
      const updatedCompanies = await saveCompanyProfile(user.id, data);
      setSavedCompanies(mergeCompanies(updatedCompanies, allDiagnoses));
    }

    syncCompanyState(data);
    setBusinessData(data);
    trackEvent('questionnaire_started', { segment: data.segment });
    setStep(STEPS.QUESTIONNAIRE);
  }

  function openUpgradeModal(trigger = 'unknown') {
    trackEvent('upgrade_modal_shown', { trigger });
    setShowUpgradeModal(true);
  }

  function handleQuestionnaireComplete(data) {
    trackEvent('questionnaire_completed', { segment: businessData.segment });
    const limits = getPlanLimits(plan);
    if (limits.maxDiagnoses !== Infinity && allDiagnoses.length >= limits.maxDiagnoses) {
      openUpgradeModal('diagnosis_limit');
      return;
    }
    setFinancialData({ ...data, referenceMonth: businessData.referenceMonth });
    setStep(STEPS.LOADING);
  }

  function handleCorrectData(correctedFinancialData) {
    setFinancialData(correctedFinancialData);
    setDiagnosis('');
    setDiagnosisResult(null);
    setStep(STEPS.LOADING);
  }

  async function handleDiagnosisComplete(text, macro, jsonResult) {
    setDiagnosis(text);
    if (macro)       setMacroData(macro);
    if (jsonResult)  setDiagnosisResult(jsonResult);
    trackEvent('diagnosis_viewed', { segment: businessData.segment });
    setStep(STEPS.DIAGNOSIS);

    if (user) {
      await saveDiagnosis({ userId: user.id, businessData, financialData, diagnosisText: text });
      const updated = await loadAllDiagnoses(user.id);
      setAllDiagnoses(updated);
      const currentCompanies = await loadSavedCompanies(user.id);
      setSavedCompanies(mergeCompanies(currentCompanies, updated));
    }
  }

  function handleRestart() {
    removeSession(SESSION_KEY);
    setStep(STEPS.LANDING);
    setBusinessData({ businessName: '', segment: '' });
    setFinancialData(INITIAL_FINANCIAL);
    setDiagnosis('');
    setDiagnosisResult(null);
    setInitialValues(null);
    setActiveCompany(null);
    setOnboardingPrefill(null);
  }

  function handleRefill(prevEntry) {
    setInitialValues(prevEntry || null);
    setDiagnosis('');
    setFinancialData(INITIAL_FINANCIAL);
    setStep(STEPS.QUESTIONNAIRE);
  }

  function handleSelectFromHistory(record) {
    const company = toBusinessDataFromRecord(record);
    syncCompanyState(company);
    setBusinessData(company);
    setFinancialData(record.financial_data);
    setDiagnosis(record.diagnosis_text);
    setStep(STEPS.DIAGNOSIS);
  }

  function handleCompare(...records) {
    setComparisonPair(records.flat());
    setStep(STEPS.COMPARISON);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setAnalyticsUser(null);
    removeKey('folego_capital_history');
    handleRestart();
  }

  if (!authChecked) return <FullScreenSpinner />;

  const noHeader = [STEPS.AUTH, STEPS.PREVIOUS, STEPS.LANDING];

  return (
    <div
      className={
        step === STEPS.LANDING
          ? ''
          : [STEPS.QUESTIONNAIRE, STEPS.LOADING].includes(step)
            ? 'min-h-screen flex items-start sm:items-center justify-center p-4 py-8'
            : 'min-h-screen flex items-start sm:items-center justify-center p-4 py-8 bg-ink-50'
      }
      style={[STEPS.QUESTIONNAIRE, STEPS.LOADING].includes(step) ? { background: '#1e3050' } : {}}
    >
      {step === STEPS.LANDING && (
        <Suspense fallback={<FullScreenSpinner />}>
          <Landing
            onEnter={() => setStep(user ? (savedCompanies.length > 0 ? STEPS.PREVIOUS : STEPS.ONBOARDING) : STEPS.AUTH)}
            user={user}
            plan={plan}
            onHistory={allDiagnoses.length > 0 && plan !== 'free' ? () => setStep(STEPS.PREVIOUS) : null}
          />
        </Suspense>
      )}

      <div className={step === STEPS.LANDING ? 'hidden' : (WIDTH_BY_STEP[step] || WIDTH_BY_STEP.default)}>
        {user && !noHeader.includes(step) && (
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-ink-400 truncate max-w-[180px]">{user.email}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 text-xs font-semibold text-ink-500 bg-white border border-ink-200 rounded-lg hover:bg-ink-50 transition-colors"
              >
                Sair
              </button>
            </div>
          </div>
        )}

        <Suspense fallback={<FullScreenSpinner />}>
          {step === STEPS.AUTH && (
            <Auth
              onComplete={handleAuthComplete}
              recoveryMode={recoveryMode}
              onRecoveryComplete={handleAuthComplete}
            />
          )}

          {step === STEPS.PREVIOUS && savedCompanies.length > 0 && (
            <CompanySelector
              companies={savedCompanies}
              plan={plan}
              totalAnalysesCount={allDiagnoses.length}
              getSummary={getCompanySummary}
              getWeeklyPlanSummary={getWeeklyPlanSummary}
              getCanOrNotSummary={getCanOrNotSummary}
              onUseCompany={handleUseCompany}
              onViewLatest={handleViewPrevious}
              onViewHistory={handleOpenHistory}
              onOpenWeeklyPlan={handleOpenWeeklyPlanFromPrevious}
              onOpenCanOrNot={handleOpenCanOrNot}
              onCreateAnother={handleCreateAnotherCompany}
              onLogout={handleLogout}
            />
          )}

          {step === STEPS.HISTORY && (
            <History
              records={companyDiagnoses}
              companyName={activeCompany?.businessName || null}
              onSelect={handleSelectFromHistory}
              onCompare={handleCompare}
              onNewAnalysis={() => handleUseCompany(activeCompany)}
              onOpenTracking={companyDiagnoses.length > 0 ? () => handleOpenTracking(activeCompany, STEPS.HISTORY) : null}
              onBack={() => setStep(STEPS.PREVIOUS)}
            />
          )}

          {step === STEPS.COMPARISON && comparisonPair && (
            <Comparison
              records={comparisonPair}
              onBack={() => setStep(STEPS.HISTORY)}
              plan={plan}
              onOpenChat={() => { setChatOrigin(STEPS.COMPARISON); setStep(STEPS.CHAT); }}
            />
          )}

          {step === STEPS.ONBOARDING && (
            <Onboarding
              onComplete={handleOnboardingComplete}
              onBack={() => setStep(savedCompanies.length > 0 ? STEPS.PREVIOUS : STEPS.LANDING)}
              initialData={onboardingPrefill}
              user={user}
              existingDiagnoses={companyDiagnoses}
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
              diagnosisResult={diagnosisResult}
              allDiagnoses={companyDiagnoses}
              plan={plan}
              user={user}
              accessToken={accessToken}
              macroData={macroData}
              onOpenChat={() => { setChatOrigin(STEPS.DIAGNOSIS); setStep(STEPS.CHAT); }}
              onOpenTracking={() => { setTrackingOrigin(STEPS.DIAGNOSIS); setStep(STEPS.TRACKING); }}
              onOpenHistory={companyDiagnoses.length > 0 ? () => setStep(STEPS.PREVIOUS) : null}
              onOpenWeeklyPlan={() => handleOpenWeeklyPlan(STEPS.DIAGNOSIS)}
              onCorrectData={handleCorrectData}
              onRestart={handleRestart}
            />
          )}

          {step === STEPS.WEEKLY_PLAN && (
            <WeeklyPlan
              businessData={businessData}
              financialData={financialData}
              user={user}
              plan={plan}
              companyDiagnoses={companyDiagnoses}
              onOpenChat={() => { setChatContext(null); setChatOrigin(STEPS.WEEKLY_PLAN); setStep(STEPS.CHAT); }}
              onOpenChatWithContext={(msg) => { setChatContext({ initialMessage: msg }); setChatOrigin(STEPS.WEEKLY_PLAN); setStep(STEPS.CHAT); }}
              onBack={() => setStep(weeklyPlanOrigin)}
            />
          )}

          {step === STEPS.CAN_OR_NOT && (
            <CanOrNot
              businessData={businessData}
              financialData={financialData}
              allDiagnoses={companyDiagnoses}
              onOpenChat={(msg) => {
                setChatContext({ initialMessage: msg });
                setChatOrigin(STEPS.CAN_OR_NOT);
                setStep(STEPS.CHAT);
              }}
              onOpenWeeklyPlan={() => handleOpenWeeklyPlan(STEPS.CAN_OR_NOT)}
              onBack={() => setStep(canOrNotOrigin)}
            />
          )}

          {step === STEPS.TRACKING && (
            <MonthlyTracking
              businessData={businessData}
              financialData={financialData}
              allDiagnoses={companyDiagnoses}
              onBack={() => setStep(trackingOrigin)}
              onRefill={handleRefill}
            />
          )}

          {step === STEPS.CHAT && (
            <Chat
              businessData={businessData}
              financialData={financialData}
              diagnosis={diagnosis}
              allDiagnoses={companyDiagnoses}
              comparisonPair={comparisonPair}
              accessToken={accessToken}
              initialMessage={chatContext?.initialMessage || null}
              onBack={() => { setChatContext(null); setStep(chatOrigin); }}
            />
          )}
        </Suspense>
      </div>

      {showUpgradeModal && (
        <UpgradeModal onClose={() => setShowUpgradeModal(false)} currentPlan={plan} />
      )}
    </div>
  );
}
