"use client";
import { useState, useEffect } from "react";
import { database } from "@/util/firebaseConfig";
import { ref, onValue, set, serverTimestamp } from "firebase/database";
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
      set(eventControlRef, {
        currentQuizId: quizId,
        questionChangeTimestamp: serverTimestamp(),
      });
      alert(`Quiz with ID ${quizId} is now active.`);
    } catch (error) {
      console.error("Error setting current quiz:", error);
    }
  };

  return (
    <div className="p-8 w-full">
      <h2 className="text-xl mb-2">Available Quizzes</h2>
      <ul className="list-disc pl-5">
        {quizzes.map((quiz) => (
          <li key={quiz.id} className="flex justify-between items-center py-2 border-b">
            <span className="font-medium">Question: {quiz.question}</span>
            <button
              onClick={() => handleSetCurrentQuiz(quiz.id!)}
              className={`px-4 py-2 rounded-lg text-white font-semibold transition-colors ${
                currentQuizId === quiz.id
                  ? "bg-green-500 hover:bg-green-600"
                  : "bg-blue-500 hover:bg-blue-600"
              }`}
            >
              {currentQuizId === quiz.id ? "Active" : "Set as Current"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminControl;