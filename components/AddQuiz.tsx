// "use client";
// import { useState } from "react";
// import { database } from "@/util/firebaseConfig";
// import { ref, push, serverTimestamp } from "firebase/database";
// import { QuizQuestion, AnswerOption } from "@/types";

// const AddQuiz = () => {
//   const [question, setQuestion] = useState<string>("");
//   const [answers, setAnswers] = useState<AnswerOption[]>([
//     { key: 1, text: "" },
//     { key: 2, text: "" },
//     { key: 3, text: "" },
//     { key: 4, text: "" },
//   ]);
//   const [rightAnswer, setRightAnswer] = useState<number>(1);

//   const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();

//     const newQuiz: Omit<QuizQuestion, "id"> = {
//       question,
//       answers,
//       rightAnswer,
//       timestamp: serverTimestamp(),
//     };

//     try {
//       const quizRef = ref(database, "quiz");
//       push(quizRef, newQuiz);
//       setQuestion("");
//       setAnswers([
//         { key: 1, text: "" },
//         { key: 2, text: "" },
//         { key: 3, text: "" },
//         { key: 4, text: "" },
//       ]);
//       setRightAnswer(1);
//       alert("Quiz added successfully!");
//     } catch (error) {
//       console.error("Error submitting quiz:", error);
//     }
//   };

//   const handleSetAnswer = (value: string, ansKey: number) => {
//     setAnswers((prevAnswers) =>
//       prevAnswers.map((answer) =>
//         answer.key === ansKey ? { ...answer, text: value } : answer
//       )
//     );
//   };

//   return (
//     <div className="w-full p-8">
//       <h3 className="text-xl mb-4">Add Quiz</h3>
//       <form onSubmit={handleSubmit} className="flex flex-col gap-4">
//         <input
//           type="text"
//           placeholder="Enter your question"
//           value={question}
//           onChange={(e) => setQuestion(e.target.value)}
//           className="border p-2 rounded mb-6"
//         />

//         {answers.map((answer) => (
//           <div className="grid grid-cols-10 w-full">
//             <input
//               className={`mr-4 w-8 accent-green-500`}
//               type="radio"
//               name="rightAnswer"
//               value={answer.key}
//               checked={rightAnswer === answer.key}
//               onChange={(e) => setRightAnswer(parseInt(e.target.value))}
//             />
//             <input
//               key={answer.key}
//               type="text"
//               placeholder={`Enter answer ${answer.key}`}
//               value={answer.text}
//               onChange={(e) => handleSetAnswer(e.target.value, answer.key)}
//               className="border p-2 rounded w-full col-span-9"
//             />
//           </div>
//         ))}
//         {/* <div className="flex gap-4">
//           {answers.map((answer) => (
//             <label key={answer.key} className="flex items-center gap-1">
//               <input
//                 type="radio"
//                 name="rightAnswer"
//                 value={answer.key}
//                 checked={rightAnswer === answer.key}
//                 onChange={(e) => setRightAnswer(parseInt(e.target.value))}
//               />
//               Correct Answer {answer.key}
//             </label>
//           ))}
//         </div> */}
//         <div className="w-full flex justify-center">
//           <button
//             type="submit"
//             className="bg-blue-600 text-white p-2 rounded w-fit"
//           >
//             Submit Quiz
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default AddQuiz;

// "use client";
// import { useState } from "react";
// import { database } from "@/util/firebaseConfig";
// import { ref, push, serverTimestamp } from "firebase/database";
// import { QuizQuestion, AnswerOption } from "@/types"; // Ensure these types are correct

// const initialAnswers: AnswerOption[] = [
//   { key: 1, text: "" },
//   { key: 2, text: "" },
//   { key: 3, text: "" },
//   { key: 4, text: "" },
// ];

// const AddQuiz = () => {
//   const [question, setQuestion] = useState<string>("");
//   const [answers, setAnswers] = useState<AnswerOption[]>(initialAnswers);
//   const [rightAnswer, setRightAnswer] = useState<number>(1);
//   const [topic, setTopic] = useState<string>(""); // New state for AI topic
//   const [isLoading, setIsLoading] = useState<boolean>(false); // New loading state

//   // Helper function to submit any quiz data (manual or AI-generated)
//   const submitQuizToFirebase = (quizData: Omit<QuizQuestion, "id">) => {
//     try {
//       const quizRef = ref(database, "quiz");
//       push(quizRef, quizData);

//       // Reset states
//       setQuestion("");
//       setAnswers(initialAnswers.map((ans) => ({ ...ans, text: "" })));
//       setRightAnswer(1);
//       setTopic("");

//       alert("Quiz added successfully!");
//     } catch (error) {
//       console.error("Error submitting quiz:", error);
//       alert("Failed to submit quiz.");
//     }
//   };

//   // Handler for manual form submission (existing logic)
//   const handleManualSubmit = (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     const newQuiz: Omit<QuizQuestion, "id"> = {
//       question,
//       answers,
//       rightAnswer,
//       // @ts-ignore - serverTimestamp is a special Firebase value
//       timestamp: serverTimestamp(),
//     };
//     submitQuizToFirebase(newQuiz);
//   };

//   // Function to call the AI backend and submit the result
//   const handleAIGenerate = async () => {
//     if (!topic.trim()) {
//       alert("Please enter a topic for the AI to generate a quiz.");
//       return;
//     }

//     setIsLoading(true);

//     try {
//       // 1. Call the Next.js API endpoint
//       const response = await fetch("/api/generateQuiz", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ topic }),
//       });

//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }

//       // The AI-generated data is returned as JSON
//       const aiQuizData = await response.json();

//       // 2. Format the AI data for Firebase submission
//       const newQuiz: Omit<QuizQuestion, "id"> = {
//         question: aiQuizData.question,
//         answers: aiQuizData.answers.map((ans: any) => ({
//           key: ans.key,
//           text: ans.text,
//         })) as AnswerOption[],
//         rightAnswer: aiQuizData.rightAnswer,
//         // @ts-ignore - serverTimestamp is a special Firebase value
//         timestamp: serverTimestamp(),
//       };

//       // 3. Submit to Firebase
//       submitQuizToFirebase(newQuiz);
//     } catch (error) {
//       console.error("Error generating or submitting AI quiz:", error);
//       alert("Failed to generate quiz from AI.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleSetAnswer = (value: string, ansKey: number) => {
//     setAnswers((prevAnswers) =>
//       prevAnswers.map((answer) =>
//         answer.key === ansKey ? { ...answer, text: value } : answer
//       )
//     );
//   };

//   return (
//     <div className="w-full p-8">
//       <h3 className="text-xl mb-4">Add Quiz</h3>

//       {/* ------------------------------------- */}
//       {/* AI GENERATION SECTION */}
//       {/* ------------------------------------- */}
//       <div className="mb-8 border p-4 rounded-lg bg-gray-50 text-black">
//         <h4 className="text-lg mb-2">🤖 Generate Quiz with AI</h4>
//         <input
//           type="text"
//           placeholder="Enter quiz topic (e.g., 'React Hooks')"
//           value={topic}
//           onChange={(e) => setTopic(e.target.value)}
//           className="border p-2 rounded w-full mb-2"
//           disabled={isLoading}
//         />
//         <button
//           onClick={handleAIGenerate}
//           className="bg-purple-600 text-white p-2 rounded w-full hover:bg-purple-700 disabled:opacity-50"
//           disabled={isLoading}
//         >
//           {isLoading ? "Generating..." : "Generate & Submit AI Quiz"}
//         </button>
//       </div>

//       <h3 className="text-xl mb-4">Or Add Manually</h3>

//       {/* ------------------------------------- */}
//       {/* MANUAL FORM SECTION (Your existing form) */}
//       {/* ------------------------------------- */}
//       <form onSubmit={handleManualSubmit} className="flex flex-col gap-4">
//         <input
//           type="text"
//           placeholder="Enter your question"
//           value={question}
//           onChange={(e) => setQuestion(e.target.value)}
//           className="border p-2 rounded mb-6"
//           disabled={isLoading}
//         />

//         {answers.map((answer) => (
//           <div key={answer.key} className="grid grid-cols-10 w-full">
//             <input
//               className={`mr-4 w-8 accent-green-500`}
//               type="radio"
//               name="rightAnswer"
//               value={answer.key}
//               checked={rightAnswer === answer.key}
//               onChange={(e) => setRightAnswer(parseInt(e.target.value))}
//               disabled={isLoading}
//             />
//             <input
//               type="text"
//               placeholder={`Enter answer ${answer.key}`}
//               value={answer.text}
//               onChange={(e) => handleSetAnswer(e.target.value, answer.key)}
//               className="border p-2 rounded w-full col-span-9"
//               disabled={isLoading}
//             />
//           </div>
//         ))}

//         <div className="w-full flex justify-center">
//           <button
//             type="submit"
//             className="bg-blue-600 text-white p-2 rounded w-fit disabled:opacity-50"
//             disabled={isLoading}
//           >
//             Submit Manual Quiz
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default AddQuiz;

"use client";
import { useState } from "react";
import { database } from "@/util/firebaseConfig";
import { ref, push, serverTimestamp } from "firebase/database";
import { QuizQuestion, AnswerOption } from "@/types"; 

const initialAnswers: AnswerOption[] = [
  { key: 1, text: "" },
  { key: 2, text: "" },
  { key: 3, text: "" },
  { key: 4, text: "" },
];

const AddQuiz = () => {
  const [question, setQuestion] = useState<string>("");
  const [answers, setAnswers] = useState<AnswerOption[]>(initialAnswers);
  const [rightAnswer, setRightAnswer] = useState<number>(1);
  const [topic, setTopic] = useState<string>(""); 
  const [isLoading, setIsLoading] = useState<boolean>(false); 
  const [isQuizGenerated, setIsQuizGenerated] = useState<boolean>(false); // New state to track if AI quiz is ready

  // Helper function to submit quiz data (used by both manual and generated forms)
  const submitQuizToFirebase = (quizData: Omit<QuizQuestion, "id">) => {
    try {
      const quizRef = ref(database, "quiz");
      push(quizRef, quizData);
      
      // Reset states
      setQuestion("");
      setAnswers(initialAnswers.map(ans => ({ ...ans, text: "" })));
      setRightAnswer(1);
      setTopic("");
      setIsQuizGenerated(false); // Reset generated state after submission
      
      alert("Quiz added successfully!");
    } catch (error) {
      console.error("Error submitting quiz:", error);
      alert("Failed to submit quiz.");
    }
  };

  // Handler for manual form submission (now handles both manual and AI-filled data)
  const handleFinalSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newQuiz: Omit<QuizQuestion, "id"> = {
      question,
      answers,
      rightAnswer,
      // @ts-ignore - serverTimestamp is a special Firebase value
      timestamp: serverTimestamp(), 
    };
    submitQuizToFirebase(newQuiz);
  };
  
  // Function to call the AI backend and FILL THE FORM STATE
  const handleAIGenerate = async () => {
    if (!topic.trim()) {
      alert("Please enter a topic for the AI to generate a quiz.");
      return;
    }

    setIsLoading(true);
    setIsQuizGenerated(false); // Reset before generation
    
    try {
      const response = await fetch("/api/generateQuiz", { 
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ topic }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const aiQuizData = await response.json(); 

      // 🚨 KEY CHANGE: Populate the component state instead of submitting
      setQuestion(aiQuizData.question);
      setAnswers(aiQuizData.answers.map((ans: any) => ({
             key: ans.key,
             text: ans.text,
        })));
      setRightAnswer(aiQuizData.rightAnswer);
      
      // Indicate that a quiz has been generated and is ready for review/submission
      setIsQuizGenerated(true); 
      alert("Quiz generated successfully! Please review and click 'Submit Quiz' below.");

    } catch (error) {
      console.error("Error generating AI quiz:", error);
      alert("Failed to generate quiz from AI.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetAnswer = (value: string, ansKey: number) => {
    setAnswers((prevAnswers) =>
      prevAnswers.map((answer) =>
        answer.key === ansKey ? { ...answer, text: value } : answer
      )
    );
  };

  // Determine the button text based on the state
  const submitButtonText = isQuizGenerated ? "Submit Generated Quiz" : "Submit Manual Quiz";
  const submitButtonColor = isQuizGenerated ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700";

  return (
    <div className="w-full p-8">
      <h3 className="text-xl mb-4">Add Quiz</h3>
      
      {/* ------------------------------------- */}
      {/* AI GENERATION SECTION */}
      {/* ------------------------------------- */}
      <div className="mb-8 border p-4 rounded-lg ">
          <h4 className="text-lg mb-2">🤖 Generate Quiz with AI</h4>
          <input
              type="text"
              placeholder="Enter quiz topic (e.g., 'React Hooks')"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="border p-2 rounded w-full mb-2"
              disabled={isLoading}
          />
          <button
              onClick={handleAIGenerate}
              className="bg-purple-600 text-white p-2 rounded w-full hover:bg-purple-700 disabled:opacity-50"
              disabled={isLoading}
          >
              {isLoading ? "Generating..." : "Generate Quiz"}
          </button>
      </div>

      <h3 className="text-xl mb-4">Review & Submit Quiz</h3>
      
      {/* ------------------------------------- */}
      {/* MANUAL/GENERATED FORM SECTION */}
      {/* ------------------------------------- */}
      <form onSubmit={handleFinalSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Enter your question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="border p-2 rounded mb-6"
          disabled={isLoading}
        />
        
        {answers.map((answer) => (
          <div key={answer.key} className="grid grid-cols-10 w-full">
            <input
              className={`mr-4 w-8 accent-green-500`}
              type="radio"
              name="rightAnswer"
              value={answer.key}
              checked={rightAnswer === answer.key}
              onChange={(e) => setRightAnswer(parseInt(e.target.value))}
              disabled={isLoading}
            />
            <input
              type="text"
              placeholder={`Enter answer ${answer.key}`}
              value={answer.text}
              onChange={(e) => handleSetAnswer(e.target.value, answer.key)}
              className="border p-2 rounded w-full col-span-9"
              disabled={isLoading}
            />
          </div>
        ))}

        <div className="w-full flex justify-center">
          <button
            type="submit"
            className={`${submitButtonColor} text-white p-2 rounded w-fit disabled:opacity-50 transition-colors duration-200`}
            disabled={isLoading}
          >
            {submitButtonText}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddQuiz;
