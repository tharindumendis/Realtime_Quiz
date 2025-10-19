"use client";
import { useState, useEffect } from "react";
import { database } from "@/util/firebaseConfig";
import { ref, onValue, set, serverTimestamp } from "firebase/database";
import { QuizQuestion } from "@/types";

const SubmitAnswer = () => {
  const [currentQuiz, setCurrentQuiz] = useState<QuizQuestion | null>(null);
  const [userAnswers, setUserAnswers] = useState<{ [key: string]: number }>({});
  const [name, setName] = useState<string | null>(null);
  const [user, setUser] = useState< string | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false); 

  // Function to safely sanitize the user name for Firebase keys
  const getSanitizedUser = (username: string | null): string | null => {
    return username ? username.replace(/[.#$[\]]/g, "_") : null;
  }

  // NEW FUNCTION: Clear name and trigger rename flow
  const handleRename = () => {
    // 🚨 Safety Check: Prevent rename if the current quiz has been answered
    if (hasAnswered) {
        alert("You cannot change your name after submitting an answer for the current quiz. Wait for the next question to be active or clear.");
        return;
    }
    
    localStorage.removeItem("user");
    setUser(null);
    setName(null); // Clear the temporary name input state too
    alert("You can now enter a new name.");
  };

  // Fetch the current quiz ID, quiz data, and check user's answer status
  useEffect(() => {
    const eventControlRef = ref(database, "EventControl/currentQuizId");
    const storedName = localStorage.getItem("user");
    if (storedName) {
      setUser(storedName);
    }
    
    const unsubscribe = onValue(eventControlRef, (snapshot) => {
      const quizId = snapshot.val();
      
      setHasAnswered(false); 
      setCurrentQuiz(null); 

      if (quizId) {
        const quizRef = ref(database, `quiz/${quizId}`);
        const sanitizedUser = getSanitizedUser(storedName);
        
        const quizUnsubscribe = onValue(quizRef, (quizSnapshot) => {
          if (quizSnapshot.exists()) {
            const fetchedQuiz = {
              id: quizId,
              ...quizSnapshot.val(),
            };
            setCurrentQuiz(fetchedQuiz as QuizQuestion);
            
            if (sanitizedUser) {
              const userAnswerRef = ref(database, `UserAnswers/${sanitizedUser}/${quizId}`);
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
  }, []); 

  const handleAnswerChange = (quizId: string, selectedAnswerId: string) => {
    setUserAnswers((prevAnswers) => ({
      ...prevAnswers,
      [quizId]: parseInt(selectedAnswerId),
    }));
  };

  const handleSubmit = (quizId: string) => {
    if (!user) {
      alert("Please enter your name before submitting an answer.");
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

    const userEmail = getSanitizedUser(user);
    if (!userEmail) return;

    const answerRef = ref(database, `UserAnswers/${userEmail}/${quizId}`);

    try {
      set(answerRef, {
        answerId: answerId,
        timestamp: serverTimestamp(),
      });
      setHasAnswered(true); 
      alert("Answer submitted successfully! Waiting for the next quiz...");
    } catch (error) {
      console.error("Error submitting quiz:", error);
    }
  };
  
  // --- Name Input Screen ---
  if(!user){
    return(
      <div className="p-8">
        <h2 className="text-2xl font-bold mb-4">Enter Your Name</h2>
        <input 
          type="text"
          className="border p-2 rounded w-full mb-4"
          placeholder="Your Name"
          value={name || ""}
          onChange={(e) => setName(e.target.value)}
        />
        <button
          onClick={() => {
            if(name && name.trim()){
              localStorage.setItem("user", name.trim());
              setUser(name.trim());
            } else {
                alert("Name cannot be empty.");
            }
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Save Name
        </button>
      </div>
    )
  }
  
  // --- Quiz Display Screen ---
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6 border-b pb-3">
          <h2 className="text-xl font-bold">Welcome, {user}!</h2>
          {/* 🚨 RENAMING LOGIC: Button is disabled if hasAnswered is true */}
          <button
              onClick={handleRename}
              className={`text-sm underline transition-opacity ${
                  hasAnswered 
                    ? 'text-gray-500 cursor-not-allowed opacity-70' 
                    : 'text-blue-600 hover:text-blue-800'
              }`}
              disabled={hasAnswered}
              title={hasAnswered ? "Please wait for the next quiz to change your name." : "Click to enter a new name."}
          >
              (Change Name)
          </button>
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