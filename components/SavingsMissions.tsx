import React, { useState, useEffect } from 'react';
import { Target, Lock, CheckCircle, TrendingUp, PiggyBank, Calendar, Lightbulb, ArrowLeft, Trophy } from 'lucide-react';
import { SavingsMission, FinancialHealthTest, Transaction } from '../types';

interface SavingsMissionsProps {
  onBack: () => void;
  transactions: Transaction[];
  missions: SavingsMission[];
  onUpdateMission: (mission: SavingsMission) => void;
}

const HEALTH_QUESTIONS = [
  {
    id: 'emergency_fund',
    question: '¿Tienes un fondo de emergencia equivalente a 3-6 meses de gastos?',
    options: ['Sí, más de 6 meses', 'Sí, 3-6 meses', 'Parcialmente', 'No'],
  },
  {
    id: 'savings_rate',
    question: '¿Ahorras más del 10% de tus ingresos mensualmente?',
    options: ['Más del 20%', 'Entre 10-20%', 'Menos del 10%', 'No ahorro'],
  },
  {
    id: 'debt',
    question: '¿Tienes deudas de tarjetas de crédito o préstamos?',
    options: ['No tengo deudas', 'Deudas menores al 30% de ingresos', 'Deudas entre 30-50%', 'Deudas mayores al 50%'],
  },
  {
    id: 'budget',
    question: '¿Llevas un presupuesto mensual y lo sigues?',
    options: ['Siempre', 'A veces', 'Raramente', 'Nunca'],
  },
  {
    id: 'financial_goals',
    question: '¿Tienes metas financieras claras y un plan para alcanzarlas?',
    options: ['Sí, con plan detallado', 'Sí, con plan básico', 'Tengo metas pero sin plan', 'No tengo metas claras'],
  },
];

const SavingsMissions: React.FC<SavingsMissionsProps> = ({ onBack, transactions, missions, onUpdateMission }) => {
  const [healthTest, setHealthTest] = useState<FinancialHealthTest>(() => {
    const saved = localStorage.getItem('cuentalo_financial_health_v1');
    return saved ? JSON.parse(saved) : { completed: false, answers: [] };
  });
  const [showTest, setShowTest] = useState(!healthTest.completed);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  // Fallback: If for some reason state indicates incomplete but showTest is false
  useEffect(() => {
    if (!healthTest.completed) {
      setShowTest(true);
    }
  }, [healthTest.completed]);

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers({ ...answers, [questionId]: answer });
  };

  const handleNextQuestion = () => {
    if (currentQuestion < HEALTH_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      completeHealthTest();
    }
  };

  const completeHealthTest = () => {
    const testResult: FinancialHealthTest = {
      completed: true,
      answers: Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        answer,
      })),
      completedAt: new Date().toISOString(),
    };
    setHealthTest(testResult);
    localStorage.setItem('cuentalo_financial_health_v1', JSON.stringify(testResult));
    setShowTest(false);

    // ...
    missions.forEach(m => {
      if (m.status === 'locked') {
        onUpdateMission({ ...m, status: 'active' });
      }
    });
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'calendar':
        return <Calendar size={24} />;
      case 'piggybank':
        return <PiggyBank size={24} />;
      case 'target':
        return <Target size={24} />;
      default:
        return <Target size={24} />;
    }
  };

  const calculateProgress = (mission: SavingsMission) => {
    return Math.min((mission.currentProgress / mission.targetProgress) * 100, 100);
  };

  if (showTest) {
    const question = HEALTH_QUESTIONS[currentQuestion];
    const isLastQuestion = currentQuestion === HEALTH_QUESTIONS.length - 1;
    const canProceed = answers[question.id] !== undefined;

    return (
      <div className="relative w-full max-w-2xl mx-auto h-full flex flex-col p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
              Test de salud financiera
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Pregunta {currentQuestion + 1} de {HEALTH_QUESTIONS.length}
            </p>
          </div>
        </div>

        {/* Progress Bar (Purple) */}
        <div className="mb-8">
          <div className="h-1.5 bg-gray-200 dark:bg-[#333] rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-600 transition-all duration-300 rounded-full"
              style={{ width: `${((currentQuestion + 1) / HEALTH_QUESTIONS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="flex-1 flex flex-col overflow-y-auto pb-6 scrollable-list">
          <div className="bg-white dark:bg-[#1E1E1E] rounded-[24px] p-6 shadow-sm border border-gray-100 dark:border-[#333] mb-6 flex-shrink-0">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
                <TrendingUp size={24} />
              </div>
              <div className="flex-1 mt-1">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                  {question.question}
                </h2>
              </div>
            </div>

            <div className="space-y-3">
              {question.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(question.id, option)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 ${answers[question.id] === option
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-900 dark:text-purple-100 font-semibold shadow-sm'
                    : 'border-gray-200 dark:border-[#333] bg-gray-50 dark:bg-[#2C2C2C] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#333]'
                    }`}
                >
                  <span className="text-sm">{option}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleNextQuestion}
            disabled={!canProceed}
            className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] mt-2 mb-6"
          >
            {isLastQuestion ? 'Completar Test' : 'Siguiente Pregunta'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto h-full flex flex-col p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            Misiones de ahorro
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Completa misiones y mejora tu salud financiera
          </p>
        </div>
      </div>

      {/* Missions List */}
      <div className="flex-1 overflow-y-auto space-y-4 scrollable-list pb-6">
        {missions.map((mission) => {
          const progress = calculateProgress(mission);
          const isLocked = mission.status === 'locked';
          const isCompleted = mission.status === 'completed';

          return (
            <div
              key={mission.id}
              className={`bg-white dark:bg-[#1E1E1E] rounded-[32px] p-6 shadow-sm border transition-all duration-300 ${isLocked
                ? 'border-gray-200 dark:border-[#333] opacity-60'
                : isCompleted
                  ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-900/10'
                  : 'border-gray-200 dark:border-[#333] hover:border-indigo-200 dark:hover:border-indigo-800'
                }`}
            >
              <div className="flex flex-col md:flex-row items-start gap-4">
                {/* Icon & Mobile Title Wrapper */}
                <div className="flex items-center gap-4 w-full md:w-auto">
                  {/* Icon */}
                  <div
                    className={`w-16 h-16 rounded-[20px] flex items-center justify-center flex-shrink-0 ${isLocked
                      ? 'bg-gray-200 dark:bg-[#2C2C2C] text-gray-400'
                      : isCompleted
                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                        : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                      }`}
                  >
                    {isLocked ? (
                      <Lock size={24} />
                    ) : isCompleted ? (
                      <CheckCircle size={24} />
                    ) : (
                      getIcon(mission.icon)
                    )}
                  </div>

                  {/* Mobile Only Title */}
                  <h3 className="md:hidden text-lg font-bold text-gray-900 dark:text-white leading-tight flex-1">
                    {mission.title}
                  </h3>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 w-full">

                  {/* Desktop Layout: Title + Desc */}
                  <div className="hidden md:flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                        {mission.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {mission.description}
                      </p>
                    </div>
                    {isCompleted && (
                      <Trophy size={20} className="text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                    )}
                  </div>

                  {/* Mobile Layout: Desc (Title is above) */}
                  <div className="md:hidden mb-4 mt-0">
                    <div className="flex justify-between items-start gap-2">
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        {mission.description}
                      </p>
                      {isCompleted && (
                        <Trophy size={20} className="text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {!isLocked && (
                    <div className="mb-3">
                      <div className="h-2 bg-gray-200 dark:bg-[#2C2C2C] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${isCompleted
                            ? 'bg-emerald-500'
                            : 'bg-gradient-to-r from-indigo-600 to-purple-600'
                            }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {Math.round(progress)}% completado
                      </p>
                    </div>
                  )}

                  {/* Tip */}
                  <div className="mt-4 p-4 bg-gray-50 dark:bg-[#2C2C2C] rounded-[20px] border border-gray-100 dark:border-[#333]">
                    <div className="flex items-start gap-2">
                      <Lightbulb size={16} className="text-yellow-500 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-gray-700 dark:text-gray-300">{mission.tip}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SavingsMissions;
