import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import UserRegistration from '@/components/UserRegistration';
import Quiz from '@/components/Quiz';
import Leaderboard from '@/components/Leaderboard';
import AdminPanel from '@/components/AdminPanel';
import Navigation from '@/components/Navigation';
import { Card } from '@/components/ui/card';

export interface User {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female';
  score: number;
  createdAt: string;
}

export interface Question {
  id: string;
  text: string;
  choices: string[];
  correctAnswer: string;
  source: 'manual' | 'AI' | 'json';
  createdAt: string;
}

const Index = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<'home' | 'quiz' | 'leaderboard' | 'admin'>('home');
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: '1',
      text: 'من هو مؤسس الدولة الأيوبية؟',
      choices: ['صلاح الدين الأيوبي', 'نور الدين زنكي', 'قطز', 'بيبرس'],
      correctAnswer: 'صلاح الدين الأيوبي',
      source: 'manual',
      createdAt: new Date().toISOString()
    },
    {
      id: '2', 
      text: 'متى وقعت معركة القادسية؟',
      choices: ['636م', '750م', '1258م', '1453م'],
      correctAnswer: '636م',
      source: 'manual',
      createdAt: new Date().toISOString()
    },
    {
      id: '3',
      text: 'ما هي أول عاصمة للدولة الإسلامية؟',
      choices: ['مكة المكرمة', 'المدينة المنورة', 'دمشق', 'بغداد'],
      correctAnswer: 'المدينة المنورة',
      source: 'manual',
      createdAt: new Date().toISOString()
    }
  ]);
  const [users, setUsers] = useState<User[]>([]);

  // Load saved data from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    const savedUsers = localStorage.getItem('users');
    const savedQuestions = localStorage.getItem('questions');

    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    }
    if (savedQuestions) {
      setQuestions(JSON.parse(savedQuestions));
    }
  }, []);

  const handleUserRegistration = (userData: Omit<User, 'id' | 'score' | 'createdAt'>) => {
    const user: User = {
      id: Date.now().toString(),
      ...userData,
      score: 0,
      createdAt: new Date().toISOString()
    };
    
    setCurrentUser(user);
    const updatedUsers = [...users, user];
    setUsers(updatedUsers);
    
    // Save to localStorage
    localStorage.setItem('currentUser', JSON.stringify(user));
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    
    setCurrentPage('quiz');
  };

  const handleScoreUpdate = (newScore: number) => {
    if (currentUser) {
      const updatedUser = { ...currentUser, score: newScore };
      setCurrentUser(updatedUser);
      
      const updatedUsers = users.map(user => 
        user.id === currentUser.id ? updatedUser : user
      );
      setUsers(updatedUsers);
      
      // Save to localStorage
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      localStorage.setItem('users', JSON.stringify(updatedUsers));
    }
  };

  const handleAddQuestion = (question: Omit<Question, 'id' | 'createdAt'>) => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      ...question,
      createdAt: new Date().toISOString()
    };
    
    const updatedQuestions = [...questions, newQuestion];
    setQuestions(updatedQuestions);
    localStorage.setItem('questions', JSON.stringify(updatedQuestions));
  };

  const handleDeleteQuestion = (questionId: string) => {
    const updatedQuestions = questions.filter(q => q.id !== questionId);
    setQuestions(updatedQuestions);
    localStorage.setItem('questions', JSON.stringify(updatedQuestions));
  };

  const handleImportQuestions = (importedQuestions: Question[]) => {
    const updatedQuestions = [...questions, ...importedQuestions];
    setQuestions(updatedQuestions);
    localStorage.setItem('questions', JSON.stringify(updatedQuestions));
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'quiz':
        return (
          <Quiz 
            questions={questions}
            currentUser={currentUser}
            onScoreUpdate={handleScoreUpdate}
            onNavigateHome={() => setCurrentPage('home')}
          />
        );
      case 'leaderboard':
        return <Leaderboard users={users} currentUser={currentUser} />;
      case 'admin':
        return (
          <AdminPanel 
            questions={questions}
            onAddQuestion={handleAddQuestion}
            onDeleteQuestion={handleDeleteQuestion}
            onImportQuestions={handleImportQuestions}
            users={users}
            onResetLeaderboard={() => {
              setUsers([]);
              localStorage.setItem('users', JSON.stringify([]));
            }}
          />
        );
      default:
        return currentUser ? (
          <div className="text-center space-y-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="card-neon p-8 max-w-md mx-auto"
            >
              <h2 className="text-2xl font-bold text-neon mb-4">
                مرحباً {currentUser.name}! 
              </h2>
              <p className="text-muted-foreground mb-6">
                نقاطك الحالية: <span className="text-gold-neon font-bold">{currentUser.score}</span>
              </p>
              <button
                onClick={() => setCurrentPage('quiz')}
                className="btn-neon w-full mb-4"
              >
                🚀 ابدأ الاختبار
              </button>
              <button
                onClick={() => setCurrentPage('leaderboard')}
                className="btn-space w-full"
              >
                🏆 لوحة الشرف
              </button>
            </motion.div>
          </div>
        ) : (
          <UserRegistration onRegister={handleUserRegistration} />
        );
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      {/* Header */}
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 p-6"
      >
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <motion.h1 
            className="text-4xl font-bold text-neon animate-glow-pulse cursor-pointer"
            onClick={() => setCurrentPage('home')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            ⭐ تاريخك
          </motion.h1>
          
          <Navigation 
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            showAdminButton={true}
          />
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="container mx-auto px-4 pb-8 relative z-10">
        <motion.div
          key={currentPage}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          {renderCurrentPage()}
        </motion.div>
      </main>

      {/* Footer */}
      <motion.footer 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="fixed bottom-0 left-0 right-0 p-4 text-center text-xs text-muted-foreground"
      >
        <div className="glass rounded-lg p-2 max-w-md mx-auto">
          © 2025 Mohamed Salah Kamal - Cybersecurity & CTF Enthusiast 
          <br />
          <span className="text-neon-accent">mohamadsalahkamal683@gmail.com</span>
        </div>
      </motion.footer>
    </div>
  );
};

export default Index;