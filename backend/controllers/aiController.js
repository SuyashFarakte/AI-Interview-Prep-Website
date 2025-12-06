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

console.log(process.env.GEMINI_API_KEY);

const ai = new GoogleGenAI({apiKey: "AIzaSyA4UEy8-SiHSV-IsL7L-7flrz3hea2fqD8"});

//@desc Generate interview Questions and answers using Gemini
//@route POST /api/ai/generate-questions
//@access Private                                        
const generateInterviewQuestions = async(req , res) =>{
     console.log("generateInterviewQuestions called with body:", req.body);

    try {
        const{role , experience , topicsToFocus,numberOfquestions} = req.body ;
        if(!role || !experience || !topicsToFocus || !numberOfquestions){
            return res.status(400).json({message:"Missing required fields"});
        }
       
        const prompt = questionAnswerPrompt(role , experience , topicsToFocus , numberOfquestions);
        console.log(prompt);

        const response = await ai.models.generateContent({
            model : "gemini-2.5-flash",
            contents: prompt ,
        });

        console.log("Raw response from Gemini:", response);
        
        // Extract text from the response correctly
        let rawText = response.candidates[0].content.parts[0].text;

        console.log("Raw response text:", rawText);
        
        // Remove markdown code blocks more reliably
        const cleanedText = rawText
        .replace(/^```json\s*/m, "")  // Remove opening ```json
        .replace(/^```\s*/m, "")       // Remove opening ``` if no json
        .replace(/```\s*$/m, "")       // Remove closing ```
        .trim(); //remove extra spaces

        console.log("Cleaned text:", cleanedText);

        //now parsing
        const data = JSON.parse(cleanedText);

        console.log("Parsed data:", data.questions);
        return res.status(200).json(data.questions);
    } catch (error) {
      console.log(error)
       res.status(500).json({
        message : "Failed to generate questions" ,
        error: error.message ,
       }); 
    }
};
//@desc Generate explains a interview question
//@route POST /api/ai/generate-explanation
//@access Private
const generateConceptExplanation = async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const prompt = conceptExplainPrompt(question);

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    console.log("Raw response from Gemini:", response);

    // Extract text from the response correctly
    let rawText = response.candidates[0].content.parts[0].text;

    console.log("Raw response text:", rawText);

    // Remove markdown code blocks more reliably
    const cleanedText = rawText
      .replace(/^```json\s*/m, "")  // Remove opening ```json
      .replace(/^```\s*/m, "")       // Remove opening ``` if no json
      .replace(/```\s*$/m, "")       // Remove closing ```
      .trim(); // remove extra spaces

    console.log("Cleaned text:", cleanedText);

    const data = JSON.parse(cleanedText);

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      message: "Failed to generate questions",
      error: error.message,
    });
  }
};



// @desc Analyze user answer and provide AI feedback
// @route POST /api/ai/answer-feedback
// @access Private
const generateAnswerFeedback = async (req, res) => {
  try {
    const { question, answer } = req.body;
    if (!question || !answer) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const prompt = answerFeedbackPrompt(question, answer);
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-lite",
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

export{
  generateInterviewQuestions,
  generateConceptExplanation,
  generateAnswerFeedback
};