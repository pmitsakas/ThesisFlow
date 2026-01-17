const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateDissertationProposal = async (studentProfile, track) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = buildPrompt(studentProfile, track);
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/);
    const jsonText = jsonMatch ? jsonMatch[1] : text;
    
    const proposalData = JSON.parse(jsonText.trim());
    console.log('Title:', proposalData.title);
    console.log('Description length:', proposalData.description?.length);
    console.log('Suggested Deadline:', proposalData.suggestedDeadline);
    
    return {
      success: true,
      data: proposalData
    };
    
  } catch (error) {
    console.error('Gemini API Error:', error);
    
    if (error.message.includes('API key')) {
      throw new Error('Invalid Gemini API key configuration');
    }
    
    throw new Error('Failed to generate dissertation proposal. Please try again.');
  }
};

const buildPrompt = (studentProfile, track) => {
  const {
    interests = [],
    preferredTopics = [],
    skills = [],
    programmingLanguages = [],
    careerGoals = '',
    previousExperience = '',
    researchMethodology = '',
    weeklyHours = 10,
    difficultyLevel = '',
    coreCoursesFavorites = [],
    advancedTopicsInterest = [],
    researchAreas = []
  } = studentProfile || {};

  return `You are an expert academic advisor specializing in Computer Science dissertations.

Generate a personalized dissertation proposal based on the following student profile:

STUDENT PROFILE:
- Academic Track: ${track}
- Core Courses Favorites: ${coreCoursesFavorites.length > 0 ? coreCoursesFavorites.join(', ') : 'Not specified'}
- Advanced Topics Interest: ${advancedTopicsInterest.length > 0 ? advancedTopicsInterest.join(', ') : 'Not specified'}
- Research Areas: ${researchAreas.length > 0 ? researchAreas.join(', ') : 'Not specified'}
- Interests: ${interests.length > 0 ? interests.join(', ') : 'Not specified'}
- Preferred Topics: ${preferredTopics.length > 0 ? preferredTopics.join(', ') : 'Not specified'}
- Technical Skills: ${skills.length > 0 ? skills.join(', ') : 'Not specified'}
- Programming Languages: ${programmingLanguages.length > 0 ? programmingLanguages.join(', ') : 'Not specified'}
- Career Goals: ${careerGoals || 'Not specified'}
- Previous Experience: ${previousExperience || 'Not specified'}
- Research Methodology Preference: ${researchMethodology || 'Not specified'}
- Available Hours/Week: ${weeklyHours}
- Difficulty Level: ${difficultyLevel || 'intermediate'}

REQUIREMENTS:
1. Create a dissertation title that is specific, engaging, and academically sound
2. The title must be between 10-200 characters
3. Provide a comprehensive description (under 1800 characters (STRICT LIMIT - count carefully!) , Be concise and focused - quality over quantity) that includes:
   - Clear research objectives
   - Proposed methodology
   - Expected outcomes
   
4. Ensure the proposal matches the student's skill level and available time
5. Make it relevant to the selected academic track: ${track}

RESPONSE FORMAT:
You MUST respond with a valid JSON object in this EXACT format (no additional text before or after):

\`\`\`json
{
  "title": "Your Generated Dissertation Title Here",
  "description": "Detailed description of the dissertation proposal including objectives, methodology, and expected outcomes.",
  "suggestedDeadline": "2025-12-31",
  "estimatedWorkload": "15 hours per week",
  "keyTechnologies": ["Technology1", "Technology2", "Technology3"]
}
\`\`\`

IMPORTANT: 
- The title must be between 10-200 characters
- The description MUST be under 1800 characters (STRICT LIMIT - count carefully!)
- Be concise and focused - quality over quantity
- Use the student's programming languages and skills in the methodology
- Align with their career goals and research methodology preference

Generate the proposal now:`;
};

module.exports = {
  generateDissertationProposal
};