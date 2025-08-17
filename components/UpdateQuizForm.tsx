import { useState } from 'react';
import { QuizQuestion } from '@/types';

interface UpdateQuizFormProps {
  quiz: QuizQuestion;
  onUpdate: (updatedQuiz: QuizQuestion) => void;
}

const UpdateQuizForm = ({ quiz, onUpdate }: UpdateQuizFormProps) => {
  const [questionText, setQuestionText] = useState(quiz.question);
  const [answers, setAnswers] = useState(quiz.answers);
  const [rightAnswer, setRightAnswer] = useState(quiz.rightAnswer);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onUpdate({
      ...quiz,
      question: questionText,
      answers: answers,
      rightAnswer: rightAnswer,
    });
  };

  const handleSetAnswer = (value: string, key: number) => {
    setAnswers((prevAnswers) =>
      prevAnswers.map((answer) =>
        answer.key === key ? { ...answer, text: value } : answer
      )
    );
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3 className="text-xl font-bold mb-4">Update Quiz</h3>
      <input
        type="text"
        value={questionText}
        onChange={(e) => setQuestionText(e.target.value)}
        className="w-full p-2 border rounded mb-2"
      />
      {answers.map((answer) => (
        <input
          key={answer.key}
          type="text"
          placeholder={`Enter answer ${answer.key}`}
          value={answer.text}
          onChange={(e) => handleSetAnswer(e.target.value, answer.key)}
          className="w-full p-2 border rounded mb-1"
        />
      ))}
      <div className="mt-4">
        <label className="block mb-2 font-semibold">Correct Answer</label>
        <div className='w-full flex flex-row justify-around'>
        {answers.map((answer) => (
          <label key={answer.key} className="mr-4">
            <input
              type="radio"
              name="rightAnswer"
              value={answer.key}
              checked={rightAnswer === answer.key}
              onChange={(e) => setRightAnswer(parseInt(e.target.value))}
            />
            <span>{` ${answer.key}`}</span>
            
          </label>
        ))}</div>
      </div>
      <button type="submit" className="mt-4 bg-blue-500 text-white p-2 rounded">
        Update
      </button>
    </form>
  );
};

export default UpdateQuizForm;