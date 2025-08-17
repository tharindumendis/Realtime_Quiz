import AddQuiz from "@/components/AddQuiz";
import AdminActionPanel from "@/components/AdminActionPanael";
import AdminControl from "@/components/AdminControl";
import SubmitAnswer from "@/components/SubmitAnswer";

export default function Add() {
  return (
    <div className="flex flex-col items-center justify-center">
        <AdminControl/>
        <AddQuiz/>
        <AdminActionPanel/>
    </div>
  );
}