import React, { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import moment from "moment";
import { LuCircleAlert, LuListCollapse, LuPlay } from "react-icons/lu";
import SpinnerLoader from "../../components/Loader/SpinnerLoader";
import { toast } from "react-hot-toast";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import RoleInfoHeader from './components/RoleInfoHeader';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import InterviewSimulator from './components/InterviewSimulator';

const InterviewPrep = () => {
  const { sessionId } = useParams();
  const [sessionData, setSessionData] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [isUpdateLoader, setIsUpdateLoader] = useState(false);
  const [isInterviewMode, setIsInterviewMode] = useState(false);

  // Fetch session data by session id
  const fetchSessionDetailsById = async () => {
    try {
      const response = await axiosInstance.get(
        API_PATHS.SESSION.GET_ONE(sessionId)
      );
      if (response.data && response.data.session) {
        setSessionData(response.data.session);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Add more questions to a session
const uploadMoreQuestions = async () => {
  try {
    setIsUpdateLoader(true);
    setErrorMsg(""); // Clear any previous errors
    
    // console.log("Starting to generate questions...");
    
    // Generate questions from AI
    const aiResponse = await axiosInstance.post(
      API_PATHS.AI.GENERATE_QUESTIONS,
      {
        role: sessionData?.role,
        experience: sessionData?.experience,
        topicsToFocus: sessionData?.topicsToFocus,
        numberOfquestions: 3,
      }
    );
    
    // console.log("AI Response:", aiResponse.data);
    const generatedQuestions = aiResponse.data;

    // Validate that we got questions
    if (!generatedQuestions || !Array.isArray(generatedQuestions) || generatedQuestions.length === 0) {
      setErrorMsg("No questions were generated. Please try again.");
      return;
    }

    // console.log("Adding questions to session...");
    
    // Add questions to session
    const addQuestionsResponse = await axiosInstance.post(
      API_PATHS.QUESTION.ADD_TO_SESSION,
      {
        sessionId,
        questions: generatedQuestions, // Changed from 'question' to 'questions'
      }
    );
    
    // console.log("Add Questions Response:", addQuestionsResponse.data);
    
    // Check if questions were added successfully
    if (addQuestionsResponse.data.success) {
      const questionsCount = addQuestionsResponse.data.createdQuestions?.length || 0;
      toast.success(`Added ${questionsCount} More Q&A!`);
      // console.log("Refreshing session data...");
      // Refresh session data to show new questions
      await fetchSessionDetailsById();
    } else {
      setErrorMsg("Failed to add questions to session.");
    }
  } catch (error) {
    console.error("Error adding questions:", error);
    
    // More detailed error handling
    if (error.response) {
      console.error("Error response:", error.response.data);
      console.error("Full error details:", error.response);
      console.error("Error message:", error.response.data.message);
      const errorMessage = error.response.data?.message || error.response.data?.error || "Server error occurred";
      setErrorMsg(errorMessage);
    } else if (error.request) {
      console.error("Network error:", error.request);
      setErrorMsg("Network error. Please check your connection.");
    } else {
      console.error("Error:", error.message);
      setErrorMsg("Something went wrong. Please try again.");
    }
  } finally {
    setIsUpdateLoader(false);
  }
};

  useEffect(() => {
    if (sessionId) {
      fetchSessionDetailsById();
    }
    return () => {}
  }, []);

  return (
    <DashboardLayout>
      {/* Interview Mode View */}
      {isInterviewMode && sessionData?.questions?.length > 0 ? (
        <InterviewSimulator
          questions={sessionData.questions}
          sessionData={sessionData}
          onExit={() => setIsInterviewMode(false)}
        />
      ) : (
        <div>
          <div className="pl-6 sm:pl-10 md:pl-16 lg:px-0">
            <RoleInfoHeader
              role={sessionData?.role || ""}
              topicsToFocus={sessionData?.topicsToFocus || ""}
              experience={sessionData?.experience || "-"}
              questions={sessionData?.questions?.length || "-"}
              description={sessionData?.description || ""}
              lastUpdated={
                sessionData?.updatedAt
                  ? moment(sessionData.updatedAt).format("Do MMM YYYY")
                  : ""
              }
            />
          </div>

          <div className="max-w-5xl mx-auto pt-6 pb-8 px-4 sm:px-6 md:px-0">
            <div className="bg-white/80 backdrop-blur shadow-xl border border-gray-100 rounded-2xl p-8 flex flex-col gap-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-wide text-gray-500 font-semibold mb-1">
                    Interview Simulation Ready
                  </p>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Practice one question at a time with our interviewer
                  </h2>
                  <p className="text-gray-600 mt-2 max-w-2xl">
                    We will present each question sequentially, speak it aloud, and collect your response before moving on. When you finish, you will get an auto-generated report.
                  </p>
                </div>
                <div className="flex items-center gap-3 self-start md:self-auto">
                  <div className="rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 text-white w-14 h-14 flex items-center justify-center text-xl font-semibold shadow-lg">
                    AI
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Interviewer</p>
                    <p className="text-sm font-semibold text-gray-800">Virtual Coach</p>
                    <p className="text-xs text-gray-500">Ready to start</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                  <p className="text-xs text-indigo-700 uppercase tracking-wide">Questions</p>
                  <p className="text-2xl font-bold text-indigo-900">{sessionData?.questions?.length || 0}</p>
                </div>
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                  <p className="text-xs text-emerald-700 uppercase tracking-wide">Experience</p>
                  <p className="text-2xl font-bold text-emerald-900">{sessionData?.experience || "-"} yrs</p>
                </div>
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
                  <p className="text-xs text-amber-700 uppercase tracking-wide">Focus</p>
                  <p className="text-sm font-semibold text-amber-900 line-clamp-2">
                    {sessionData?.topicsToFocus || "General"}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <button
                  className='flex items-center gap-3 text-sm text-white font-medium bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-3 rounded hover:shadow-lg transition-all duration-300'
                  onClick={() => setIsInterviewMode(true)}
                  disabled={!sessionData?.questions?.length}
                >
                  <LuPlay className='text-lg' /> Start Interview Simulation
                </button>
                <button
                  className='flex items-center gap-3 text-sm font-medium px-4 py-2 rounded border border-gray-200 text-gray-700 hover:border-gray-300 hover:shadow-sm transition'
                  onClick={uploadMoreQuestions}
                  disabled={isUpdateLoader}
                >
                  {isUpdateLoader ? <SpinnerLoader /> : <LuListCollapse className='text-lg' />} Generate more questions
                </button>
                {errorMsg && (
                  <p className='flex items-center gap-2 text-sm text-amber-600 font-medium'>
                    <LuCircleAlert className='text-base' /> {errorMsg}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default InterviewPrep;
