import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { User, Question } from '@/pages/Index';
import { GameStats } from '@/components/AchievementSystem';

interface QuizProps {
  questions: Question[];
  currentUser: User | null;
  onScoreUpdate: (newScore: number, stats?: Partial<GameStats>) => void;
  onNavigateHome: () => void;
}

const Quiz = ({ questions, currentUser, onScoreUpdate, onNavigateHome }: QuizProps) => {
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(currentUser?.score || 0);
  const [showResult, setShowResult] = useState(false);
  const [streak, setStreak] = useState(0);
  const [usedQuestions, setUsedQuestions] = useState<Set<string>>(new Set());
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [averageTime, setAverageTime] = useState<number[]>([]);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  
  // Shuffle choices for each question to randomize answer positions
  const shuffleChoices = (question: Question) => {
    const shuffledChoices = [...question.choices].sort(() => Math.random() - 0.5);
    return {
      ...question,
      choices: shuffledChoices
    };
  };

  // Shuffle questions and their choices on component mount
  useEffect(() => {
    const shuffled = [...questions]
      .sort(() => Math.random() - 0.5)
      .map(question => shuffleChoices(question));
    setShuffledQuestions(shuffled);
    setQuestionStartTime(Date.now());
  }, [questions]);

  // Reset question timer when question changes
  useEffect(() => {
    setQuestionStartTime(Date.now());
  }, [currentQuestionIndex]);

  const currentQuestion = shuffledQuestions[currentQuestionIndex];
  const progress = shuffledQuestions.length > 0 ? ((currentQuestionIndex + 1) / shuffledQuestions.length) * 100 : 0;

  // Sound effects with better feedback
  const playCorrectSound = () => {
    console.log('🔊 إجابة صحيحة!');
    // Create audio context for sound visualization
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A note
      oscillator.frequency.setValueAtTime(554.37, audioContext.currentTime + 0.1); // C# note
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.log('🎵 تأثير صوتي إيجابي');
    }
  };

  const playWrongSound = () => {
    console.log('🔊 إجابة خاطئة!');
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(200, audioContext.currentTime); // Low note
      oscillator.frequency.setValueAtTime(150, audioContext.currentTime + 0.2); // Lower note
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.log('🎵 تأثير صوتي سلبي');
    }
  };

  const handleAnswerSelect = (answer: string) => {
    if (isAnswered) return;
    
    // Calculate time taken for this question
    const timeTaken = Date.now() - questionStartTime;
    setAverageTime(prev => [...prev, timeTaken]);
    setQuestionsAnswered(prev => prev + 1);
    
    setSelectedAnswer(answer);
    setIsAnswered(true);

    // Mark question as used
    setUsedQuestions(prev => new Set(prev).add(currentQuestion.id));

    const isCorrect = answer === currentQuestion.correctAnswer;
    
    if (isCorrect) {
      playCorrectSound();
      setCorrectAnswers(prev => prev + 1);
      
      // Bonus points for quick answers (under 10 seconds)
      const bonusPoints = timeTaken < 10000 ? 15 : 10;
      const newScore = score + bonusPoints;
      setScore(newScore);
      setStreak(streak + 1);
      
      const currentAverage = averageTime.length > 0 
        ? averageTime.reduce((a, b) => a + b, 0) / averageTime.length 
        : timeTaken;
        
      onScoreUpdate(newScore, {
        streak: streak + 1,
        questionsAnswered: questionsAnswered + 1,
        correctAnswers: correctAnswers + 1,
        averageTime: currentAverage,
        currentScore: newScore
      });
      
      if (timeTaken < 5000) {
        console.log('⚡ إجابة سريعة! +5 نقاط إضافية');
      }
    } else {
      playWrongSound();
      setStreak(0);
      
      const currentAverage = averageTime.length > 0 
        ? averageTime.reduce((a, b) => a + b, 0) / averageTime.length 
        : timeTaken;
        
      onScoreUpdate(score, {
        streak: 0,
        questionsAnswered: questionsAnswered + 1,
        correctAnswers,
        averageTime: currentAverage,
        currentScore: score
      });
    }

    // Auto advance after 2 seconds
    setTimeout(() => {
      if (currentQuestionIndex < shuffledQuestions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(null);
        setIsAnswered(false);
      } else {
        setShowResult(true);
      }
    }, 2000);
  };

  const resetQuiz = () => {
    // Reshuffle questions and choices for a new quiz experience
    const shuffled = [...questions]
      .sort(() => Math.random() - 0.5)
      .map(question => shuffleChoices(question));
    setShuffledQuestions(shuffled);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setShowResult(false);
    setStreak(0);
    setUsedQuestions(new Set());
    setAverageTime([]);
    setQuestionStartTime(Date.now());
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
                من أصل {shuffledQuestions.length * 10} نقطة
              </p>
              {averageTime.length > 0 && (
                <p className="text-neon-accent text-sm">
                  متوسط الوقت: {Math.round(averageTime.reduce((a, b) => a + b, 0) / averageTime.length / 1000)} ثانية
                </p>
              )}
              <div className="my-6">
                <div className="text-4xl mb-2">
                  {score >= shuffledQuestions.length * 8 ? '🥇' : 
                   score >= shuffledQuestions.length * 6 ? '🥈' : 
                   score >= shuffledQuestions.length * 4 ? '🥉' : '📚'}
                </div>
                <p className="text-sm text-muted-foreground">
                  {score >= shuffledQuestions.length * 8 ? 'أداء ممتاز!' : 
                   score >= shuffledQuestions.length * 6 ? 'أداء جيد جداً!' : 
                   score >= shuffledQuestions.length * 4 ? 'أداء جيد!' : 'يمكنك التحسن!'}
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
          <span>السؤال {currentQuestionIndex + 1} من {shuffledQuestions.length}</span>
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