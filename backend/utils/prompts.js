const questionAnswerPrompt = (role, experience, topicsToFocus, numberOfQuestions) => `
You are an AI trained to generate technical interview questions and answers.

{
  "role": "${role}",
  "experience": "${experience}",
  "topicsToFocus": ${JSON.stringify(topicsToFocus)},
  "numberOfQuestions": ${numberOfQuestions}
}

Important:
 Do NOT add any extra text outside the JSON format. Only return valid JSON.
`;

const conceptExplainPrompt = (question) => `
You are an AI trained to generate explanations for a given interview question.

{
  "title": "${question || 'Short Title here ?'}",
  "explanation": "Write a comprehensive multi-paragraph explanation covering all aspects of this concept with examples and practical insights."
}
`;

export { questionAnswerPrompt, conceptExplainPrompt };
