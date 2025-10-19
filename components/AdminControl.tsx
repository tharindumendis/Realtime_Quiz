"use client";
import { useState, useEffect } from "react";
import { database } from "@/util/firebaseConfig";
import {
  ref,
  onValue,
  set,
  update,
  remove,
  serverTimestamp,
} from "firebase/database";

import { QuizQuestion } from "@/types";

const AdminControl = () => {
  const [quizzes, setQuizzes] = useState<QuizQuestion[]>([]);
  const [currentQuizId, setCurrentQuizId] = useState<string | null>(null); // 🚨 NEW STATE: To track if the answer is currently revealed
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false); // Fetch all available quizzes (existing)

  useEffect(() => {
    const quizzesRef = ref(database, "quiz");
    const unsubscribe = onValue(quizzesRef, (snapshot) => {
      const fetchedQuizzes: QuizQuestion[] = [];
      snapshot.forEach((childSnapshot) => {
        const quizData: QuizQuestion = childSnapshot.val(); // Ensure type assertion is correct if necessary
        fetchedQuizzes.push({
          id: childSnapshot.key!,
          ...quizData,
        });
      });
      setQuizzes(fetchedQuizzes);
    });
    return () => unsubscribe();
  }, []); // Fetch the ID of the currently active quiz AND the reveal state

  useEffect(() => {
    const eventControlRef = ref(database, "EventControl");
    const unsubscribe = onValue(eventControlRef, (snapshot) => {
      const data = snapshot.val();
      setCurrentQuizId(data?.currentQuizId || null); // 🚨 Update the reveal state
      setIsAnswerRevealed(!!data?.isAnswerRevealed);
    });
    return () => unsubscribe();
  }, []);

  const handleSetCurrentQuiz = (quizId: string) => {
    try {
      const eventControlRef = ref(database, "EventControl"); // Setting a new quiz automatically UN-REVEALS the answer
      set(eventControlRef, {
        currentQuizId: quizId,
        questionChangeTimestamp: serverTimestamp(),
        isAnswerRevealed: false, // 🚨 Reset the reveal flag
      });
      alert(`Quiz with ID ${quizId} is now active (Answers hidden).`);
    } catch (error) {
      console.error("Error setting current quiz:", error);
    }
  };

  const handleClearCurrentQuiz = () => {
    try {
      const eventControlRef = ref(database, "EventControl/currentQuizId");
      remove(eventControlRef);
      alert("Active quiz ID has been cleared (Game Paused).");
    } catch (error) {
      console.error("Error clearing current quiz:", error);
    }
  }; // 🚨 NEW FUNCTION: Toggle the reveal flag

  const handleToggleReveal = async () => {
    const newValue = !isAnswerRevealed;
    try {
      const eventControlRef = ref(database, "EventControl"); // Update only the reveal flag
      await update(eventControlRef, {
        isAnswerRevealed: newValue,
      });
      alert(
        `Answers are now ${newValue ? "SHOWN" : "HIDDEN"} on the Leaderboard.`
      );
    } catch (error) {
      console.error("Error toggling reveal:", error);
    }
  };

  return (
    <div className="p-8 w-full">
                  {/* 🚨 New Control Block for Clearing & Revealing */}     {" "}
      <div className="mb-6 pb-4 border-b">
                <h2 className="text-xl mb-3 font-bold">Game Control</h2>
        <div className="flex flex-wrap gap-3 mb-4">
          <button
            onClick={handleClearCurrentQuiz}
            className={`px-4 py-2 rounded-lg text-white font-semibold transition-colors ${
              currentQuizId
                ? "bg-red-500 hover:bg-red-600"
                : "bg-gray-400 cursor-not-allowed"
            }`}
            disabled={!currentQuizId}
          >
            Clear Active Quiz (Pause Submissions)
          </button>

          <button
            onClick={handleToggleReveal}
            className={`px-4 py-2 rounded-lg text-white font-semibold transition-colors ${
              isAnswerRevealed
                ? "bg-purple-700 hover:bg-purple-800"
                : "bg-orange-500 hover:bg-orange-600"
            }`}
          >
            {isAnswerRevealed ? "✅ Hide Answers" : "👁️ Show Answers"}
          </button>
        </div>
        <p className="text-sm">
          Status:
          <span
            className={`font-semibold ${
              currentQuizId ? "text-green-600" : "text-red-600"
            }`}
          >
            {currentQuizId ? " ACTIVE" : " PAUSED"}
          </span>{" "}
          | Answers are
          <span
            className={`font-semibold ${
              isAnswerRevealed ? "text-purple-600" : "text-gray-600"
            }`}
          >
            {isAnswerRevealed ? " SHOWN" : " HIDDEN"}
          </span>
          .
        </p>
      </div>
      <h2 className="text-xl mb-2">Select Next Quiz</h2>
      <ul className="list-disc pl-5">
        {quizzes.map((quiz) => (
          <li
            key={quiz.id}
            className="flex justify-between items-center py-2 border-b"
          >
            <span className="font-medium">Question: {quiz.question}</span>
            <button
              onClick={() => handleSetCurrentQuiz(quiz.id!)}
              className={`px-4 py-2 max-h-10 min-w-40 rounded-lg text-white font-semibold transition-colors ${
                currentQuizId === quiz.id
                  ? "bg-green-500 hover:bg-green-600 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600"
              }`}
              disabled={currentQuizId === quiz.id} // Disable if already active
            >
              {currentQuizId === quiz.id ? "ACTIVE" : "Set as Current"}
            </button>
          </li>
        ))}
        {quizzes.length === 0 && (
          <p className="text-gray-500 mt-4">
            No quizzes available. Add a quiz from the Admin Panel.
          </p>
        )}
      </ul>
    </div>
  );
};

export default AdminControl;
