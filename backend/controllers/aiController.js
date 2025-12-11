import { GoogleGenAI } from "@google/genai";
import { questionAnswerPrompt , conceptExplainPrompt }  from "../utils/prompts.js";

// Feedback prompt for Gemini
const answerFeedbackPrompt = (question, userAnswer) => `
You are an expert interview evaluator. Analyze the following answer to the given question:

Question: "${question}"
User's Answer: "${userAnswer}"

Instructions:
- Evaluate if the answer is complete and correct.
- Point out missing details, errors, or improvements needed.
- Give a short summary of strengths and weaknesses.
- Return feedback as a valid JSON object:Search: "Google Gemini AI Node.js tutorial"Search: "Google Gemini AI Node.js tutorial"Search: "Google Gemini AI Node.js tutorial"
{
  "isComplete": true/false,
  "feedback": "Detailed feedback here."
}

Important: Only return valid JSON, no extra text.
`;

// console.log(process.env.GEMINI_API_KEY);
// AIzaSyD38ykT553ZjUJGQz47dBthuZdsVXVco0M

const ai = new GoogleGenAI({apiKey: "AIzaSyCJUPXGOcjw23Tt2BUwfKtiB8wt6MxqAm4"});

// Build prompt for an interview performance report
const interviewReportPrompt = (questions = [], userAnswers = {}, meta = {}) => {
  const { role = "", experience = "", topicsToFocus = "" } = meta;
  const qaPairs = questions
    .map((q, idx) => {
      const ua = userAnswers[idx] || "";
      return `Q${idx + 1}: ${q.question}\nExpected: ${q.answer}\nUser: ${ua || "(no answer)"}`;
    })
    .join("\n\n");

  return `You are an interview coach. Create a concise performance report.
Role: ${role}
Experience: ${experience}
Topics: ${topicsToFocus}

Q&A:
${qaPairs}

Return ONLY valid JSON in this shape:
{
  "summary": "2-3 sentence overall performance summary",
  "strengths": ["bullet strength", "bullet strength"],
  "improvements": ["bullet improvement", "bullet improvement"],
  "perQuestion": [
    {
      "question": "...",
      "verdict": "strong|okay|weak|skipped",
      "feedback": "one-sentence actionable note"
    }
  ]
}
No extra text. Valid JSON only.`;
};



const generateInterviewQuestions = async(req , res) =>{
    //  console.log("generateInterviewQuestions called with body:", req.body);

    try {
        const{role , experience , topicsToFocus,numberOfquestions} = req.body ;
        if(!role || !experience || !topicsToFocus || !numberOfquestions){
            return res.status(400).json({message:"Missing required fields"});
        }
       
        const prompt = questionAnswerPrompt(role , experience , topicsToFocus , numberOfquestions);
        // console.log(prompt);

        const response = await ai.models.generateContent({
            model : "gemini-2.5-flash",
            contents: prompt ,
        });

        // console.log("Raw response from Gemini:", response);
        
        
        // return res.status(200).json(response);//
        // Extract text from the response correctly
        let rawText = response.candidates[0].content.parts[0].text;
        // console.log("Raw response text:", response.candidates);
        // console.log("Raw response text:", response.candidates[0]);
        // console.log("Raw response text:", response.candidates[0].content);
        // console.log("Raw response text:", response.candidates[0].content.parts);
        // console.log("Raw response text:", rawText);
        

        // Remove markdown code blocks more reliably
        const cleanedText = rawText
        .replace(/^```json\s*/m, "")  // Remove opening ```json
        .replace(/^```\s*/m, "")       // Remove opening ``` if no json
        .replace(/```\s*$/m, "")       // Remove closing ```
        .trim(); //remove extra spaces

        // console.log("Cleaned text:", cleanedText.questions);

        // Parse response (can be array or { questions: [] })
        const parsed = JSON.parse(cleanedText);
        // console.log("Parsed questions:", parsed);

        const questions = Array.isArray(parsed) ? parsed : parsed?.questions;

        if (!questions || !Array.isArray(questions) || questions.length === 0) {
          return res.status(500).json({ message: "AI did not return questions" });
        }

        // Normalize fields
        const normalized = questions.map((q, idx) => ({
          id: q.id || idx + 1,
          question: q.question || "",
          answer: q.answer || q.expected_answer || q.expectedAnswer || "",
          topic: q.topic || "",
          difficulty: q.difficulty || "",
        }));

        // console.log("Normalized questions:", normalized);
        // console.log("Parsed questions count:", normalized.length);
        return res.status(200).json(normalized);
    } catch (error) {
      console.log(error);
       return res.status(500).json({
        message : "Failed to generate questions" ,
        error: error.message ,
       }); 
    }
};



const generateConceptExplanation = async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const prompt = conceptExplainPrompt(question);

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
    });

    // console.log("Raw response from Gemini:", response);

    // Extract text from the response correctly
    let rawText = response.candidates[0].content.parts[0].text;

    // console.log("Raw response text:", rawText);

    // Remove markdown code blocks more reliably
    const cleanedText = rawText
      .replace(/^```json\s*/m, "")  // Remove opening ```json
      .replace(/^```\s*/m, "")       // Remove opening ``` if no json
      .replace(/```\s*$/m, "")       // Remove closing ```
      .trim(); // remove extra spaces

    // console.log("Cleaned text:", cleanedText);

    const data = JSON.parse(cleanedText);

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      message: "Failed to generate questions",
      error: error.message,
    });
  }
};




const generateAnswerFeedback = async (req, res) => {
  try {
    const { question, answer } = req.body;
    if (!question || !answer) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const prompt = answerFeedbackPrompt(question, answer);
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    
    // Extract text from the response correctly
    let rawText = response.candidates[0].content.parts[0].text;
    
    let feedbackData;
    try {
      // Remove markdown code blocks more reliably
      const cleanedText = rawText
        .replace(/^```json\s*/m, "")  // Remove opening ```json
        .replace(/^```\s*/m, "")       // Remove opening ``` if no json
        .replace(/```\s*$/m, "")       // Remove closing ```
        .trim();
      feedbackData = JSON.parse(cleanedText);
    } catch (err) {
      // If parsing fails or response is empty, return fallback feedback
      feedbackData = {
        isComplete: false,
        feedback: "AI could not analyze your answer. Please try to provide more details or rephrase your response."
      };
    }
    // If feedback is empty, also fallback
    if (!feedbackData || !feedbackData.feedback) {
      feedbackData = {
        isComplete: false,
        feedback: "No feedback received from AI. Please try again with a more detailed answer."
      };
    }
    res.status(200).json(feedbackData);
  } catch (error) {
    res.status(200).json({
      isComplete: false,
      feedback: "AI feedback could not be generated. Please try again later."
    });
  }
};



const generateInterviewReport = async (req, res) => {
  try {
    const { questions, userAnswers, role, experience, topicsToFocus } = req.body;
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: "Questions are required" });
    }

    const prompt = interviewReportPrompt(questions, userAnswers || {}, { role, experience, topicsToFocus });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    let rawText = response.candidates?.[0]?.content?.parts?.[0]?.text || "";
    let parsed;
    try {
      const cleaned = rawText
        .replace(/^```json\s*/m, "")
        .replace(/^```\s*/m, "")
        .replace(/```\s*$/m, "")
        .trim();
      parsed = JSON.parse(cleaned);
    } catch (err) {
      return res.status(200).json({
        summary: "Could not generate structured report.",
        strengths: [],
        improvements: [],
        perQuestion: [],
      });
    }

    return res.status(200).json(parsed);
  } catch (error) {
    return res.status(500).json({ message: "Failed to generate report", error: error.message });
  }
};

export{
  generateInterviewQuestions,
  generateConceptExplanation,
  generateAnswerFeedback,
  generateInterviewReport
};