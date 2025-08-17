"use client";
import { useState, useEffect } from "react";
import { database } from "@/util/firebaseConfig";
import {
  ref,
  onValue,
  set, // Use 'set' instead of 'push'
  serverTimestamp,
} from "firebase/database";

const SubmitAnswer = () => {
  const [quizSet, setQuizSet] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});

  useEffect(() => {
    const quizRef = ref(database, "quiz");
    const unsubscribe = onValue(quizRef, (snapshot) => {
      const quiz = [];
      snapshot.forEach((childSnapshot) => {
        quiz.push({
          id: childSnapshot.key,
          ...childSnapshot.val(),
        });
      });
      setQuizSet(quiz.reverse());
    });
    return () => unsubscribe();
  }, []);

  const handleAnswerChange = (quizId, selectedAnswerId) => {
    setUserAnswers((prevAnswers) => ({
      ...prevAnswers,
      [quizId]: parseInt(selectedAnswerId),
    }));
  };

  const handleSubmit = (quizId) => {
    const answerId = userAnswers[quizId];
    if (answerId === undefined) {
      console.log("No answer selected for this quiz.");
      return;
    }

    const userEmail = "werdfdsf@gmail.com".replace(/[.#$[\]]/g, "_"); // Firebase doesn't allow these characters
    
    // Create a specific reference for this user's answer to this question
    const answerRef = ref(database, `UserAnswers/${userEmail}/${quizId}`);

    try {
      // Use set() to write or overwrite the data at the specific path
      set(answerRef, {
        answerId: answerId,
        timestamp: serverTimestamp(),
      });
      console.log(`Answer updated for quiz ${quizId}: ${answerId}`);
    } catch (error) {
      console.error("Error submitting quiz:", error);
    }
  };

  return (
    <div>
      {quizSet.map((quiz) => (
        <div key={quiz.id} className="mb-8 p-4 border rounded">
          <h2>Question: {quiz.question}</h2>
          <ul>
            {quiz.answers.map((answer) => (
              <li key={answer.key}>
                <input
                  type="radio"
                  name={`quiz-${quiz.id}`}
                  value={answer.key}
                  checked={userAnswers[quiz.id] === answer.key}
                  onChange={(e) => handleAnswerChange(quiz.id, e.target.value)}
                />
                <span className="pl-4">{answer.text}</span>
              </li>
            ))}
          </ul>
          <button
            onClick={() => handleSubmit(quiz.id)}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
          >
            Submit Answer
          </button>
        </div>
      ))}
    </div>
  );
};

export default SubmitAnswer;