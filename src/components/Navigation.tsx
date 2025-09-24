import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface NavigationProps {
  currentPage: 'home' | 'quiz' | 'leaderboard' | 'admin';
  onPageChange: (page: 'home' | 'quiz' | 'leaderboard' | 'admin') => void;
  showAdminButton?: boolean;
}

const Navigation = ({ currentPage, onPageChange, showAdminButton = false }: NavigationProps) => {
  const navItems = [
    { key: 'home', label: '🏠 الرئيسية', icon: '🏠' },
    { key: 'quiz', label: '📝 الاختبار', icon: '📝' },
    { key: 'leaderboard', label: '🏆 لوحة الشرف', icon: '🏆' },
  ] as const;

  const handleAdminAccess = () => {
    onPageChange('admin');
  };

  return (
    <nav className="flex items-center gap-3">
      {navItems.map((item) => (
        <motion.div
          key={item.key}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            onClick={() => onPageChange(item.key)}
            className={`
              ${currentPage === item.key ? 'btn-neon' : 'btn-space'}
              px-4 py-2 text-sm font-medium
            `}
            variant="ghost"
          >
            <span className="mr-2">{item.icon}</span>
            {item.label}
          </Button>
        </motion.div>
      ))}

      {showAdminButton && (
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            onClick={handleAdminAccess}
            className={`
              ${currentPage === 'admin' ? 'btn-neon' : 'btn-space'}
              px-4 py-2 text-sm font-medium
            `}
            variant="ghost"
          >
            <span className="mr-2">⚙️</span>
            الإعدادات
          </Button>
        </motion.div>
      )}
    </nav>
  );
};

export default Navigation;