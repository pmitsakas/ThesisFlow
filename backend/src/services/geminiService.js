const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const generateWithRetry = async (model, prompt, maxRetries = 2) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      return result;
    } catch (error) {
      const is503 = error.status === 503 || error.message?.includes('503') || error.message?.includes('Service Unavailable');
      if (is503 && attempt < maxRetries) {
        await sleep(1000 * attempt);
        continue;
      }
      throw error;
    }
  }
};

const generateDissertationProposal = async (studentProfile, track) => {
  const prompt = buildPrompt(studentProfile, track);
  const modelNames = ['gemini-2.5-flash', 'gemini-2.5-flash-lite'];

  for (const modelName of modelNames) {
    try {
      console.log(`Trying model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await generateWithRetry(model, prompt);
      const text = result.response.text();

      const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/);
      const jsonText = jsonMatch ? jsonMatch[1] : text;
      const proposalData = JSON.parse(jsonText.trim());

      console.log('Model used:', modelName);
      console.log('Title:', proposalData.title);
      console.log('Description length:', proposalData.description?.length);

      return { success: true, data: proposalData };

    } catch (error) {
      const is503 = error.status === 503 || error.message?.includes('503') || error.message?.includes('Service Unavailable');
      if (is503 && modelName !== modelNames[modelNames.length - 1]) {
        console.log(`${modelName} unavailable, falling back to next model...`);
        continue;
      }
      console.error('Gemini API Error:', error);
      if (error.message?.includes('API key')) throw new Error('Invalid Gemini API key configuration');
      throw new Error('AI service is temporarily unavailable. Please try again in a moment.');
    }
  }
};

const buildPrompt = (studentProfile, track) => {
  const {
    advancedTopicsInterest = [],
    programmingLanguages = [],
    careerGoals = '',
    researchMethodology = '',
    difficultyLevel = '',
  } = studentProfile || {};

  const methodologyLabel = {
    theoretical: 'Research-focused (theoretical analysis, algorithms)',
    practical: 'Practical implementation (software development, systems)',
    mixed: 'Hybrid (theory combined with practical implementation)'
  }[researchMethodology] || 'Not specified';

  const difficultyLabel = {
    beginner: 'Standard (building on course knowledge)',
    intermediate: 'Intermediate (exploring new technologies)',
    advanced: 'Advanced (cutting-edge research & innovation)'
  }[difficultyLevel] || 'Intermediate';

  return `You are an expert academic advisor specializing in Computer Science dissertations.

Generate a personalized dissertation proposal based on the following student profile:

STUDENT PROFILE:
- Academic Track: ${track}
- Topics of Interest: ${advancedTopicsInterest.length > 0 ? advancedTopicsInterest.join(', ') : 'Not specified'}
- Programming Languages: ${programmingLanguages.length > 0 ? programmingLanguages.join(', ') : 'Not specified'}
- Project Style Preference: ${methodologyLabel}
- Difficulty Level: ${difficultyLabel}
- Goals: ${careerGoals || 'Not specified'}

REQUIREMENTS:
1. Create a dissertation title that is specific, engaging, and academically sound
2. The title must be between 10-200 characters
3. Provide a comprehensive description (under 1800 characters STRICT LIMIT) that includes:
   - Clear research objectives
   - Proposed methodology aligned with the student's project style preference
   - Expected outcomes
4. Match the difficulty level: ${difficultyLabel}
5. Use the student's programming languages where relevant
6. Make it relevant to the academic track: ${track}
7. Focus heavily on the student's topics of interest

RESPONSE FORMAT:
You MUST respond with a valid JSON object in this EXACT format (no additional text before or after):

\`\`\`json
{
  "title": "Your Generated Dissertation Title Here",
  "description": "Detailed description including objectives, methodology, and expected outcomes.",
  "keyTechnologies": ["Technology1", "Technology2", "Technology3"]
}
\`\`\`

IMPORTANT:
- The title must be between 10-200 characters
- The description MUST be under 1800 characters
- Be concise and focused — quality over quantity

Generate the proposal now:`;
};

module.exports = {
  generateDissertationProposal
};