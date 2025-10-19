"use client";
import { useState, useEffect } from "react";
import { database } from "@/util/firebaseConfig";
import { ref, onValue, set, serverTimestamp } from "firebase/database";
import { QuizQuestion } from "@/types";
import { useAuth } from "@/util/AuthContext";
import Link from "next/link"; // Ensure Link is imported

const SubmitAnswer = () => {
  const { user: fbUser, loading } = useAuth();

  const [currentQuiz, setCurrentQuiz] = useState<QuizQuestion | null>(null);
  const [userAnswers, setUserAnswers] = useState<{ [key: string]: number }>({});
  const [hasAnswered, setHasAnswered] = useState(false); 

  // Function to get the unique Firebase User ID (UID)
  const getUserId = (user: any): string | null => {
    return user?.uid || null;
  }
  
  // Fetch the current quiz ID and quiz data, and check user's answer status
  useEffect(() => {
    if (loading) return; 

    const userId = getUserId(fbUser);
    
    if (!fbUser) {
        setCurrentQuiz(null);
        setHasAnswered(false);
        return;
    }

    const eventControlRef = ref(database, "EventControl/currentQuizId");
    
    const unsubscribe = onValue(eventControlRef, (snapshot) => {
      const quizId = snapshot.val();
      
      setHasAnswered(false); 
      setCurrentQuiz(null); 

      if (quizId) {
        const quizRef = ref(database, `quiz/${quizId}`);
        
        const quizUnsubscribe = onValue(quizRef, (quizSnapshot) => {
          if (quizSnapshot.exists()) {
            const fetchedQuiz = {
              id: quizId,
              ...quizSnapshot.val(),
            };
            setCurrentQuiz(fetchedQuiz as QuizQuestion);
            
            if (userId) {
              const userAnswerRef = ref(database, `UserAnswers/${userId}/${quizId}`);
              onValue(userAnswerRef, (answerSnapshot) => {
                if (answerSnapshot.exists()) {
                  setHasAnswered(true);
                } else {
                  setHasAnswered(false);
                }
              }, { onlyOnce: true });
            }
            
          } else {
            setCurrentQuiz(null);
            setHasAnswered(false);
          }
        });
        return () => quizUnsubscribe();
      } else {
        setCurrentQuiz(null);
      }
    });
    return () => unsubscribe();
  }, [fbUser, loading]); 

  const handleAnswerChange = (quizId: string, selectedAnswerId: string) => {
    setUserAnswers((prevAnswers) => ({
      ...prevAnswers,
      [quizId]: parseInt(selectedAnswerId),
    }));
  };

  const handleSubmit = (quizId: string) => {
    if (!fbUser) {
      alert("You must be logged in to submit an answer.");
      return;
    }
    
    const answerId = userAnswers[quizId];
    if (answerId === undefined) {
      alert("Please select an answer.");
      return;
    }
    
    if (hasAnswered) {
        alert("You have already submitted an answer for this quiz.");
        return;
    }

    const userId = getUserId(fbUser);
    if (!userId) return;

    const answerRef = ref(database, `UserAnswers/${userId}/${quizId}`);

    try {
      set(answerRef, {
        answerId: answerId,
        userName: fbUser.email, 
        timestamp: serverTimestamp(),
      });
      setHasAnswered(true); 
      alert("Answer submitted successfully! Waiting for the next quiz...");
    } catch (error) {
      console.error("Error submitting quiz:", error);
    }
  };
  
  // --- Render Logic ---
  if (loading) {
      return <div className="p-8 text-xl">Checking authentication...</div>;
  }
  
  if (!fbUser) {
    return(
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-4 text-red-600">Login Required</h2>
        <p className="mb-4">You need to log in to submit answers. Go to the home page to log in with your provided credentials.</p>
        <Link href="/" className="bg-blue-600 text-white px-4 py-2 rounded">
            Go to Login
        </Link>
      </div>
    )
  }
  
  // --- Quiz Display Screen ---
  return (
    <div className="p-8">
      {/* 🚨 BACK BUTTON ADDED HERE */}
      <Link 
        href="/" 
        className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6 text-sm font-medium"
      >
        &larr; Back to Home
      </Link>
      {/* End Back Button */}
      
      <div className="flex justify-between items-center mb-6 border-b pb-3">
          <h2 className="text-xl font-bold">Current Quiz</h2>
          <p className="text-sm text-gray-600">Playing as: <span className="font-semibold text-blue-600">{fbUser.email}</span></p>
      </div>

      {currentQuiz ? (
        <div className="mb-8 p-4 border rounded shadow">
          <h2 className="text-xl font-bold mb-4">{currentQuiz.question}</h2>
          
          {/* Display status message */}
          {hasAnswered ? (
            <p className="text-lg text-green-600 font-semibold mb-4">
                ✅ Answer submitted! Waiting for the next question...
            </p>
          ) : (
             <p className="text-lg text-gray-700 font-semibold mb-4">
                 Select your answer:
             </p>
          )}

          <ul className="flex flex-col gap-2">
            {currentQuiz.answers.map((answer) => (
              <li key={answer.key}>
                <label className="flex items-center gap-2 cursor-pointer opacity-100 disabled:opacity-50">
                  <input
                    type="radio"
                    name={`quiz-${currentQuiz.id}`}
                    value={answer.key}
                    checked={userAnswers[currentQuiz.id!] === answer.key}
                    onChange={(e) =>
                      handleAnswerChange(currentQuiz.id!, e.target.value)
                    }
                    disabled={hasAnswered} 
                  />
                  <span>{answer.text}</span>
                </label>
              </li>
            ))}
          </ul>
          <button
            onClick={() => handleSubmit(currentQuiz.id!)}
            className={`mt-4 text-white px-4 py-2 rounded transition-colors ${
                hasAnswered 
                ? 'bg-gray-500 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
            disabled={hasAnswered}
          >
            {hasAnswered ? "Submitted" : "Submit Answer"}
          </button>
        </div>
      ) : (
        <p className="text-xl text-gray-500">
          No active quiz at the moment. Please wait for the next question.
        </p>
      )}
    </div>
  );
};

export default SubmitAnswer;