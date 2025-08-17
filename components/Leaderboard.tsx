"use client";
import { useState, useEffect } from "react";
import { database } from "@/util/firebaseConfig";
import { ref, onValue } from "firebase/database";
import { QuizQuestion, UserAnswer, UserScore } from "@/types";

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<UserScore[]>([]);
  const [questions, setQuestions] = useState<{ [key: string]: QuizQuestion }>(
    {}
  );
  const [userAnswers, setUserAnswers] = useState<{
    [key: string]: { [key: string]: UserAnswer };
  }>({});
  const [loading, setLoading] = useState(true);

  // Fetch all quiz questions
  useEffect(() => {
    const questionsRef = ref(database, "quiz");
    const unsubscribe = onValue(questionsRef, (snapshot) => {
      const fetchedQuestions: { [key: string]: QuizQuestion } = {};
      snapshot.forEach((childSnapshot) => {
        const questionData: QuizQuestion = childSnapshot.val();
        fetchedQuestions[childSnapshot.key!] = {
          ...questionData,
          id: childSnapshot.key!,
        };
      });
      setQuestions(fetchedQuestions);
    });
    return () => unsubscribe();
  }, []);

  // Fetch all user answers
  useEffect(() => {
    const userAnswersRef = ref(database, "UserAnswers");
    const unsubscribe = onValue(userAnswersRef, (snapshot) => {
      const fetchedAnswers: { [key: string]: { [key: string]: UserAnswer } } =
        {};
      snapshot.forEach((userSnapshot) => {
        const userEmail = userSnapshot.key!;
        fetchedAnswers[userEmail] = {};
        userSnapshot.forEach((answerSnapshot) => {
          const answerData: UserAnswer = answerSnapshot.val();
          fetchedAnswers[userEmail][answerSnapshot.key!] = answerData;
        });
      });
      setUserAnswers(fetchedAnswers);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Calculate scores whenever questions or answers change
  useEffect(() => {
    const scoresMap: { [key: string]: UserScore } = {};

    // Iterate through each user's answers to calculate scores
    for (const userEmail in userAnswers) {
      if (!scoresMap[userEmail]) {
        scoresMap[userEmail] = { userEmail, score: 0, lastAnswerTimestamp: 0 };
      }
      const answersForUser = userAnswers[userEmail];

      for (const questionId in answersForUser) {
        const userAnswer = answersForUser[questionId];
        const question = questions[questionId];

        if (question && userAnswer.answerId === question.rightAnswer) {
          scoresMap[userEmail].score++;

          // Ensure timestamp is a number before comparison
          const userTimestamp =
            typeof userAnswer.timestamp === "number" ? userAnswer.timestamp : 0;

          // Update the last correct answer timestamp for tie-breaking
          if (userTimestamp > (scoresMap[userEmail].lastAnswerTimestamp || 0)) {
            scoresMap[userEmail].lastAnswerTimestamp = userTimestamp;
          }
        }
      }
    }

    const scoreList: UserScore[] = Object.values(scoresMap);

    scoreList.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return (a.lastAnswerTimestamp || 0) - (b.lastAnswerTimestamp || 0);
    });

    setLeaderboard(scoreList);
  }, [questions, userAnswers]);

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500">
        Loading leaderboard...
      </div>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        No users have submitted answers yet.
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Live Leaderboard</h1>
      <ul className="divide-y divide-gray-200">
        {leaderboard.map((score, index) => (
          <li
            key={score.userEmail}
            className="text-lg p-2 flex justify-between items-center bg-gray-100/10 mb-2 rounded"
          >
            <div>
              <span className="font-semibold">
                {index + 1}. {score.userEmail.replace(/_/g, ".")}
              </span>
            </div>
            <div>
              <span className="font-semibold">Score: {score.score}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Leaderboard;
