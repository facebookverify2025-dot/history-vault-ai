import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Trash2, Plus, Download, Upload } from 'lucide-react';
import { Question, User } from '@/pages/Index';

interface AdminPanelProps {
  questions: Question[];
  onAddQuestion: (question: Omit<Question, 'id' | 'createdAt'>) => void;
  onDeleteQuestion: (questionId: string) => void;
  onImportQuestions: (questions: Question[]) => void;
  users: User[];
  onResetLeaderboard: () => void;
}

const AdminPanel = ({ 
  questions, 
  onAddQuestion, 
  onDeleteQuestion, 
  onImportQuestions,
  users,
  onResetLeaderboard 
}: AdminPanelProps) => {
  const [newQuestion, setNewQuestion] = useState({
    text: '',
    choices: ['', '', '', ''],
    correctAnswer: ''
  });
  const [showAddDialog, setShowAddDialog] = useState(false);

  const handleAddChoice = () => {
    if (newQuestion.choices.length < 6) {
      setNewQuestion({
        ...newQuestion,
        choices: [...newQuestion.choices, '']
      });
    }
  };

  const handleRemoveChoice = (index: number) => {
    if (newQuestion.choices.length > 2) {
      const updatedChoices = newQuestion.choices.filter((_, i) => i !== index);
      setNewQuestion({
        ...newQuestion,
        choices: updatedChoices,
        correctAnswer: newQuestion.correctAnswer === newQuestion.choices[index] ? '' : newQuestion.correctAnswer
      });
    }
  };

  const handleUpdateChoice = (index: number, value: string) => {
    const updatedChoices = [...newQuestion.choices];
    updatedChoices[index] = value;
    setNewQuestion({
      ...newQuestion,
      choices: updatedChoices
    });
  };

  const handleSubmitQuestion = () => {
    if (newQuestion.text && newQuestion.choices.every(choice => choice.trim()) && newQuestion.correctAnswer) {
      onAddQuestion({
        text: newQuestion.text,
        choices: newQuestion.choices.filter(choice => choice.trim()),
        correctAnswer: newQuestion.correctAnswer,
        source: 'manual'
      });
      
      setNewQuestion({
        text: '',
        choices: ['', '', '', ''],
        correctAnswer: ''
      });
      setShowAddDialog(false);
    }
  };

  const handleExportQuestions = () => {
    const dataStr = JSON.stringify(questions, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `questions_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportQuestions = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedQuestions = JSON.parse(e.target?.result as string);
          if (Array.isArray(importedQuestions)) {
            const validQuestions = importedQuestions
              .filter(q => q.text && q.choices && q.correctAnswer)
              .map(q => ({
                ...q,
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                createdAt: new Date().toISOString(),
                source: 'json' as const
              }));
            onImportQuestions(validQuestions);
            alert(`تم استيراد ${validQuestions.length} سؤال بنجاح! ✅`);
          }
        } catch (error) {
          alert('خطأ في قراءة الملف! تأكد من صحة تنسيق JSON 🚫');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold text-neon mb-4 animate-glow-pulse">
          ⚙️ لوحة تحكم الأدمن
        </h1>
        <p className="text-muted-foreground">
          إدارة الأسئلة والأصوات ولوحة الشرف
        </p>
      </motion.div>

      <Tabs defaultValue="questions" className="space-y-6">
        <TabsList className="glass border-glass-border p-1 grid grid-cols-5 w-full max-w-3xl mx-auto">
          <TabsTrigger value="questions" className="text-foreground data-[state=active]:bg-primary/20">
            📝 إدارة الأسئلة
          </TabsTrigger>
          <TabsTrigger value="sounds" className="text-foreground data-[state=active]:bg-primary/20">
            🔊 إدارة الأصوات
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="text-foreground data-[state=active]:bg-primary/20">
            🏆 لوحة الشرف
          </TabsTrigger>
          <TabsTrigger value="ai" className="text-foreground data-[state=active]:bg-primary/20">
            🤖 الذكاء الاصطناعي
          </TabsTrigger>
          <TabsTrigger value="developer" className="text-foreground data-[state=active]:bg-primary/20">
            👨‍💻 خيارات المطور
          </TabsTrigger>
        </TabsList>

        {/* Questions Management */}
        <TabsContent value="questions" className="space-y-6">
          <div className="flex flex-wrap gap-4 justify-between items-center">
            <h2 className="text-2xl font-bold text-foreground">إدارة الأسئلة ({questions.length})</h2>
            
            <div className="flex gap-4">
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button className="btn-neon">
                    <Plus className="w-4 h-4 mr-2" />
                    إضافة سؤال يدوي
                  </Button>
                </DialogTrigger>
                <DialogContent className="glass border-glass-border max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-neon">إضافة سؤال جديد</DialogTitle>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="questionText">نص السؤال</Label>
                      <Input
                        id="questionText"
                        value={newQuestion.text}
                        onChange={(e) => setNewQuestion({...newQuestion, text: e.target.value})}
                        className="input-space mt-2"
                        placeholder="اكتب السؤال هنا..."
                      />
                    </div>

                    <div>
                      <Label>الخيارات</Label>
                      {newQuestion.choices.map((choice, index) => (
                        <div key={index} className="flex gap-2 mt-2">
                          <Input
                            value={choice}
                            onChange={(e) => handleUpdateChoice(index, e.target.value)}
                            className="input-space"
                            placeholder={`الخيار ${index + 1}`}
                          />
                          {newQuestion.choices.length > 2 && (
                            <Button
                              type="button"
                              onClick={() => handleRemoveChoice(index)}
                              className="btn-destructive px-3"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      
                      {newQuestion.choices.length < 6 && (
                        <Button
                          type="button"
                          onClick={handleAddChoice}
                          className="btn-space mt-2"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          إضافة خيار
                        </Button>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="correctAnswer">الإجابة الصحيحة</Label>
                      <select
                        id="correctAnswer"
                        value={newQuestion.correctAnswer}
                        onChange={(e) => setNewQuestion({...newQuestion, correctAnswer: e.target.value})}
                        className="input-space mt-2 w-full"
                      >
                        <option value="">اختر الإجابة الصحيحة</option>
                        {newQuestion.choices.filter(choice => choice.trim()).map((choice, index) => (
                          <option key={index} value={choice}>{choice}</option>
                        ))}
                      </select>
                    </div>

                    <Button
                      onClick={handleSubmitQuestion}
                      className="btn-success w-full"
                      disabled={!newQuestion.text || !newQuestion.correctAnswer || newQuestion.choices.some(c => !c.trim())}
                    >
                      ✅ حفظ السؤال
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Button onClick={handleExportQuestions} className="btn-space">
                <Download className="w-4 h-4 mr-2" />
                تحميل JSON
              </Button>

              <div className="relative">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportQuestions}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  id="import-questions"
                />
                <Button asChild className="btn-space">
                  <label htmlFor="import-questions" className="cursor-pointer">
                    <Upload className="w-4 h-4 mr-2" />
                    رفع JSON
                  </label>
                </Button>
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            {questions.map((question) => (
              <motion.div
                key={question.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                layout
              >
                <Card className="card-space p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-2">
                        {question.text}
                      </h3>
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        {question.choices.map((choice, index) => (
                          <div
                            key={index}
                            className={`p-2 rounded text-sm ${
                              choice === question.correctAnswer
                                ? 'bg-success/20 text-success border border-success/30'
                                : 'bg-muted/20 text-muted-foreground'
                            }`}
                          >
                            {choice}
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span>المصدر: {question.source}</span>
                        <span>تاريخ الإضافة: {new Date(question.createdAt).toLocaleDateString('ar')}</span>
                      </div>
                    </div>
                    <Button
                      onClick={() => onDeleteQuestion(question.id)}
                      className="btn-destructive mr-4"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Sounds Management */}
        <TabsContent value="sounds" className="space-y-6">
          <Card className="card-space p-8 text-center">
            <div className="text-6xl mb-4">🔊</div>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              إدارة الأصوات
            </h2>
            <p className="text-muted-foreground mb-6">
              قريباً: إضافة وإدارة الأصوات للإجابات الصحيحة والخاطئة
            </p>
            <div className="space-y-4 max-w-md mx-auto">
              <Button className="btn-space w-full" disabled>
                🎵 رفع أصوات الإجابات الصحيحة
              </Button>
              <Button className="btn-space w-full" disabled>
                🎵 رفع أصوات الإجابات الخاطئة
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* Leaderboard Management */}
        <TabsContent value="leaderboard" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-foreground">
              إدارة لوحة الشرف ({users.length} مستخدم)
            </h2>
            <Button 
              onClick={onResetLeaderboard}
              className="btn-destructive"
              disabled={users.length === 0}
            >
              🗑️ إعادة تعيين لوحة الشرف
            </Button>
          </div>

          <div className="grid gap-4">
            {users.length === 0 ? (
              <Card className="card-space p-8 text-center">
                <div className="text-6xl mb-4">📊</div>
                <p className="text-muted-foreground">
                  لا يوجد مستخدمون مسجلون حتى الآن
                </p>
              </Card>
            ) : (
              users.map((user) => (
                <Card key={user.id} className="card-space p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {user.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        العمر: {user.age} - {user.gender === 'male' ? 'ذكر' : 'أنثى'}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg text-neon">
                        {user.score} نقطة
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString('ar')}
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* AI Management */}
        <TabsContent value="ai" className="space-y-6">
          <Card className="card-space p-8 text-center">
            <div className="text-6xl mb-4">🤖</div>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              الذكاء الاصطناعي
            </h2>
            <p className="text-muted-foreground mb-6">
              قريباً: رفع ملفات PDF/DOCX/MP3 لتوليد أسئلة تلقائياً باستخدام الذكاء الاصطناعي
            </p>
            <div className="space-y-4 max-w-md mx-auto">
              <Button className="btn-space w-full" disabled>
                📄 رفع ملف PDF
              </Button>
              <Button className="btn-space w-full" disabled>
                📝 رفع ملف Word
              </Button>
              <Button className="btn-space w-full" disabled>
                🎵 رفع ملف صوتي
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* Developer Options */}
        <TabsContent value="developer" className="space-y-6">
          <Card className="card-neon p-8">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4 animate-bounce">👨‍💻</div>
              <h2 className="text-3xl font-bold text-neon mb-2">
                خيارات المطور
              </h2>
              <div className="space-y-2 text-lg">
                <p className="text-foreground font-semibold">
                  👤 المطور: <span className="text-gold-neon">محمد صلاح كمال صبحي</span>
                </p>
                <p className="text-muted-foreground">
                  🎂 العمر: <span className="text-neon">17 سنة</span>
                </p>
                <p className="text-muted-foreground">
                  🔐 تخصص: <span className="text-primary">Cybersecurity & CTF</span>
                </p>
                <p className="text-muted-foreground">
                  📧 البريد: <span className="text-neon-accent">mohamadsalahkamal683@gmail.com</span>
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="card-space p-6">
                <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  📊 إحصائيات التطبيق
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">إجمالي الأسئلة:</span>
                    <span className="font-bold text-neon">{questions.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">المستخدمون المسجلون:</span>
                    <span className="font-bold text-gold-neon">{users.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">أعلى نتيجة:</span>
                    <span className="font-bold text-primary">
                      {users.length > 0 ? Math.max(...users.map(u => u.score)) : 0} نقطة
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">متوسط النتائج:</span>
                    <span className="font-bold text-neon-accent">
                      {users.length > 0 ? Math.round(users.reduce((sum, u) => sum + u.score, 0) / users.length) : 0} نقطة
                    </span>
                  </div>
                </div>
              </Card>

              <Card className="card-space p-6">
                <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  🛠️ أدوات المطور
                </h3>
                <div className="space-y-3">
                  <Button 
                    onClick={() => {
                      const stats = {
                        totalQuestions: questions.length,
                        totalUsers: users.length,
                        highestScore: users.length > 0 ? Math.max(...users.map(u => u.score)) : 0,
                        averageScore: users.length > 0 ? Math.round(users.reduce((sum, u) => sum + u.score, 0) / users.length) : 0,
                        userData: users,
                        questionData: questions
                      };
                      console.log('📊 App Statistics:', stats);
                      navigator.clipboard.writeText(JSON.stringify(stats, null, 2));
                      alert('تم نسخ الإحصائيات إلى الحافظة! 📋');
                    }}
                    className="btn-space w-full justify-start"
                  >
                    📋 نسخ إحصائيات التطبيق
                  </Button>
                  
                  <Button 
                    onClick={() => {
                      const backup = {
                        questions,
                        users,
                        timestamp: new Date().toISOString(),
                        appVersion: '1.0.0'
                      };
                      const dataStr = JSON.stringify(backup, null, 2);
                      const dataBlob = new Blob([dataStr], { type: 'application/json' });
                      const url = URL.createObjectURL(dataBlob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = `app_backup_${new Date().toISOString().split('T')[0]}.json`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      URL.revokeObjectURL(url);
                    }}
                    className="btn-neon w-full justify-start"
                  >
                    💾 تحميل نسخة احتياطية كاملة
                  </Button>

                  <Button 
                    onClick={() => {
                      localStorage.clear();
                      alert('تم مسح جميع البيانات المحلية! سيتم إعادة تحميل الصفحة.');
                      window.location.reload();
                    }}
                    className="btn-destructive w-full justify-start"
                  >
                    🗑️ إعادة تعيين التطبيق كاملاً
                  </Button>
                </div>
              </Card>

              <Card className="card-space p-6 md:col-span-2">
                <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  🌟 مميزات التطبيق الحالية
                </h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-green-400">✅</span>
                      <span className="text-foreground">أسئلة عشوائية بدون تكرار</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-green-400">✅</span>
                      <span className="text-foreground">إدارة الأسئلة يدوياً</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-green-400">✅</span>
                      <span className="text-foreground">استيراد/تصدير JSON</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-green-400">✅</span>
                      <span className="text-foreground">لوحة الشرف التفاعلية</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-green-400">✅</span>
                      <span className="text-foreground">تسجيل المستخدمين</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-green-400">✅</span>
                      <span className="text-foreground">تصميم مستقبلي متجاوب</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-green-400">✅</span>
                      <span className="text-foreground">حفظ البيانات محلياً</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-green-400">✅</span>
                      <span className="text-foreground">نظام النقاط والإنجازات</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanel;