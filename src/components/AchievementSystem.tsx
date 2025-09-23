import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  condition: (stats: GameStats) => boolean;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface GameStats {
  currentScore: number;
  streak: number;
  questionsAnswered: number;
  correctAnswers: number;
  averageTime: number;
  totalSessions: number;
}

interface AchievementSystemProps {
  stats: GameStats;
  onAchievementUnlock?: (achievement: Achievement) => void;
}

const achievements: Achievement[] = [
  {
    id: 'first_correct',
    title: 'البداية الصحيحة',
    description: 'أجب على أول سؤال بشكل صحيح',
    icon: '✅',
    condition: (stats) => stats.correctAnswers >= 1,
    unlocked: false
  },
  {
    id: 'streak_master',
    title: 'مؤرخ محترف',
    description: 'أجب على 5 أسئلة متتالية بشكل صحيح',
    icon: '🔥',
    condition: (stats) => stats.streak >= 5,
    unlocked: false
  },
  {
    id: 'speed_demon',
    title: 'البرق السريع',
    description: 'أجب على سؤال خلال 3 ثواني',
    icon: '⚡',
    condition: (stats) => stats.averageTime > 0 && stats.averageTime < 3000,
    unlocked: false
  },
  {
    id: 'perfectionist',
    title: 'دقة قاتلة',
    description: 'احصل على 100% في جلسة كاملة',
    icon: '🎯',
    condition: (stats) => stats.questionsAnswered >= 3 && stats.correctAnswers === stats.questionsAnswered,
    unlocked: false
  },
  {
    id: 'scholar',
    title: 'عالم التاريخ',
    description: 'أجب على 50 سؤال بشكل صحيح',
    icon: '📚',
    condition: (stats) => stats.correctAnswers >= 50,
    unlocked: false
  },
  {
    id: 'high_scorer',
    title: 'نجم النقاط',
    description: 'احصل على 200 نقطة أو أكثر',
    icon: '⭐',
    condition: (stats) => stats.currentScore >= 200,
    unlocked: false
  }
];

const AchievementSystem = ({ stats, onAchievementUnlock }: AchievementSystemProps) => {
  const [unlockedAchievements, setUnlockedAchievements] = useState<Achievement[]>([]);
  const [showNotification, setShowNotification] = useState<Achievement | null>(null);

  useEffect(() => {
    // Load saved achievements
    const saved = localStorage.getItem('achievements');
    if (saved) {
      const savedAchievements = JSON.parse(saved);
      setUnlockedAchievements(savedAchievements);
    }
  }, []);

  useEffect(() => {
    // Check for new achievements
    achievements.forEach(achievement => {
      const isAlreadyUnlocked = unlockedAchievements.some(a => a.id === achievement.id);
      
      if (!isAlreadyUnlocked && achievement.condition(stats)) {
        const newAchievement = {
          ...achievement,
          unlocked: true,
          unlockedAt: new Date().toISOString()
        };
        
        const updatedAchievements = [...unlockedAchievements, newAchievement];
        setUnlockedAchievements(updatedAchievements);
        localStorage.setItem('achievements', JSON.stringify(updatedAchievements));
        
        // Show notification
        setShowNotification(newAchievement);
        onAchievementUnlock?.(newAchievement);
        
        // Hide notification after 5 seconds
        setTimeout(() => setShowNotification(null), 5000);
      }
    });
  }, [stats, unlockedAchievements, onAchievementUnlock]);

  return (
    <>
      {/* Achievement Notification */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            className="fixed top-20 right-4 z-50"
          >
            <Card className="card-neon p-4 max-w-sm">
              <div className="flex items-center gap-3">
                <div className="text-3xl animate-bounce">
                  {showNotification.icon}
                </div>
                <div>
                  <h3 className="font-bold text-neon text-sm">
                    إنجاز جديد! 🎉
                  </h3>
                  <h4 className="font-semibold text-foreground">
                    {showNotification.title}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {showNotification.description}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Achievement Progress Panel */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-6">
        {achievements.map(achievement => {
          const isUnlocked = unlockedAchievements.some(a => a.id === achievement.id);
          return (
            <motion.div
              key={achievement.id}
              whileHover={{ scale: isUnlocked ? 1.05 : 1.02 }}
              className={`p-3 rounded-lg border ${
                isUnlocked 
                  ? 'bg-success/20 border-success/30 text-success' 
                  : 'bg-muted/10 border-muted/20 text-muted-foreground'
              }`}
            >
              <div className="text-2xl mb-2 text-center">
                {achievement.icon}
              </div>
              <h4 className="font-semibold text-xs text-center">
                {achievement.title}
              </h4>
              <p className="text-xs text-center opacity-80">
                {achievement.description}
              </p>
              {isUnlocked && (
                <div className="text-xs text-center mt-1 opacity-60">
                  ✅ مكتمل
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </>
  );
};

export default AchievementSystem;