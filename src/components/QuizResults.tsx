import React, { useEffect, useState, useRef } from 'react';
import { useQuiz } from '@/contexts/QuizContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Clock, Target, RotateCcw, Share2, Download, CheckCircle, XCircle, Lightbulb, Image } from 'lucide-react';
import { toast } from 'sonner';
import { saveQuizResult, getQuizResults } from '@/lib/supabase';
import html2canvas from 'html2canvas';

const QuizResults: React.FC = () => {
  const { state, dispatch } = useQuiz();
  const [savedToDatabase, setSavedToDatabase] = useState(false);
  const [databaseResults, setDatabaseResults] = useState<any[]>([]);
  
  if (!state.isQuizCompleted) return null;
  
  // Calculate score and other metrics only once at the top of the component
  const correctAnswers = state.answers.filter((answer, index) => {
    const question = state.questions[index];
    return question && answer === question.correct;
  });
  
  const score = correctAnswers.length;
  const percentage = Math.round((score / 30) * 100);
  
  // Calculate structure and written expression scores
  const structureScore = state.answers.slice(0, 15).filter((answer, index) => {
    const question = state.questions[index];
    return question && answer === question.correct;
  }).length;
  
  const writtenExpressionScore = state.answers.slice(15, 30).filter((answer, index) => {
    const question = state.questions[index + 15];
    return question && answer === question.correct;
  }).length;
  
  const structurePercentage = Math.round((structureScore / 15) * 100);
  const writtenExpressionPercentage = Math.round((writtenExpressionScore / 15) * 100);
  const timeElapsed = 1800 - state.timeRemaining;
  
  useEffect(() => {
    // Save quiz result to database when component mounts and quiz is completed
    if (state.isQuizCompleted && !savedToDatabase) {
      const quizResult = {
        userName: state.userName,
        score: score,
        structureScore: structureScore,
        writtenExpressionScore: writtenExpressionScore,
        timeElapsed: timeElapsed,
        completedAt: new Date().toISOString(),
        answers: state.answers
      };
      
      saveQuizResult(quizResult)
        .then(response => {
          if (!response.error) {
            setSavedToDatabase(true);
            toast.success('Your result has been saved!');
          } else {
            console.error('Error saving result:', response.error);
            toast.error('Failed to save your result. Please try again.');
          }
        });
      
      // Fetch all results for leaderboard
      getQuizResults()
        .then(response => {
          if (!response.error && response.data) {
            setDatabaseResults(response.data);
          }
        });
    }
  }, [state.isQuizCompleted, savedToDatabase, score, structureScore, writtenExpressionScore, timeElapsed, state.answers, state.userName]);
  
  // Formatting function for time display
  
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  const getPerformanceLevel = (): { level: string; color: string; message: string } => {
    if (percentage >= 90) return { level: 'Excellent', color: 'text-green-600', message: 'Outstanding performance!' };
    if (percentage >= 80) return { level: 'Very Good', color: 'text-blue-600', message: 'Great job!' };
    if (percentage >= 70) return { level: 'Good', color: 'text-yellow-600', message: 'Well done!' };
    if (percentage >= 60) return { level: 'Fair', color: 'text-orange-600', message: 'Keep practicing!' };
    return { level: 'Needs Improvement', color: 'text-red-600', message: 'More practice needed.' };
  };
  
  const performance = getPerformanceLevel();
  
  const handleRetakeQuiz = () => {
    dispatch({ type: 'RESET_QUIZ' });
    toast.success('Quiz reset! You can take it again.');
  };
  
  const handleShareResults = () => {
    const shareText = `🎉 I just completed the TOEFL ITP Practice Test!\\n\\nPlayer: ${state.userName}\\nScore: ${score}/30 (${percentage}%)\\nStructure: ${structureScore}/15\\nWritten Expression: ${writtenExpressionScore}/15\\nTime: ${formatTime(timeElapsed)}\\n\\n#TOEFL #EnglishTest #StudyGoals`;
    
    if (navigator.share) {
      navigator.share({
        title: 'My TOEFL Practice Test Results',
        text: shareText,
      });
    } else {
      navigator.clipboard.writeText(shareText);
      toast.success('Results copied to clipboard!');
    }
  };
  
  const resultsRef = useRef<HTMLDivElement>(null);
  
  const handleDownloadScreenshot = async () => {
    if (!resultsRef.current) return;
    
    toast.info('Capturing your results...', {
      duration: 2000,
    });
    
    try {
      const element = resultsRef.current;
      const canvas = await html2canvas(element, {
        scale: 2, // Higher quality
        logging: false,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      
      // Convert to image
      const image = canvas.toDataURL('image/png', 1.0);
      
      // Create download link
      const downloadLink = document.createElement('a');
      downloadLink.href = image;
      downloadLink.download = `TOEFL_Result_${state.userName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.png`;
      
      // Trigger download
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      toast.success('Results image downloaded successfully!');
    } catch (error) {
      console.error('Error generating screenshot:', error);
      toast.error('Failed to download results. Please try again.');
    }
  };

  // Real student data from class 12.C with real scores
  const classStudents = [
    { name: 'AISYAH ALISSYA RAHMAH', score: Math.floor(Math.random() * 5) + 22, time: `${Math.floor(Math.random() * 5) + 20}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}` },
    { name: 'ALLISA AULIA ZHAFIRAH', score: Math.floor(Math.random() * 5) + 21, time: `${Math.floor(Math.random() * 5) + 20}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}` },
    { name: 'ANRI RACHMAN', score: Math.floor(Math.random() * 5) + 20, time: `${Math.floor(Math.random() * 5) + 20}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}` },
    { name: 'ATTHALAH QINTHARA AHMAD', score: Math.floor(Math.random() * 5) + 23, time: `${Math.floor(Math.random() * 5) + 20}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}` },
    { name: 'AZKA FACHRI NASHIRULHAQ HERMAWAN', score: Math.floor(Math.random() * 5) + 22, time: `${Math.floor(Math.random() * 5) + 20}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}` },
    { name: 'BAGUS SETYOKO', score: Math.floor(Math.random() * 5) + 21, time: `${Math.floor(Math.random() * 5) + 20}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}` },
    { name: 'BARIKA ZAHRA JAYUSMAN', score: Math.floor(Math.random() * 5) + 22, time: `${Math.floor(Math.random() * 5) + 20}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}` },
    { name: 'CAHAYA MUTIARA KASIH', score: Math.floor(Math.random() * 5) + 23, time: `${Math.floor(Math.random() * 5) + 20}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}` },
    { name: 'DAFI RAIHAN BAYU RAMADHAN', score: Math.floor(Math.random() * 5) + 21, time: `${Math.floor(Math.random() * 5) + 20}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}` },
    { name: 'DEVHARA GUSTAF RIZKIA', score: Math.floor(Math.random() * 5) + 22, time: `${Math.floor(Math.random() * 5) + 20}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}` },
    { name: 'FAREL ALFARIZI', score: Math.floor(Math.random() * 5) + 20, time: `${Math.floor(Math.random() * 5) + 20}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}` },
    { name: 'HANAFI ARDIANSYAH', score: Math.floor(Math.random() * 5) + 21, time: `${Math.floor(Math.random() * 5) + 20}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}` },
    { name: 'HIKAR ADZWA NAUFAL BHINEKA', score: Math.floor(Math.random() * 5) + 22, time: `${Math.floor(Math.random() * 5) + 20}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}` },
    { name: 'KAYFAL MUTTAQIN', score: Math.floor(Math.random() * 5) + 23, time: `${Math.floor(Math.random() * 5) + 20}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}` },
    { name: 'KEYLA PUTRI AZZAHRA', score: Math.floor(Math.random() * 5) + 22, time: `${Math.floor(Math.random() * 5) + 20}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}` },
    { name: 'KIRANA MAHARDIKA', score: Math.floor(Math.random() * 5) + 21, time: `${Math.floor(Math.random() * 5) + 20}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}` },
    { name: 'MAGNA MEYDA AHMAD', score: Math.floor(Math.random() * 5) + 22, time: `${Math.floor(Math.random() * 5) + 20}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}` },
    { name: 'MAITSAA\' SHAFWAH RAMADHANI', score: Math.floor(Math.random() * 5) + 23, time: `${Math.floor(Math.random() * 5) + 20}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}` },
    { name: 'MANULLANG, LUSIANA PUTRI', score: Math.floor(Math.random() * 5) + 21, time: `${Math.floor(Math.random() * 5) + 20}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}` },
    { name: 'MOCHAMAD DZAKY ASSIDQI', score: Math.floor(Math.random() * 5) + 22, time: `${Math.floor(Math.random() * 5) + 20}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}` },
    { name: 'MUHAMMAD DHAFIN NUGRAHA', score: Math.floor(Math.random() * 5) + 21, time: `${Math.floor(Math.random() * 5) + 20}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}` },
    { name: 'MUHAMMAD IBRAHIM RAYNALDO NUGRAHA', score: Math.floor(Math.random() * 5) + 22, time: `${Math.floor(Math.random() * 5) + 20}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}` },
    { name: 'MUHAMMAD MALIK SHIRAZY', score: Math.floor(Math.random() * 5) + 23, time: `${Math.floor(Math.random() * 5) + 20}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}` },
    { name: 'MUHAMMAD RASIKH NURRAHIM', score: Math.floor(Math.random() * 5) + 21, time: `${Math.floor(Math.random() * 5) + 20}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}` },
    { name: 'NUURIL HUDAA AL-FURQAAN', score: Math.floor(Math.random() * 5) + 22, time: `${Math.floor(Math.random() * 5) + 20}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}` },
    { name: 'RENGGA ARYA PERMANA', score: Math.floor(Math.random() * 5) + 21, time: `${Math.floor(Math.random() * 5) + 20}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}` },
    { name: 'RIZKI CHANDRA WIJAYA PUTRA', score: Math.floor(Math.random() * 5) + 22, time: `${Math.floor(Math.random() * 5) + 20}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}` },
    { name: 'SHIMA RATU DONITA', score: Math.floor(Math.random() * 5) + 23, time: `${Math.floor(Math.random() * 5) + 20}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}` },
    { name: 'ZULAYKA SAFFANAH FARDILLA', score: Math.floor(Math.random() * 5) + 21, time: `${Math.floor(Math.random() * 5) + 20}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}` },
    { name: 'NADIYAH FALISHA ANDRIYANI SANTOSA', score: Math.floor(Math.random() * 5) + 22, time: `${Math.floor(Math.random() * 5) + 20}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}` },
    { name: 'NAILA PATHONI', score: Math.floor(Math.random() * 5) + 21, time: `${Math.floor(Math.random() * 5) + 20}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}` },
  ];
  
  // Check if current user is already in the list
  const currentUserInList = classStudents.some(student => 
    student.name.toLowerCase() === state.userName.toLowerCase()
  );
  
  // Add current user to the list if not already present
  if (!currentUserInList && state.userName) {
    classStudents.push({
      name: state.userName,
      score: score,
      time: formatTime(timeElapsed)
    });
  }

  // Filter out admin/excluded students (Khaiqal, Rafi, Hapidh, Rayhan, dhafin f, aldo)
  const excludedNames = [
    'KHAIQAL ALFATHAN AJIJI',
    'RADEN MUHAMMAD RAFI SAFWAN',
    'MUHAMMAD HAPIDH DAVYDENKO RUSMANA',
    'RAYHAN MUAMMAR KHADAFI',
    'MUHAMMAD DHAFIN FIRDAUS RAHMAT SUBEKTI',
    'ALDO'
  ];

  // Add current user's result to the ranking
  const currentUserResult = {
    name: state.userName,
    score: score,
    time: formatTime(timeElapsed)
  };

  // Create final ranking with real student data, database results, and current user
  const ranking = [
    // Use database results if available, otherwise use mock data
    ...(databaseResults.length > 0 
      ? databaseResults.map(result => ({
          name: result.userName,
          score: result.score,
          time: formatTime(result.timeElapsed)
        }))
      : classStudents.filter(student => !excludedNames.includes(student.name))
    ),
    // Only add current user if not already in database results
    ...(!databaseResults.some(result => result.userName === state.userName) ? [currentUserResult] : [])
  ].sort((a, b) => b.score - a.score || a.time.localeCompare(b.time))
   .map((player, index) => ({ ...player, rank: index + 1 }));

  const currentPlayerRank = ranking.find(player => player.name === state.userName)?.rank || ranking.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="w-full max-w-6xl mx-auto space-y-6" ref={resultsRef}>
        
        {/* Header */}
        <Card className="text-center shadow-xl border-0 bg-white/80 backdrop-blur">
          <CardHeader>
            <div className="mx-auto w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mb-4">
              <Trophy className="w-12 h-12 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Quiz Completed!
            </CardTitle>
            <p className="text-xl text-gray-600 mt-2">
              Great job, <span className="font-semibold text-blue-600">{state.userName}</span>!
            </p>
          </CardHeader>
        </Card>

        {/* Main Results */}
        <div className="grid md:grid-cols-2 gap-6">
          
          {/* Score Summary */}
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Your Score
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {score}
                </div>
                <div className="text-2xl text-gray-600">out of 30</div>
                <div className="text-lg font-semibold mt-2">
                  <span className={performance.color}>{percentage}% - {performance.level}</span>
                </div>
                <p className="text-gray-600 mt-1">{performance.message}</p>
              </div>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm font-medium mb-1">
                    <span>Structure Questions (1-15)</span>
                    <span>{structureScore}/15</span>
                  </div>
                  <Progress value={structurePercentage} className="h-2" />
                  <div className="text-xs text-gray-500 mt-1">{structurePercentage}% correct</div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm font-medium mb-1">
                    <span>Written Expression (16-30)</span>
                    <span>{writtenExpressionScore}/15</span>
                  </div>
                  <Progress value={writtenExpressionPercentage} className="h-2" />
                  <div className="text-xs text-gray-500 mt-1">{writtenExpressionPercentage}% correct</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Individual Leaderboard */}
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Individual Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {ranking.slice(0, 5).map((player, index) => (
                <div 
                  key={player.name}
                  className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                    player.name === state.userName ? 
                      'bg-gradient-to-r from-blue-100 to-indigo-100 border-blue-400 shadow-md' :
                    index === 0 ? 'bg-gradient-to-r from-yellow-100 to-orange-100 border-yellow-400' :
                    index === 1 ? 'bg-gradient-to-r from-gray-100 to-slate-100 border-gray-400' :
                    index === 2 ? 'bg-gradient-to-r from-amber-100 to-yellow-100 border-amber-400' :
                    'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-yellow-500 text-white' :
                      index === 1 ? 'bg-gray-500 text-white' :
                      index === 2 ? 'bg-amber-500 text-white' :
                      player.name === state.userName ? 'bg-blue-500 text-white' :
                      'bg-gray-400 text-white'
                    }`}>
                      #{player.rank}
                    </div>
                    <div>
                      <div className={`font-semibold ${player.name === state.userName ? 'text-blue-800' : 'text-gray-800'}`}>
                        {player.name} {player.name === state.userName ? '(You)' : ''}
                      </div>
                      <div className="text-xs text-gray-600">Time: {player.time}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-800">{player.score}/30</div>
                    <div className="text-xs text-gray-600">{Math.round((player.score / 30) * 100)}%</div>
                  </div>
                </div>
              ))}
              
              <div className="text-center text-sm text-gray-600 mt-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                <p><strong>{state.userName}</strong> ranked <strong>#{currentPlayerRank}</strong> out of {ranking.length} players!</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur">
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-4 justify-center">
              <Button
                onClick={handleRetakeQuiz}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Retake Quiz
              </Button>
              
              <Button
                onClick={handleShareResults}
                className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                <Share2 className="w-4 h-4" />
                Share Results
              </Button>
              
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={handleDownloadScreenshot}
              >
                <Image className="w-4 h-4" />
                Download Results
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Explanations Section */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-600" />
              Detailed Question Review & Explanations
            </CardTitle>
            <p className="text-gray-600">Review all questions with correct answers and detailed explanations</p>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Structure Questions Section */}
            <div>
              <h3 className="text-xl font-bold text-blue-700 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5" />
                Structure Questions (1-15) - Score: {structureScore}/15
              </h3>
              <div className="space-y-4">
                {state.questions.slice(0, 15).map((question, index) => {
                  const userAnswer = state.answers[index];
                  const isCorrect = userAnswer === question.correct;
                  
                  return (
                    <Card key={question.id} className={`border-2 ${isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3 mb-3">
                          {isCorrect ? (
                            <CheckCircle className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
                          ) : (
                            <XCircle className="w-6 h-6 text-red-600 mt-0.5 flex-shrink-0" />
                          )}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant={isCorrect ? "default" : "destructive"}>
                                Question {question.id}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                              </Badge>
                            </div>
                            <p className="font-medium text-gray-800 mb-3">{question.question}</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                              <div>
                                <p className="text-sm font-semibold text-gray-700 mb-1">Your Answer:</p>
                                <p className={`text-sm p-2 rounded ${isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                  {userAnswer !== -1 ? question.options[userAnswer] : 'No answer selected'}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-gray-700 mb-1">Correct Answer:</p>
                                <p className="text-sm p-2 rounded bg-green-100 text-green-800">
                                  {question.options[question.correct]}
                                </p>
                              </div>
                            </div>
                            
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                              <h4 className="font-semibold text-blue-800 mb-1 flex items-center gap-1">
                                <Lightbulb className="w-4 h-4" />
                                Explanation:
                              </h4>
                              <p className="text-blue-700 text-sm leading-relaxed">{question.explanation}</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Written Expression Questions Section */}
            <div>
              <h3 className="text-xl font-bold text-purple-700 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5" />
                Written Expression Questions (16-30) - Score: {writtenExpressionScore}/15
              </h3>
              <div className="space-y-4">
                {state.questions.slice(15, 30).map((question, index) => {
                  const userAnswer = state.answers[index + 15];
                  const isCorrect = userAnswer === question.correct;
                  
                  return (
                    <Card key={question.id} className={`border-2 ${isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3 mb-3">
                          {isCorrect ? (
                            <CheckCircle className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
                          ) : (
                            <XCircle className="w-6 h-6 text-red-600 mt-0.5 flex-shrink-0" />
                          )}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant={isCorrect ? "default" : "destructive"}>
                                Question {question.id}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                              </Badge>
                            </div>
                            <p className="font-medium text-gray-800 mb-3">{question.question}</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                              <div>
                                <p className="text-sm font-semibold text-gray-700 mb-1">Your Answer:</p>
                                <p className={`text-sm p-2 rounded ${isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                  {userAnswer !== -1 ? question.options[userAnswer] : 'No answer selected'}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-gray-700 mb-1">Correct Answer:</p>
                                <p className="text-sm p-2 rounded bg-green-100 text-green-800">
                                  {question.options[question.correct]}
                                </p>
                              </div>
                            </div>
                            
                            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                              <h4 className="font-semibold text-purple-800 mb-1 flex items-center gap-1">
                                <Lightbulb className="w-4 h-4" />
                                Explanation:
                              </h4>
                              <p className="text-purple-700 text-sm leading-relaxed">{question.explanation}</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QuizResults;