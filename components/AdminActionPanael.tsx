"use client";
import { useState, useEffect } from "react";
import { database } from "@/util/firebaseConfig";
import { ref, onValue, update, remove } from "firebase/database";
import { QuizQuestion } from "@/types";
import Modal from "./Modal";
import UpdateQuizForm from "./UpdateQuizForm";

const AdminActionPanel = () => {
  const [quizzes, setQuizzes] = useState<QuizQuestion[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState<QuizQuestion | null>(null);

  // Fetch all quizzes from the database
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

  const handleUpdateClick = (quiz: QuizQuestion) => {
    setCurrentQuiz(quiz);
    setShowModal(true);
  };

  const handleDeleteQuiz = async (quizId: string) => {
    if (window.confirm("Are you sure you want to delete this quiz?")) {
      try {
        const quizRef = ref(database, `quiz/${quizId}`);
        await remove(quizRef);
        alert("Quiz deleted successfully!");
      } catch (error) {
        console.error("Error deleting quiz:", error);
      }
    }
  };

  const handleUpdate = async (updatedQuiz: QuizQuestion) => {
    try {
      const quizRef = ref(database, `quiz/${updatedQuiz.id}`);
      await update(quizRef, {
        question: updatedQuiz.question,
        answers: updatedQuiz.answers,
        rightAnswer: updatedQuiz.rightAnswer,
      });
      setShowModal(false);
      setCurrentQuiz(null);
      alert("Quiz updated successfully!");
    } catch (error) {
      console.error("Error updating quiz:", error);
    }
  };

  return (
    <div className="p-8 w-full">
      <h2 className="text-xl mb-2">Manage Quizzes</h2>
      <ul className="list-disc pl-5">
        {quizzes.map((quiz) => (
          <li key={quiz.id} className="flex justify-between items-center py-2 border-b">
            <span className="font-medium">Question: {quiz.question}</span>
            <div className="flex gap-2">
              <button
                onClick={() => handleUpdateClick(quiz)}
                className="px-3 py-1 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600"
              >
                Update
              </button>
              <button
                onClick={() => handleDeleteQuiz(quiz.id!)}
                className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      {showModal && currentQuiz && (
        <Modal show={showModal} onClose={() => setShowModal(false)}>
          <UpdateQuizForm quiz={currentQuiz} onUpdate={handleUpdate} />
        </Modal>
      )}
    </div>
  );
};

export default AdminActionPanel;