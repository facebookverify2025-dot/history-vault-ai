import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface UserRegistrationProps {
  onRegister: (userData: { name: string; age: number; gender: 'male' | 'female' }) => void;
}

const UserRegistration = ({ onRegister }: UserRegistrationProps) => {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | ''>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && age && gender) {
      onRegister({
        name,
        age: parseInt(age),
        gender: gender as 'male' | 'female'
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ 
          duration: 0.8,
          type: "spring",
          stiffness: 100
        }}
        className="w-full max-w-md"
      >
        <Card className="card-neon">
          <div className="text-center mb-8">
            <motion.h2 
              className="text-3xl font-bold text-neon mb-2"
              animate={{ 
                textShadow: [
                  "0 0 10px hsl(280 100% 70%)",
                  "0 0 20px hsl(280 100% 70%)",
                  "0 0 10px hsl(280 100% 70%)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              🌟 مرحباً بك في تاريخك
            </motion.h2>
            <p className="text-muted-foreground">
              سجل بياناتك لتبدأ رحلة استكشاف التاريخ
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="name" className="text-foreground font-medium">
                الاسم
              </Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-space mt-2"
                placeholder="اكتب اسمك هنا..."
                required
              />
            </div>

            <div>
              <Label htmlFor="age" className="text-foreground font-medium">
                العمر
              </Label>
              <Input
                id="age"
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="input-space mt-2"
                placeholder="كم عمرك؟"
                min="10"
                max="100"
                required
              />
            </div>

            <div>
              <Label htmlFor="gender" className="text-foreground font-medium">
                الجنس
              </Label>
              <Select value={gender} onValueChange={(value) => setGender(value as 'male' | 'female')}>
                <SelectTrigger className="input-space mt-2">
                  <SelectValue placeholder="اختر..." />
                </SelectTrigger>
                <SelectContent className="glass border-glass-border">
                  <SelectItem value="male" className="text-foreground hover:bg-primary/20">
                    ذكر
                  </SelectItem>
                  <SelectItem value="female" className="text-foreground hover:bg-primary/20">
                    أنثى
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                type="submit"
                className="btn-neon w-full text-lg font-bold"
                disabled={!name || !age || !gender}
              >
                🚀 ابدأ المغامرة
              </Button>
            </motion.div>
          </form>

          <motion.div 
            className="mt-6 text-center text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            استعد لاستكشاف أسرار التاريخ! ✨
          </motion.div>
        </Card>
      </motion.div>
    </div>
  );
};

export default UserRegistration;