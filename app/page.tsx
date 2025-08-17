import Image from "next/image";
import Link from "next/link";


export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center">
      <h1>Quiz App</h1>
      <Link href={"/add"}>Add Quiz</Link>
      <Link href={"/leaderboard"}>Leaderboard</Link>
      <Link href={"/submit"}>Submit Answer</Link>

    </div>
  );
}
