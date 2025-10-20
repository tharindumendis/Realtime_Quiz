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
  // 🚨 NEW STATE: To store the count of answers for each quiz ID
  const [answerCounts, setAnswerCounts] = useState<{ [quizId: string]: number }>({});

  // --- 1. Fetch Quizzes ---
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

  // --- 2. Fetch and Calculate User Answer Counts ---
  useEffect(() => {
    const userAnswersRef = ref(database, "UserAnswers");
    
    // Listen to changes in UserAnswers to calculate counts in real-time
    const unsubscribe = onValue(userAnswersRef, (snapshot) => {
      const counts: { [quizId: string]: number } = {};

      if (snapshot.exists()) {
        // Iterate over each user (top level key in UserAnswers)
        snapshot.forEach((userSnapshot) => {
          // Iterate over each quiz the user has answered
          userSnapshot.forEach((quizAnswerSnapshot) => {
            const quizId = quizAnswerSnapshot.key!;
            
            // Increment the counter for this specific quizId
            counts[quizId] = (counts[quizId] || 0) + 1;
          });
        });
      }
      setAnswerCounts(counts);
    });

    return () => unsubscribe();
  }, []); // Run only once on mount

  // --- Other Handlers (Deleted for brevity, assume they are still here) ---
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

  const handleClearUserAnswers = async () => {
    if (
      window.confirm(
        "ARE YOU SURE? This will permanently delete ALL user answers and reset the game progress!"
      )
    ) {
      try {
        const userAnswersRef = ref(database, "UserAnswers");
        await remove(userAnswersRef);
        alert("All user answers have been successfully cleared!");
      } catch (error) {
        console.error("Error clearing user answers:", error);
        alert("Failed to clear user answers.");
      }
    }
  };

  const handleClearAllQuizzes = async () => {
    if (
      window.confirm(
        "DANGER: This will permanently delete ALL QUIZ QUESTIONS! Are you absolutely sure you want to proceed?"
      )
    ) {
      try {
        const quizzesRef = ref(database, "quiz");
        await remove(quizzesRef);
        alert("All quizzes have been successfully deleted!");
      } catch (error) {
        console.error("Error clearing quizzes:", error);
        alert("Failed to clear quizzes.");
      }
    }
  };
  // --- End Other Handlers ---

  return (
    <div className="p-8 w-full">
      
      {/* Admin Controls Block */}
      <div className="mb-6 pb-4 border-b">
        <h2 className="text-xl mb-3 text-red-700 font-bold">⚠️ Danger Zone Controls</h2>
        
        <div className="flex flex-wrap gap-4 mb-2">
            <button
              onClick={handleClearUserAnswers}
              className="px-4 py-2 text-sm bg-red-700 text-white rounded hover:bg-red-800 transition-colors"
            >
              🚨 Clear All User Answers
            </button>
            <button
              onClick={handleClearAllQuizzes}
              className="px-4 py-2 text-sm bg-red-900 text-white rounded hover:bg-red-950 transition-colors"
            >
              🔥 Clear ALL Quizzes
            </button>
        </div>
        <p className="text-xs mt-1 text-gray-500">
          Use these controls with caution.
        </p>
      </div>
      
      <h2 className="text-xl mb-2">Manage Individual Quizzes</h2>
      <ul className="list-disc pl-5">
        {quizzes.map((quiz) => {
          // Get the submission count for this quiz, defaulting to 0
          const count = answerCounts[quiz.id!] || 0; 
          return (
            <li key={quiz.id} className="flex justify-between items-center py-2 border-b">
              {/* 🚨 DISPLAY QUESTION AND SUBMISSION COUNT */}
              <div className="flex flex-col">
                <span className="font-medium">Question: {quiz.question}</span>
                <span className={`text-sm mt-1 font-semibold ${count > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                  {count} {count === 1 ? 'user' : 'users'} answered
                </span>
              </div>
              {/* End Display */}
              
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
          );
        })}
      </ul>

      {quizzes.length === 0 && (
          <p className="text-gray-500 mt-4">No quizzes found. Add a quiz using the &quot;Add Quiz&quot; panel.</p>
      )}

      {showModal && currentQuiz && (
        <Modal show={showModal} onClose={() => setShowModal(false)}>
          <UpdateQuizForm quiz={currentQuiz} onUpdate={handleUpdate} />
        </Modal>
      )}
    </div>
  );
};

export default AdminActionPanel;