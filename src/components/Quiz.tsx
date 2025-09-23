import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { User, Question } from '@/pages/Index';

interface QuizProps {
  questions: Question[];
  currentUser: User | null;
  onScoreUpdate: (newScore: number) => void;
  onNavigateHome: () => void;
}

const Quiz = ({ questions, currentUser, onScoreUpdate, onNavigateHome }: QuizProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(currentUser?.score || 0);
  const [showResult, setShowResult] = useState(false);
  const [streak, setStreak] = useState(0);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  // Sound effects (simulated with console logs for now)
  const playCorrectSound = () => {
    console.log('🔊 إجابة صحيحة!');
    // In a real app, you would play an actual audio file
  };

  const playWrongSound = () => {
    console.log('🔊 إجابة خاطئة!');
    // In a real app, you would play an actual audio file
  };

  const handleAnswerSelect = (answer: string) => {
    if (isAnswered) return;
    
    setSelectedAnswer(answer);
    setIsAnswered(true);

    const isCorrect = answer === currentQuestion.correctAnswer;
    
    if (isCorrect) {
      playCorrectSound();
      const newScore = score + 10;
      setScore(newScore);
      setStreak(streak + 1);
      onScoreUpdate(newScore);
    } else {
      playWrongSound();
      setStreak(0);
    }

    // Auto advance after 2 seconds
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(null);
        setIsAnswered(false);
      } else {
        setShowResult(true);
      }
    }, 2000);
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setShowResult(false);
    setStreak(0);
  };

  if (showResult) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <Card className="card-neon max-w-md mx-auto p-8">
            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-6xl mb-4"
            >
              🎉
            </motion.div>
            
            <h2 className="text-3xl font-bold text-neon mb-4">
              تهانينا {currentUser?.name}!
            </h2>
            
            <div className="space-y-4 text-lg">
              <p className="text-foreground">
                النتيجة النهائية: <span className="text-gold-neon font-bold">{score}</span>
              </p>
              <p className="text-muted-foreground">
                من أصل {questions.length * 10} نقطة
              </p>
              <div className="my-6">
                <div className="text-4xl mb-2">
                  {score >= questions.length * 8 ? '🥇' : 
                   score >= questions.length * 6 ? '🥈' : 
                   score >= questions.length * 4 ? '🥉' : '📚'}
                </div>
                <p className="text-sm text-muted-foreground">
                  {score >= questions.length * 8 ? 'أداء ممتاز!' : 
                   score >= questions.length * 6 ? 'أداء جيد جداً!' : 
                   score >= questions.length * 4 ? 'أداء جيد!' : 'يمكنك التحسن!'}
                </p>
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <Button onClick={resetQuiz} className="btn-neon flex-1">
                🔄 إعادة المحاولة
              </Button>
              <Button onClick={onNavigateHome} className="btn-space flex-1">
                🏠 الرئيسية
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="text-center py-20">
        <Card className="card-space max-w-md mx-auto p-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            لا توجد أسئلة متاحة
          </h2>
          <p className="text-muted-foreground mb-6">
            يرجى إضافة أسئلة من لوحة الإعدادات
          </p>
          <Button onClick={onNavigateHome} className="btn-space">
            🏠 العودة للرئيسية
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header Info */}
      <div className="flex justify-between items-center mb-8">
        <motion.div 
          className="card-space flex items-center gap-4"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <span className="text-2xl">👤</span>
          <div>
            <p className="font-semibold text-foreground">{currentUser?.name}</p>
            <p className="text-sm text-muted-foreground">
              النقاط: <span className="text-gold-neon font-bold">{score}</span>
            </p>
          </div>
        </motion.div>

        {streak > 2 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="card-neon px-4 py-2"
          >
            <span className="text-lg">🔥</span>
            <span className="font-bold text-neon mr-2">
              {streak} إجابات متتالية!
            </span>
          </motion.div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>السؤال {currentQuestionIndex + 1} من {questions.length}</span>
          <span>%{Math.round(progress)}</span>
        </div>
        <Progress value={progress} className="h-3 glass rounded-full" />
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -300, opacity: 0 }}
          transition={{ duration: 0.5, type: "spring" }}
        >
          <Card className="card-neon p-8 mb-8">
            <motion.h2 
              className="text-2xl font-bold text-foreground mb-8 text-center leading-relaxed"
              animate={isAnswered && selectedAnswer === currentQuestion.correctAnswer ? 
                { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 0.5 }}
            >
              {currentQuestion.text}
            </motion.h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentQuestion.choices.map((choice, index) => {
                let buttonClass = 'btn-space w-full p-6 text-lg text-right h-auto';
                
                if (isAnswered) {
                  if (choice === currentQuestion.correctAnswer) {
                    buttonClass = 'btn-success w-full p-6 text-lg text-right h-auto animate-success-glow';
                  } else if (choice === selectedAnswer) {
                    buttonClass = 'btn-destructive w-full p-6 text-lg text-right h-auto animate-shake';
                  } else {
                    buttonClass += ' opacity-50';
                  }
                }

                return (
                  <motion.div
                    key={index}
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={!isAnswered ? { scale: 1.02 } : {}}
                    whileTap={!isAnswered ? { scale: 0.98 } : {}}
                  >
                    <Button
                      onClick={() => handleAnswerSelect(choice)}
                      className={buttonClass}
                      disabled={isAnswered}
                    >
                      <span className="mr-3 text-2xl">
                        {String.fromCharCode(65 + index)}.
                      </span>
                      {choice}
                    </Button>
                  </motion.div>
                );
              })}
            </div>

            {isAnswered && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 text-center"
              >
                <p className={`text-lg font-semibold ${
                  selectedAnswer === currentQuestion.correctAnswer 
                    ? 'text-success' 
                    : 'text-destructive'
                }`}>
                  {selectedAnswer === currentQuestion.correctAnswer 
                    ? '🎉 إجابة صحيحة! +10 نقاط' 
                    : `❌ إجابة خاطئة. الإجابة الصحيحة: ${currentQuestion.correctAnswer}`}
                </p>
              </motion.div>
            )}
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Quiz;