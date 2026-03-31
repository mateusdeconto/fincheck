import { useState } from 'react';
import Onboarding from './components/Onboarding.jsx';
import Questionnaire from './components/Questionnaire.jsx';
import Loading from './components/Loading.jsx';
import Diagnosis from './components/Diagnosis.jsx';
import Chat from './components/Chat.jsx';

/**
 * Estados possíveis da aplicação — máquina de estados simples
 * onboarding → questionnaire → loading → diagnosis → chat
 */
const STEPS = {
  ONBOARDING: 'onboarding',
  QUESTIONNAIRE: 'questionnaire',
  LOADING: 'loading',
  DIAGNOSIS: 'diagnosis',
  CHAT: 'chat',
};

export default function App() {
  const [step, setStep] = useState(STEPS.ONBOARDING);

  // Dados do negócio (onboarding)
  const [businessData, setBusinessData] = useState({
    businessName: '',
    segment: '',
  });

  // Dados financeiros (questionário)
  const [financialData, setFinancialData] = useState({
    revenue: '',
    cogs: '',
    fixedExpenses: '',
    cashBalance: '',
    debtPayment: '',
    accountsReceivable: '',
  });

  // Diagnóstico gerado pela IA (texto completo)
  const [diagnosis, setDiagnosis] = useState('');

  // Navega do onboarding para o questionário
  function handleOnboardingComplete(data) {
    setBusinessData(data);
    setStep(STEPS.QUESTIONNAIRE);
  }

  // Navega do questionário para o loading/diagnóstico
  function handleQuestionnaireComplete(data) {
    setFinancialData(data);
    setStep(STEPS.LOADING);
  }

  // Chamado quando o streaming do diagnóstico termina
  function handleDiagnosisComplete(text) {
    setDiagnosis(text);
    setStep(STEPS.DIAGNOSIS);
  }

  // Abre o chat após o diagnóstico
  function handleOpenChat() {
    setStep(STEPS.CHAT);
  }

  // Reinicia tudo do zero
  function handleRestart() {
    setStep(STEPS.ONBOARDING);
    setBusinessData({ businessName: '', segment: '' });
    setFinancialData({ revenue: '', cogs: '', fixedExpenses: '', cashBalance: '', debtPayment: '', accountsReceivable: '' });
    setDiagnosis('');
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-navy-700 to-navy-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {step === STEPS.ONBOARDING && (
          <Onboarding onComplete={handleOnboardingComplete} />
        )}

        {step === STEPS.QUESTIONNAIRE && (
          <Questionnaire
            onComplete={handleQuestionnaireComplete}
            onBack={() => setStep(STEPS.ONBOARDING)}
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
            diagnosis={diagnosis}
            onOpenChat={handleOpenChat}
            onRestart={handleRestart}
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
