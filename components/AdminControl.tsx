"use client";
import { useState, useEffect } from "react";
import { database } from "@/util/firebaseConfig";
import { ref, onValue, set, update, remove, serverTimestamp } from "firebase/database"; // 🚨 Added 'remove'

import { QuizQuestion } from "@/types";

const AdminControl = () => {
  const [quizzes, setQuizzes] = useState<QuizQuestion[]>([]);
  const [currentQuizId, setCurrentQuizId] = useState<string | null>(null);

  // Fetch all available quizzes
  useEffect(() => {
    const quizzesRef = ref(database, "quiz");
    const unsubscribe = onValue(quizzesRef, (snapshot) => {
      const fetchedQuizzes: QuizQuestion[] = [];
      snapshot.forEach((childSnapshot) => {
        fetchedQuizzes.push({
          id: childSnapshot.key!,
          ...childSnapshot.val(),
        });
      });
      setQuizzes(fetchedQuizzes);
    });
    return () => unsubscribe();
  }, []);

  // Fetch the ID of the currently active quiz
  useEffect(() => {
    const eventControlRef = ref(database, "EventControl/currentQuizId");
    const unsubscribe = onValue(eventControlRef, (snapshot) => {
      setCurrentQuizId(snapshot.val());
    });
    return () => unsubscribe();
  }, []);

  const handleSetCurrentQuiz = (quizId: string) => {
    try {
      const eventControlRef = ref(database, "EventControl");
      // Set the new quiz ID and update the timestamp
      set(eventControlRef, {
        currentQuizId: quizId,
        questionChangeTimestamp: serverTimestamp(),
      });
      alert(`Quiz with ID ${quizId} is now active.`);
    } catch (error) {
      console.error("Error setting current quiz:", error);
    }
  };

  // 🚨 NEW FUNCTION: Clear the active quiz
  const handleClearCurrentQuiz = () => {
    try {
      const eventControlRef = ref(database, "EventControl/currentQuizId");
      
      // Setting it to null (or using remove) will clear the value in the DB
      // We will use update to set the ID to null and keep the timestamp property if it exists
      // However, the cleanest way is often to explicitly remove the value:
      remove(eventControlRef); 

      // OPTIONAL: You might also want to clear the 'questionChangeTimestamp' here if it exists on the root 'EventControl'
      
      alert("Active quiz has been cleared. The game is paused.");
    } catch (error) {
      console.error("Error clearing current quiz:", error);
    }
  };

  return (
    <div className="p-8 w-full">
      
      {/* 🚨 New Control Block for Clearing */}
      <div className="mb-6 pb-4 border-b">
        <h2 className="text-xl mb-3 font-bold">Current Status: 
            <span className={currentQuizId ? "text-green-600" : "text-red-600"}>
                {currentQuizId ? " ACTIVE" : " PAUSED"}
            </span>
        </h2>
        <button
          onClick={handleClearCurrentQuiz}
          className={`px-6 py-2 rounded-lg text-white font-semibold transition-colors ${
            currentQuizId
              ? "bg-red-500 hover:bg-red-600"
              : "bg-gray-400 cursor-not-allowed"
          }`}
          disabled={!currentQuizId}
        >
          Clear Active Quiz (Pause Game)
        </button>
        <p className="text-sm mt-2 text-gray-500">
            Click to remove the current question and stop user submissions.
        </p>
      </div>
      
      <h2 className="text-xl mb-2">Select Next Quiz</h2>
      
      <ul className="list-disc pl-5">
        {quizzes.map((quiz) => (
          <li key={quiz.id} className="flex justify-between items-center py-2 border-b">
            <span className="font-medium">Question: {quiz.question}</span>
            <button
              onClick={() => handleSetCurrentQuiz(quiz.id!)}
              className={`px-4 py-2 rounded-lg text-white font-semibold transition-colors ${
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
            <p className="text-gray-500 mt-4">No quizzes available. Add a quiz from the Admin Panel.</p>
        )}
      </ul>
    </div>
  );
};

export default AdminControl;