import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini client
const genAIPlugin = () => {
  if (!process.env.GEMINI_API_KEY) {
     console.warn("GEMINI_API_KEY missing - AI features will fail silently");
  }
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "empty");
}

export const suggestFilename = async (
  originalFilename: string, 
  mimeType: string, 
  thumbnailBase64?: string | null, 
  textSnippet?: string | null
) => {
  try {
    const genAI = genAIPlugin();
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    let prompt = `Given a file named '${originalFilename}' of type ${mimeType}, suggest a short descriptive filename (max 6 words, no extension). Reply with only the base filename, nothing else.`;
    
    if (textSnippet) {
      prompt += `\nHere is a text snippet from the file to help you understand its content:\n"${textSnippet}"`;
    }
    
    const contentParts: any = [{ text: prompt }];

    if (thumbnailBase64) {
       // Prepare the inline data object
       contentParts.push({
         inlineData: {
           data: thumbnailBase64.replace(/^data:image\/\w+;base64,/, ""), // Strip the base64 prefix
           mimeType: mimeType
         }
       });
    }

    const result = await model.generateContent(contentParts);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error("Gemini API error:", error);
    return null; // As per requirements, fail gracefully.
  }
};
