import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User } from '@/pages/Index';

interface LeaderboardProps {
  users: User[];
  currentUser: User | null;
}

const Leaderboard = ({ users, currentUser }: LeaderboardProps) => {
  // Sort users by score (highest first)
  const sortedUsers = [...users].sort((a, b) => b.score - a.score);

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return { icon: '🥇', label: 'المركز الأول', class: 'bg-gradient-to-r from-yellow-400 to-yellow-600' };
      case 2:
        return { icon: '🥈', label: 'المركز الثاني', class: 'bg-gradient-to-r from-gray-300 to-gray-500' };
      case 3:
        return { icon: '🥉', label: 'المركز الثالث', class: 'bg-gradient-to-r from-orange-400 to-orange-600' };
      default:
        return { icon: '🏆', label: `المركز ${rank}`, class: 'bg-gradient-to-r from-blue-400 to-blue-600' };
    }
  };

  const getGenderIcon = (gender: 'male' | 'female') => {
    return gender === 'male' ? '👨‍🎓' : '👩‍🎓';
  };

  if (sortedUsers.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="card-space max-w-md mx-auto p-8 text-center">
          <motion.div
            animate={{ 
              rotate: [0, 10, -10, 0]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-6xl mb-4"
          >
            🏆
          </motion.div>
          <h2 className="text-2xl font-bold text-foreground mb-4">
            لوحة الشرف فارغة
          </h2>
          <p className="text-muted-foreground">
            كن أول من يسجل نقاط في الاختبار!
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold text-neon mb-4 animate-glow-pulse">
          🏆 لوحة الشرف
        </h1>
        <p className="text-muted-foreground text-lg">
          أفضل الطلاب في اختبار التاريخ
        </p>
      </motion.div>

      {/* Top 3 Podium */}
      {sortedUsers.length >= 3 && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="grid grid-cols-3 gap-4 mb-12 max-w-2xl mx-auto"
        >
          {/* Second Place */}
          <div className="flex flex-col items-center order-1">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
              className="card-neon p-4 text-center w-full"
            >
              <div className="text-4xl mb-2">🥈</div>
              <h3 className="font-bold text-foreground">{sortedUsers[1].name}</h3>
              <p className="text-sm text-muted-foreground">{sortedUsers[1].score} نقطة</p>
            </motion.div>
          </div>

          {/* First Place */}
          <div className="flex flex-col items-center order-2">
            <motion.div
              animate={{ 
                y: [0, -15, 0],
                boxShadow: [
                  "0 0 20px hsla(45, 100%, 65%, 0.5)",
                  "0 0 40px hsla(45, 100%, 65%, 0.8)",
                  "0 0 20px hsla(45, 100%, 65%, 0.5)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="card-neon p-6 text-center w-full"
            >
              <div className="text-6xl mb-2">🥇</div>
              <h3 className="font-bold text-gold-neon text-lg">{sortedUsers[0].name}</h3>
              <p className="text-sm text-muted-foreground">{sortedUsers[0].score} نقطة</p>
              <Badge className="mt-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold">
                بطل التاريخ
              </Badge>
            </motion.div>
          </div>

          {/* Third Place */}
          <div className="flex flex-col items-center order-3">
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: 1 }}
              className="card-neon p-4 text-center w-full"
            >
              <div className="text-4xl mb-2">🥉</div>
              <h3 className="font-bold text-foreground">{sortedUsers[2].name}</h3>
              <p className="text-sm text-muted-foreground">{sortedUsers[2].score} نقطة</p>
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* Complete Leaderboard */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="space-y-4"
      >
        <h2 className="text-2xl font-bold text-center text-foreground mb-6">
          التصنيف الكامل
        </h2>

        {sortedUsers.map((user, index) => {
          const rank = index + 1;
          const badge = getRankBadge(rank);
          const isCurrentUser = currentUser?.id === user.id;

          return (
            <motion.div
              key={user.id}
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 * index, duration: 0.5 }}
              whileHover={{ scale: 1.02 }}
            >
              <Card className={`
                ${isCurrentUser ? 'card-neon' : 'card-space'} 
                ${rank <= 3 ? 'animate-glow-pulse' : ''}
              `}>
                <div className="flex items-center justify-between p-6">
                  <div className="flex items-center gap-6">
                    {/* Rank Badge */}
                    <motion.div
                      animate={rank <= 3 ? { 
                        rotate: [0, 5, -5, 0],
                        scale: [1, 1.1, 1]
                      } : {}}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="text-center"
                    >
                      <div className="text-3xl mb-1">{badge.icon}</div>
                      <Badge className={`${badge.class} text-white font-bold text-xs`}>
                        #{rank}
                      </Badge>
                    </motion.div>

                    {/* User Info */}
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getGenderIcon(user.gender)}</span>
                        <div>
                          <h3 className={`font-bold text-lg ${
                            isCurrentUser ? 'text-neon' : 'text-foreground'
                          }`}>
                            {user.name}
                            {isCurrentUser && <span className="mr-2 text-gold-neon">👑</span>}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            العمر: {user.age} سنة
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-left">
                    <div className={`text-2xl font-bold ${
                      rank <= 3 ? 'text-gold-neon' : 'text-foreground'
                    }`}>
                      {user.score}
                    </div>
                    <p className="text-sm text-muted-foreground">نقطة</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Stats Summary */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <Card className="card-space text-center p-6">
          <div className="text-3xl mb-2">👥</div>
          <h3 className="font-bold text-foreground">إجمالي المشاركين</h3>
          <p className="text-2xl text-neon font-bold">{sortedUsers.length}</p>
        </Card>

        <Card className="card-space text-center p-6">
          <div className="text-3xl mb-2">⭐</div>
          <h3 className="font-bold text-foreground">أعلى نقاط</h3>
          <p className="text-2xl text-gold-neon font-bold">
            {sortedUsers.length > 0 ? sortedUsers[0].score : 0}
          </p>
        </Card>

        <Card className="card-space text-center p-6">
          <div className="text-3xl mb-2">📊</div>
          <h3 className="font-bold text-foreground">متوسط النقاط</h3>
          <p className="text-2xl text-foreground font-bold">
            {sortedUsers.length > 0 
              ? Math.round(sortedUsers.reduce((sum, user) => sum + user.score, 0) / sortedUsers.length)
              : 0}
          </p>
        </Card>
      </motion.div>
    </div>
  );
};

export default Leaderboard;