import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Clock, Target, Users } from 'lucide-react';

interface LoadingScreenProps {
  progress: number;
  message: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ progress, message }) => {
  const features = [
    { icon: BookOpen, text: "30 TOEFL Questions", color: "text-blue-600" },
    { icon: Clock, text: "30-Minute Timer", color: "text-green-600" },
    { icon: Target, text: "Game Boosters", color: "text-purple-600" },
    { icon: Users, text: "Group Ranking", color: "text-orange-600" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto shadow-xl border-0 bg-white/80 backdrop-blur">
        <CardContent className="p-8 text-center space-y-6">
          {/* Logo/Icon */}
          <div className="mx-auto w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center animate-pulse">
            <BookOpen className="w-10 h-10 text-white" />
          </div>
          
          {/* Title */}
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Loading Quiz
            </h2>
            <p className="text-gray-600 mt-1">{message}</p>
          </div>
          
          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-gray-500">{progress}% Complete</p>
          </div>
          
          {/* Features */}
          <div className="grid grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`flex items-center gap-2 p-3 rounded-lg bg-gray-50 ${
                  progress > index * 25 ? 'opacity-100 animate-in slide-in-from-left' : 'opacity-30'
                }`}
              >
                <feature.icon className={`w-4 h-4 ${feature.color}`} />
                <span className="text-xs font-medium text-gray-700">{feature.text}</span>
              </div>
            ))}
          </div>
          
          {/* Loading Animation */}
          <div className="flex justify-center space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoadingScreen;