"use client";
import { useState, useEffect } from "react";
import { database } from "@/util/firebaseConfig";
import { ref, onValue, set, serverTimestamp } from "firebase/database";
import { QuizQuestion } from "@/types";

const SubmitAnswer = () => {
  const [currentQuiz, setCurrentQuiz] = useState<QuizQuestion | null>(null);
  const [userAnswers, setUserAnswers] = useState<{ [key: string]: number }>({});

  // Fetch the current quiz ID and then fetch the quiz data
  useEffect(() => {
    const eventControlRef = ref(database, "EventControl/currentQuizId");
    const unsubscribe = onValue(eventControlRef, (snapshot) => {
      const quizId = snapshot.val();
      if (quizId) {
        const quizRef = ref(database, `quiz/${quizId}`);
        const quizUnsubscribe = onValue(quizRef, (quizSnapshot) => {
          if (quizSnapshot.exists()) {
            setCurrentQuiz({
              id: quizId,
              ...quizSnapshot.val(),
            });
          } else {
            setCurrentQuiz(null); 
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
    const answerId = userAnswers[quizId];
    if (answerId === undefined) {
      alert("Please select an answer.");
      return;
    }

    const userEmail = "testuser2@example.com".replace(/[.#$[\]]/g, "_");
    const answerRef = ref(database, `UserAnswers/${userEmail}/${quizId}`);

    try {
      set(answerRef, {
        answerId: answerId,
        timestamp: serverTimestamp(),
      });
      alert("Answer submitted successfully!");
    } catch (error) {
      console.error("Error submitting quiz:", error);
    }
  };

  return (
    <div className="p-8">
      {currentQuiz ? (
        <div className="mb-8 p-4 border rounded shadow">
          <h2 className="text-xl font-bold mb-4">{currentQuiz.question}</h2>
          <ul className="flex flex-col gap-2">
            {currentQuiz.answers.map((answer) => (
              <li key={answer.key}>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name={`quiz-${currentQuiz.id}`}
                    value={answer.key}
                    checked={userAnswers[currentQuiz.id!] === answer.key}
                    onChange={(e) => handleAnswerChange(currentQuiz.id!, e.target.value)}
                  />
                  <span>{answer.text}</span>
                </label>
              </li>
            ))}
          </ul>
          <button
            onClick={() => handleSubmit(currentQuiz.id!)}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
          >
            Submit Answer
          </button>
        </div>
      ) : (
        <p className="text-xl text-gray-500">No active quiz at the moment. Please wait for the next question.</p>
      )}
    </div>
  );
};

export default SubmitAnswer;