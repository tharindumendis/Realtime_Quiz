"use client";
import { useState } from "react";
import { database } from "@/util/firebaseConfig";
import { ref, push, serverTimestamp } from "firebase/database";
import { QuizQuestion, AnswerOption } from "@/types";

const AddQuiz = () => {
  const [question, setQuestion] = useState<string>("");
  const [answers, setAnswers] = useState<AnswerOption[]>([
    { key: 1, text: "" },
    { key: 2, text: "" },
    { key: 3, text: "" },
    { key: 4, text: "" },
  ]);
  const [rightAnswer, setRightAnswer] = useState<number>(1);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newQuiz: Omit<QuizQuestion, "id"> = {
      question,
      answers,
      rightAnswer,
      timestamp: serverTimestamp(),
    };

    try {
      const quizRef = ref(database, "quiz");
      push(quizRef, newQuiz);
      setQuestion("");
      setAnswers([
        { key: 1, text: "" },
        { key: 2, text: "" },
        { key: 3, text: "" },
        { key: 4, text: "" },
      ]);
      setRightAnswer(1);
      alert("Quiz added successfully!");
    } catch (error) {
      console.error("Error submitting quiz:", error);
    }
  };

  const handleSetAnswer = (value: string, ansKey: number) => {
    setAnswers((prevAnswers) =>
      prevAnswers.map((answer) =>
        answer.key === ansKey ? { ...answer, text: value } : answer
      )
    );
  };

  return (
    <div className="w-full p-8">
      <h3 className="text-xl mb-4">Add Quiz</h3>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Enter your question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="border p-2 rounded mb-6"
        />

        
        {answers.map((answer) => (
          <div className="grid grid-cols-10 w-full">
            <input
              className={`mr-4 w-8 accent-green-500`}
              type="radio"
              name="rightAnswer"
              value={answer.key}
              checked={rightAnswer === answer.key}
              onChange={(e) => setRightAnswer(parseInt(e.target.value))}
            />
            <input
              key={answer.key}
              type="text"
              placeholder={`Enter answer ${answer.key}`}
              value={answer.text}
              onChange={(e) => handleSetAnswer(e.target.value, answer.key)}
              className="border p-2 rounded w-full col-span-9"
            />
          </div>
        ))}
        {/* <div className="flex gap-4">
          {answers.map((answer) => (
            <label key={answer.key} className="flex items-center gap-1">
              <input
                type="radio"
                name="rightAnswer"
                value={answer.key}
                checked={rightAnswer === answer.key}
                onChange={(e) => setRightAnswer(parseInt(e.target.value))}
              />
              Correct Answer {answer.key}
            </label>
          ))}
        </div> */}
        <div className="w-full flex justify-center">
          <button
            type="submit"
            className="bg-blue-600 text-white p-2 rounded w-fit"
          >
            Submit Quiz
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddQuiz;
