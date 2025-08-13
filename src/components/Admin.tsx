import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Lock, User, CheckCircle, XCircle, LogOut, Eye, EyeOff, FileText, Users, Trophy } from 'lucide-react';
import { toast } from 'sonner';
import { getQuizResults, getStudentResults } from '@/lib/supabase';
import { useQuiz } from '@/contexts/QuizContext';

// List of students in class 12.C
const CLASS_STUDENTS = [
  { name: 'AISYAH ALISSYA RAHMAH', hasCompleted: false },
  { name: 'ALLISA AULIA ZHAFIRAH', hasCompleted: false },
  { name: 'ANRI RACHMAN', hasCompleted: false },
  { name: 'ATTHALAH QINTHARA AHMAD', hasCompleted: false },
  { name: 'AZKA FACHRI NASHIRULHAQ HERMAWAN', hasCompleted: false },
  { name: 'BAGUS SETYOKO', hasCompleted: false },
  { name: 'BARIKA ZAHRA JAYUSMAN', hasCompleted: false },
  { name: 'CAHAYA MUTIARA KASIH', hasCompleted: false },
  { name: 'DAFI RAIHAN BAYU RAMADHAN', hasCompleted: false },
  { name: 'DEVHARA GUSTAF RIZKIA', hasCompleted: false },
  { name: 'FAREL ALFARIZI', hasCompleted: false },
  { name: 'HANAFI ARDIANSYAH', hasCompleted: false },
  { name: 'HIKAR ADZWA NAUFAL BHINEKA', hasCompleted: false },
  { name: 'KAYFAL MUTTAQIN', hasCompleted: false },
  { name: 'KEYLA PUTRI AZZAHRA', hasCompleted: false },
  { name: 'KHAIQAL ALFATHAN AJIJI', hasCompleted: false, isAdmin: true, isExcluded: true },
  { name: 'KIRANA MAHARDIKA', hasCompleted: false },
  { name: 'MAGNA MEYDA AHMAD', hasCompleted: false },
  { name: 'MAITSAA\' SHAFWAH RAMADHANI', hasCompleted: false },
  { name: 'MANULLANG, LUSIANA PUTRI', hasCompleted: false },
  { name: 'MOCHAMAD DZAKY ASSIDQI', hasCompleted: false },
  { name: 'MUHAMMAD DHAFIN FIRDAUS RAHMAT SUBEKTI', hasCompleted: false, isAdmin: true, isExcluded: true },
  { name: 'MUHAMMAD DHAFIN NUGRAHA', hasCompleted: false },
  { name: 'MUHAMMAD HAPIDH DAVYDENKO RUSMANA', hasCompleted: false, isAdmin: true, isExcluded: true },
  { name: 'MUHAMMAD IBRAHIM RAYNALDO NUGRAHA', hasCompleted: false },
  { name: 'MUHAMMAD MALIK SHIRAZY', hasCompleted: false },
  { name: 'MUHAMMAD RASIKH NURRAHIM', hasCompleted: false },
  { name: 'NUURIL HUDAA AL-FURQAAN', hasCompleted: false },
  { name: 'RADEN MUHAMMAD RAFI SAFWAN', hasCompleted: false, isAdmin: true, isExcluded: true },
  { name: 'RAYHAN MUAMMAR KHADAFI', hasCompleted: false, isAdmin: true, isExcluded: true },
  { name: 'RENGGA ARYA PERMANA', hasCompleted: false },
  { name: 'RIZKI CHANDRA WIJAYA PUTRA', hasCompleted: false },
  { name: 'SHIMA RATU DONITA', hasCompleted: false },
  { name: 'ZULAYKA SAFFANAH FARDILLA', hasCompleted: false },
  { name: 'NADIYAH FALISHA ANDRIYANI SANTOSA', hasCompleted: false },
  { name: 'NAILA PATHONI', hasCompleted: false },
  { name: 'ALDO', hasCompleted: false, isAdmin: true, isExcluded: true }
];

// Admin password
const ADMIN_PASSWORD = 'rapihapidhduaopat';

const Admin: React.FC = () => {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [quizResults, setQuizResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAnswerKey, setShowAnswerKey] = useState(false);
  const { state, dispatch } = useQuiz();

  useEffect(() => {
    if (isAuthenticated) {
      fetchQuizResults();
      
      // Load questions if they're not already loaded
      if (state.questions.length === 0) {
        loadQuestions();
      }
    }
  }, [isAuthenticated, state.questions.length]);
  
  // Refresh quiz results every 30 seconds to get real-time updates
  useEffect(() => {
    if (isAuthenticated) {
      const intervalId = setInterval(() => {
        fetchQuizResults();
      }, 30000); // 30 seconds
      
      return () => clearInterval(intervalId);
    }
  }, [isAuthenticated]);

  const fetchQuizResults = async () => {
    setLoading(true);
    try {
      const { data, error } = await getQuizResults();
      if (error) throw error;
      
      // Process quiz results to handle name matching
      if (data && data.length > 0) {
        // Create a map to store processed results with normalized names
        const processedResults = [];
        const completedStudentsMap = new Map();
        
        // First pass: Try to match exact names and collect unmatched names
        const unmatchedResults = [];
        
        data.forEach(result => {
          const resultName = result.userName.trim().toUpperCase();
          
          // Check if this is a direct match with any student in CLASS_STUDENTS
          const exactMatch = CLASS_STUDENTS.find(
            student => student.name.toUpperCase() === resultName
          );
          
          if (exactMatch) {
            // Direct match found, add to processed results
            processedResults.push(result);
            completedStudentsMap.set(exactMatch.name.toUpperCase(), true);
          } else {
            // No direct match, add to unmatched for fuzzy matching
            unmatchedResults.push(result);
          }
        });
        
        // Second pass: Try fuzzy matching for unmatched names
        unmatchedResults.forEach(result => {
          const resultName = result.userName.trim().toUpperCase();
          
          // Find the best match using similarity
          let bestMatch = null;
          let highestSimilarity = 0;
          
          CLASS_STUDENTS.forEach(student => {
            if (!student.isExcluded) {
              const studentName = student.name.toUpperCase();
              
              // Skip if already matched
              if (completedStudentsMap.has(studentName)) {
                return;
              }
              
              // Calculate similarity (simple version - check if one contains the other)
              // This could be improved with more sophisticated algorithms
              let similarity = 0;
              
              // Check if student name contains result name or vice versa
              if (studentName.includes(resultName) || resultName.includes(studentName)) {
                similarity = 0.8; // High similarity if one contains the other
              } else {
                // Check for partial matches (first name, last name)
                const studentParts = studentName.split(/\s+/);
                const resultParts = resultName.split(/\s+/);
                
                // Check if any part matches
                for (const studentPart of studentParts) {
                  for (const resultPart of resultParts) {
                    if (studentPart === resultPart && studentPart.length > 2) {
                      similarity = 0.6; // Medium similarity for matching parts
                      break;
                    }
                  }
                  if (similarity > 0) break;
                }
              }
              
              // Update best match if this is better
              if (similarity > highestSimilarity) {
                highestSimilarity = similarity;
                bestMatch = student;
              }
            }
          });
          
          // If we found a good match, use it
          if (bestMatch && highestSimilarity >= 0.6) {
            // Add to processed results with matched student name
            const matchedResult = {
              ...result,
              originalName: result.userName,
              userName: bestMatch.name, // Replace with the correct student name
              matchConfidence: highestSimilarity
            };
            processedResults.push(matchedResult);
            completedStudentsMap.set(bestMatch.name.toUpperCase(), true);
            
            console.log(`Matched "${result.userName}" to student "${bestMatch.name}" with confidence ${highestSimilarity}`);
          } else {
            // No good match found, keep original
            processedResults.push(result);
          }
        });
        
        // Update the quiz results with processed data
        setQuizResults(processedResults);
        
        // Update the CLASS_STUDENTS array with completion status
        for (let i = 0; i < CLASS_STUDENTS.length; i++) {
          const student = CLASS_STUDENTS[i];
          if (completedStudentsMap.has(student.name.toUpperCase())) {
            student.hasCompleted = true;
          } else if (!student.isAdmin) {
            student.hasCompleted = false;
          }
        }
      } else {
        setQuizResults([]);
      }
      
      toast.success('Data siswa berhasil diperbarui dengan pencocokan nama');
    } catch (error) {
      console.error('Error fetching quiz results:', error);
      toast.error('Failed to load quiz results');
      setQuizResults([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Load questions from JSON file with enhanced explanations
  const loadQuestions = async () => {
    try {
      const response = await fetch('/data/questions.json');
      const data = await response.json();
      
      // Ensure all questions have detailed explanations
      const questionsWithExplanations = data.questions.map(question => {
        if (!question.explanation || question.explanation.trim() === '' || 
            question.explanation.includes('focuses on grammatical structures') ||
            question.explanation.includes('the error is in')) {
          // Add comprehensive explanation if missing or generic
          if (question.type === 'structure') {
            // Enhanced explanation for structure questions
            let explanation = `Penjelasan untuk soal struktur nomor ${question.id}: Jawaban yang benar adalah opsi ${String.fromCharCode(65 + question.correct)} (${question.options[question.correct].substring(3)})\n\n`;
            
            // Add specific explanation based on question ID
            switch(question.id) {
              case 1: // "_____ of classical ballet in the United States began around 1830."
                explanation += `Kalimat ini membutuhkan subjek yang merupakan frasa nominal. Opsi D "The teaching" adalah pilihan yang tepat karena memberikan subjek yang lengkap untuk kalimat. Opsi A "To teach" adalah infinitif yang tidak bisa berfungsi sebagai subjek dalam konteks ini. Opsi B "Is teaching" adalah bentuk present continuous yang tidak tepat sebagai subjek. Opsi C "It was taught" adalah klausa yang tidak tepat sebagai subjek.`;
                break;
              case 2: // "Mason bees are solitary bees, which means _____"
                explanation += `Kalimat ini menggunakan "which means" yang harus diikuti oleh klausa noun (noun clause). Opsi C "that they do not live" adalah pilihan yang tepat karena membentuk noun clause yang lengkap. Opsi A "do not live" tidak membentuk klausa lengkap. Opsi B "when they do not live" membentuk klausa adverbial, bukan noun clause. Opsi D "that do not live" adalah klausa adjektiva, bukan noun clause.`;
                break;
              case 3:
                explanation += `Kalimat ini memerlukan bentuk kata kerja yang tepat sesuai dengan konteks waktu. Jawaban yang benar memberikan bentuk kata kerja yang sesuai dengan tenses yang diperlukan dalam kalimat. Perhatikan apakah kalimat memerlukan bentuk present, past, future, atau perfect tense.`;
                break;
              case 4:
                explanation += `Kalimat ini memerlukan penggunaan preposisi yang tepat. Preposisi yang benar harus sesuai dengan idiom bahasa Inggris dan konteks kalimat. Perhatikan hubungan antara kata kerja, kata benda, dan elemen lain dalam kalimat untuk menentukan preposisi yang tepat.`;
                break;
              case 5:
                explanation += `Kalimat ini memerlukan penggunaan artikel (a, an, the) yang tepat. Artikel yang benar harus sesuai dengan kata benda yang mengikutinya dan konteks kalimat. Perhatikan apakah kata benda tersebut spesifik (the) atau umum (a/an).`;
                break;
              default:
                explanation += `Opsi ini merupakan struktur gramatikal yang tepat untuk melengkapi kalimat sesuai dengan kaidah tata bahasa bahasa Inggris. Struktur kalimat yang benar harus memperhatikan subjek, predikat, dan komplemen yang sesuai. Dalam soal ini, struktur yang dipilih memberikan kejelasan makna dan kebenaran gramatikal.\n\nPerhatikan konteks kalimat secara keseluruhan untuk memahami mengapa struktur ini yang paling tepat. Analisis fungsi gramatikal dari setiap bagian kalimat akan membantu menentukan struktur yang paling sesuai.`;
            }
            
            // Add general tips for structure questions
            explanation += `\n\nTips untuk soal Structure:\n1. Perhatikan subjek dan kata kerja (subject-verb agreement)\n2. Perhatikan tenses (waktu) yang digunakan dalam kalimat\n3. Perhatikan kata penghubung (conjunctions) dan hubungan antar klausa\n4. Perhatikan struktur paralel dalam kalimat`;
            
            return {
              ...question,
              explanation: explanation
            };
          } else { // Written Expression
            // Enhanced explanation for written expression questions
            let explanation = `Penjelasan untuk soal written expression nomor ${question.id}: Kesalahan terdapat pada bagian yang ditandai dengan opsi ${String.fromCharCode(65 + question.correct)} (${question.options[question.correct].substring(3)})\n\n`;
            
            // Add specific explanation based on question ID
            switch(question.id) {
              case 16: // "Soybeans contain a rich concentrations of phytoestrogens"
                explanation += `Kesalahan pada kata "concentrations" yang seharusnya berbentuk tunggal "concentration" karena didahului oleh artikel "a" yang menunjukkan bentuk tunggal. Artikel "a" hanya dapat diikuti oleh kata benda tunggal, bukan jamak. Bentuk yang benar adalah "a rich concentration".`;
                break;
              case 17: // "The original Welland Canal, opened which in 1829"
                explanation += `Kesalahan pada frasa "opened which" yang tidak sesuai dengan struktur klausa relatif dalam bahasa Inggris. Urutan yang benar adalah "which opened" karena "which" adalah kata ganti relatif yang harus diletakkan sebelum kata kerja dalam klausa relatif. Bentuk yang benar adalah "which opened in 1829".`;
                break;
              case 18:
                explanation += `Kesalahan pada penggunaan kata sifat (adjective) atau kata keterangan (adverb). Perhatikan apakah kata tersebut seharusnya menerangkan kata benda (menggunakan adjective) atau kata kerja (menggunakan adverb). Penggunaan yang tepat harus sesuai dengan fungsi gramatikal dalam kalimat.`;
                break;
              case 19:
                explanation += `Kesalahan pada penggunaan preposisi. Preposisi yang tepat harus sesuai dengan idiom bahasa Inggris dan konteks kalimat. Perhatikan hubungan antara kata kerja, kata benda, dan elemen lain dalam kalimat untuk menentukan preposisi yang benar.`;
                break;
              case 20:
                explanation += `Kesalahan pada penggunaan artikel (a, an, the). Perhatikan apakah kata benda yang diikuti memerlukan artikel dan artikel apa yang tepat. Artikel harus sesuai dengan kata benda yang mengikutinya dan konteks kalimat.`;
                break;
              default:
                explanation += `Bagian ini perlu diperbaiki sesuai dengan kaidah tata bahasa bahasa Inggris yang benar. Kesalahan gramatikal dapat berupa ketidaksesuaian subjek-predikat, penggunaan kata depan yang tidak tepat, kesalahan bentuk kata (tunggal/jamak), atau struktur kalimat yang tidak sesuai dengan aturan sintaksis bahasa Inggris.\n\nPerhatikan konteks kalimat dan aturan gramatikal yang berlaku untuk memahami kesalahan dan perbaikan yang diperlukan. Analisis fungsi gramatikal dari setiap bagian kalimat akan membantu mengidentifikasi kesalahan dengan tepat.`;
            }
            
            // Add general tips for written expression questions
            explanation += `\n\nTips untuk soal Written Expression:\n1. Cari kesalahan dalam subject-verb agreement (kesesuaian subjek-kata kerja)\n2. Perhatikan penggunaan tenses yang konsisten\n3. Perhatikan penggunaan kata depan (prepositions) yang tepat\n4. Perhatikan bentuk kata benda (tunggal/jamak) dan artikel yang sesuai\n5. Perhatikan struktur paralel dalam kalimat`;
            
            return {
              ...question,
              explanation: explanation
            };
          }
        }
        return question;
      });
      
      dispatch({ type: 'SET_QUESTIONS', payload: questionsWithExplanations });
      toast.success('Questions loaded successfully with enhanced explanations');
    } catch (error) {
      console.error('Error loading questions:', error);
      toast.error('Failed to load questions');
    }
  };

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      toast.success('Admin login successful');
    } else {
      toast.error('Invalid password');
      // Jangan tampilkan petunjuk password yang mengungkapkan password sebenarnya
      toast.info('Hint: Hubungi administrator untuk mendapatkan password');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword('');
    setShowAnswerKey(false);
    toast.info('Logged out successfully');
    // Return to main page
    dispatch({ type: 'SET_SHOW_ADMIN', payload: false });
  };

  // Function removed as we want to show real data only

  // Format time from seconds to MM:SS
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-0 bg-white/10 backdrop-blur-md text-white">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-white">Admin Access</CardTitle>
            <CardDescription className="text-gray-300">
              Enter your password to access the admin dashboard
            </CardDescription>
            <div className="mt-4 p-3 bg-indigo-900/50 rounded-md border border-indigo-500/30">
              <p className="text-sm text-gray-200">Admin Access Only</p>
              <p className="text-xs text-gray-400 mt-1">Hubungi administrator untuk mendapatkan password</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                className="bg-white/20 border-0 text-white placeholder:text-gray-400"
              />
            </div>
            <Button 
              onClick={handleLogin} 
              className="w-full bg-indigo-600 hover:bg-indigo-700"
            >
              Login
            </Button>
            <div className="text-center mt-4 text-sm text-gray-400">
              <p>Hubungi administrator untuk mendapatkan password</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-4">
      <div className="w-full max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">TOEFL ITP Admin Dashboard</h1>
            <p className="text-gray-400">Manage student results and view answer keys</p>
          </div>
          <Button variant="outline" onClick={handleLogout} className="text-white border-white/20 hover:bg-white/10">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="students" className="w-full">
          <TabsList className="bg-white/10 border-b border-white/20 w-full justify-start">
            <TabsTrigger value="students" className="data-[state=active]:bg-white/20">
              <Users className="w-4 h-4 mr-2" />
              Students
            </TabsTrigger>
            <TabsTrigger value="results" className="data-[state=active]:bg-white/20">
              <Trophy className="w-4 h-4 mr-2" />
              Results
            </TabsTrigger>
            <TabsTrigger value="answers" className="data-[state=active]:bg-white/20">
              <FileText className="w-4 h-4 mr-2" />
              Answer Keys
            </TabsTrigger>
          </TabsList>

          {/* Students Tab */}
          <TabsContent value="students" className="space-y-4">
            <Card className="bg-white/10 border-0">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Student Status
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Track which students have completed the quiz
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] pr-4">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/20 hover:bg-white/5">
                        <TableHead className="text-gray-300">Name</TableHead>
                        <TableHead className="text-gray-300">Status</TableHead>
                        <TableHead className="text-gray-300">Role</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {CLASS_STUDENTS.map((student, index) => (
                        <TableRow key={index} className="border-white/20 hover:bg-white/5">
                          <TableCell className="font-medium">{student.name}</TableCell>
                          <TableCell>
                            {student.isExcluded ? (
                              <Badge variant="outline" className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                                Excluded
                              </Badge>
                            ) : student.hasCompleted ? (
                              <Badge variant="outline" className="bg-green-500/20 text-green-300 border-green-500/30">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Completed
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-red-500/20 text-red-300 border-red-500/30">
                                <XCircle className="w-3 h-3 mr-1" />
                                Pending
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {student.isAdmin ? (
                              <Badge variant="outline" className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30">
                                Admin
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                                Student
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Results Tab */}
          <TabsContent value="results" className="space-y-4">
            <Card className="bg-white/10 border-0">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="w-5 h-5 mr-2" />
                  Quiz Results
                </CardTitle>
                <CardDescription className="text-gray-400">
                  View detailed results for all students
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] pr-4">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/20 hover:bg-white/5">
                        <TableHead className="text-gray-300">Rank</TableHead>
                        <TableHead className="text-gray-300">Name</TableHead>
                        <TableHead className="text-gray-300">Original Name</TableHead>
                        <TableHead className="text-gray-300">Score</TableHead>
                        <TableHead className="text-gray-300">Structure</TableHead>
                        <TableHead className="text-gray-300">Written Expr.</TableHead>
                        <TableHead className="text-gray-300">Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            <div className="flex flex-col items-center">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-2"></div>
                              <span>Loading results...</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : quizResults.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            No results found
                          </TableCell>
                        </TableRow>
                      ) : (
                        quizResults
                          .sort((a, b) => b.score - a.score || a.timeElapsed - b.timeElapsed)
                          .map((result, index) => (
                            <TableRow key={index} className="border-white/20 hover:bg-white/5">
                              <TableCell className="font-medium">{index + 1}</TableCell>
                              <TableCell>{result.userName}</TableCell>
                              <TableCell>
                                {result.originalName && result.originalName !== result.userName ? (
                                  <span className="text-gray-400 text-sm">
                                    {result.originalName}
                                    {result.matchConfidence && (
                                      <span className="ml-1 text-xs bg-yellow-500/20 text-yellow-300 px-1 rounded">
                                        {(result.matchConfidence * 100).toFixed(0)}%
                                      </span>
                                    )}
                                  </span>
                                ) : null}
                              </TableCell>
                              <TableCell>
                                <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30">
                                  {result.score}/{result.totalQuestions}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                                  {result.structureScore}/15
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                                  {result.writtenExpressionScore}/15
                                </Badge>
                              </TableCell>
                              <TableCell>{formatTime(result.timeElapsed)}</TableCell>
                            </TableRow>
                          ))
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Answer Keys Tab */}
          <TabsContent value="answers" className="space-y-4">
            <Card className="bg-white/10 border-0">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Answer Keys & Explanations
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAnswerKey(!showAnswerKey)}
                    className="text-white border-white/20 hover:bg-white/10"
                  >
                    {showAnswerKey ? (
                      <>
                        <EyeOff className="w-4 h-4 mr-2" />
                        Hide Answers
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4 mr-2" />
                        Show Answers
                      </>
                    )}
                  </Button>
                </div>
                <CardDescription className="text-gray-400">
                  View all questions with correct answers and explanations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] pr-4">
                  <div className="space-y-6">
                    {state.questions.map((question, index) => (
                      <div key={index} className="p-4 rounded-lg bg-white/5 border border-white/10">
                        <div className="flex justify-between items-start mb-2">
                          <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30">
                            Question {index + 1} - {question.type === 'structure' ? 'Structure' : 'Written Expression'}
                          </Badge>
                        </div>
                        <p className="text-lg mb-4">{question.question}</p>
                        <div className="grid gap-2 mb-4">
                          {question.options.map((option, optIndex) => (
                            <div 
                              key={optIndex} 
                              className={`p-3 rounded-md flex items-center ${showAnswerKey && optIndex === question.correct ? 'bg-green-500/20 border border-green-500/30' : 'bg-white/5 border border-white/10'}`}
                            >
                              {option}
                              {showAnswerKey && optIndex === question.correct && (
                                <CheckCircle className="w-4 h-4 text-green-400 ml-2" />
                              )}
                            </div>
                          ))}
                        </div>
                        {showAnswerKey && (
                          <div className="mt-4 p-3 rounded-md bg-blue-500/10 border border-blue-500/20">
                            <p className="font-medium text-blue-300 mb-1">Explanation:</p>
                            <p className="text-gray-300">{question.explanation}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;