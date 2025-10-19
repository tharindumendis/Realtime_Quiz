"use client";
import { useState, useEffect } from "react";
import { database } from "@/util/firebaseConfig";
import { ref, onValue } from "firebase/database";
import { QuizQuestion, UserAnswer, UserScore } from "@/types";
import Link from "next/link"; 

// Define a simplified UserScore type for display
interface DisplayUserScore extends UserScore {
  userName: string; 
  answersGiven: { [quizId: string]: number | undefined };
}

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<DisplayUserScore[]>([]);
  const [questions, setQuestions] = useState<{ [key: string]: QuizQuestion }>({});
  const [userAnswers, setUserAnswers] = useState<{
    [key: string]: { [key: string]: UserAnswer };
  }>({});
  
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null);
  // State to read the reveal flag from the database
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false); 
  const [loading, setLoading] = useState(true);

  // Helper function to safely extract the timestamp value (number or 0)
  const getTimestampValue = (ts: any): number => {
    return typeof ts === 'number' ? ts : 0;
  };

  // 1. Fetch all quiz questions
  useEffect(() => {
    const questionsRef = ref(database, "quiz");
    const unsubscribe = onValue(questionsRef, (snapshot) => {
      const fetchedQuestions: { [key: string]: QuizQuestion } = {};
      snapshot.forEach((childSnapshot) => {
        const questionData: QuizQuestion = childSnapshot.val();
        fetchedQuestions[childSnapshot.key!] = {
          ...questionData,
          id: childSnapshot.key!,
        };
      });
      setQuestions(fetchedQuestions);
    });
    return () => unsubscribe();
  }, []);

  // 2. Fetch user answers and EventControl data (including reveal flag)
  useEffect(() => {
    // Listener for User Answers
    const userAnswersRef = ref(database, "UserAnswers");
    const unsubscribeAnswers = onValue(userAnswersRef, (snapshot) => {
      const fetchedAnswers: { [key: string]: { [key: string]: UserAnswer } } = {};
      snapshot.forEach((userSnapshot) => {
        const userId = userSnapshot.key!; 
        fetchedAnswers[userId] = {};
        userSnapshot.forEach((answerSnapshot) => {
          const answerData: UserAnswer = answerSnapshot.val();
          fetchedAnswers[userId][answerSnapshot.key!] = answerData;
        });
      });
      setUserAnswers(fetchedAnswers);
    });

    // Listener for Event Control (Active Quiz ID and Reveal Flag)
    const eventControlRef = ref(database, "EventControl");
    const unsubscribeControl = onValue(eventControlRef, (snapshot) => {
      const data = snapshot.val();
      setActiveQuizId(data?.currentQuizId || null);
      setIsAnswerRevealed(!!data?.isAnswerRevealed);
      setLoading(false);
    });

    return () => {
        unsubscribeAnswers();
        unsubscribeControl();
    };
  }, []);


  // 3. Calculate scores and ranking
  useEffect(() => {
    const scoresMap: { [key: string]: DisplayUserScore } = {};

    for (const userId in userAnswers) {
      const answersForUser = userAnswers[userId];
      
      const firstAnswerKey = Object.keys(answersForUser)[0];
      const userName = firstAnswerKey ? answersForUser[firstAnswerKey].userName : `User ${userId.substring(0, 4)}`;

      if (!scoresMap[userId]) {
        scoresMap[userId] = { 
          userId, 
          userName: userName, 
          score: 0, 
          lastAnswerTimestamp: 0,
          answersGiven: {}, 
        };
      }
      
      for (const questionId in answersForUser) {
        const userAnswer = answersForUser[questionId];
        const question = questions[questionId];

        scoresMap[userId].answersGiven[questionId] = userAnswer.answerId;

        // Scoring Logic 
        if (question && userAnswer.answerId === question.rightAnswer) {
          scoresMap[userId].score++;

          const userTimestamp = getTimestampValue(userAnswer.timestamp);

          if (userTimestamp > (scoresMap[userId].lastAnswerTimestamp || 0)) {
            scoresMap[userId].lastAnswerTimestamp = userTimestamp;
          }
        }
      }
    }

    const scoreList: DisplayUserScore[] = Object.values(scoresMap);

    // Sort: 1. By score (desc) 2. By speed (timestamp asc)
    scoreList.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return (a.lastAnswerTimestamp || 0) - (b.lastAnswerTimestamp || 0);
    });

    setLeaderboard(scoreList);
  }, [questions, userAnswers]);

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500">
        Loading leaderboard...
      </div>
    );
  }
  
  const isGamePaused = !activeQuizId;
  const currentQuiz = activeQuizId ? questions[activeQuizId] : null;

  return (
    <div className="p-8">
      <Link 
        href="/" 
        className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6 text-sm font-medium"
      >
        &larr; Back to Home
      </Link>
      
      <h1 className="text-2xl font-bold mb-4">Live Leaderboard</h1>
      
      {/* Status Message and Reveal Logic */}
      <div className={`mb-6 p-3 rounded-lg text-white font-semibold ${
        isAnswerRevealed ? 'bg-purple-600' : 'bg-gray-500'
      }`}>
        Status: {isGamePaused ? 'Game PAUSED' : 'Game ACTIVE'} | Answers are 
        <span className={`font-semibold ${isAnswerRevealed ? "text-yellow-200" : "text-gray-200"}`}>
            {isAnswerRevealed ? " SHOWN" : " HIDDEN"}
        </span>.
        
        {/* Display Correct Answer for the current quiz if revealed */}
        {isAnswerRevealed && currentQuiz && (
            <p className="mt-2 text-yellow-200 text-sm">
                Active Quiz ({currentQuiz.question.substring(0, 20)}...): 
                <span className="ml-2 underline">
                    {currentQuiz.answers.find(a => a.key === currentQuiz.rightAnswer)?.text || 'N/A'}
                </span>
            </p>
        )}
      </div>
      
      {leaderboard.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          No users have submitted answers yet.
        </div>
      ) : (
        <ul className="divide-y divide-gray-200">
          <li className="text-lg p-2 flex justify-between items-center bg-gray-200 font-bold rounded-t">
              <span className="w-1/12">Rank</span>
              <span className="w-3/12 text-right">Score</span>
          </li>
          {leaderboard.map((score, index) => (
            <li
              key={score.userId}
              className="text-lg p-3 flex justify-between items-center bg-white hover:bg-gray-50 transition-colors border-b"
            >
              {/* RANK (1, 2, 3...) */}
              <span className="w-1/12 font-bold text-lg">
                {index + 1}.
              </span>
              
              {/* User Name (Email) */}
              <div className="w-8/12 font-medium">
                  {score.userName}
              </div>
              
              {/* Score */}
              <div className="w-3/12 text-right">
                <span className="font-bold text-xl text-green-700">
                    {score.score}
                </span>
                {/* Show tie-breaker speed only if scores are close or if you want to emphasize speed */}
                <span className="text-sm text-gray-500 ml-2">
                    ({score.lastAnswerTimestamp ? score.lastAnswerTimestamp % 1000 : 0}ms)
                </span>
              </div>
              
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Leaderboard;