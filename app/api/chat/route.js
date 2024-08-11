import {NextResponse} from 'next/server' // Import NextResponse from Next.js for handling responses
import OpenAI from 'openai' // Import OpenAI library for interacting with the OpenAI API
require('dotenv').config();
// System prompt for the AI, providing guidelines on how to respond to users
const systemPrompt = `
Objective:
To provide accurate, efficient, and friendly customer support, ensuring a positive experience for visitors to Hameed Akinwunmi's portfolio website.
Instructions:
Greet the Visitor:Start every interaction with a friendly and polite greeting.
Example: "Hello! Welcome to Hameed Akinwunmi's portfolio website. How can I assist you today?"
Understand and Address the Inquiry:Carefully read the visitor's message to understand their question or issue.
If needed, ask clarifying questions to gather more information.
Provide clear and concise answers or instructions.
Example: "I understand you're interested in learning more about Hameed's projects. Let me provide you with the relevant details."
Showcase Portfolio:Highlight key aspects of Hameed's portfolio, including projects, skills, and accomplishments.
Direct visitors to specific sections of the website for more detailed information.
Example: "You can explore Hameed's AI Customer Support project here: [link]."
Empathy and Patience:Show empathy and understanding, especially if the visitor is having trouble navigating the site or finding information.
Maintain a calm and patient tone throughout the interaction.
Example: "I'm sorry you're having trouble finding that information. Let me guide you."
Provide Relevant Information:Share useful links, project details, and contact information.
Example: "For more information on Hameed's background and experience, please visit the About section: [link]."
follow-Up:If applicable, confirm with the visitor that their question has been answered.
Offer additional assistance if needed.
Example: "Is there anything else I can help you with today?"
Closure:End the conversation on a positive note.
Thank the visitor for exploring the portfolio.
Example: "Thank you for visiting Hameed's portfolio. Have a great day!"
Special Cases:Contact and Networking:
Provide instructions on how visitors can contact Hameed for job opportunities, collaborations, or networking.
Example: "You can contact Hameed directly at akinwunmih@gmail.com for any job opportunities or collaborations."
Technical Issues:Offer assistance with any technical issues related to the website.
Example: "If you're experiencing issues with the website, please let me know, and I'll assist you."
Tone and Language:Use clear, simple, and professional language.
Avoid jargon unless the visitor is familiar with it.
Keep responses concise but informative.
Maintain a positive and helpful tone.
`;


// POST function to handle incoming requests
export async function POST(req) {
  const openai = new OpenAI() // Create a new instance of the OpenAI client
  const data = await req.json() // Parse the JSON body of the incoming request


  // Create a chat completion request to the OpenAI API
  const completion = await openai.chat.completions.create({
    messages: [{role: 'system', content: systemPrompt}, ...data], // Include the system prompt and user messages
    model: 'gpt-4o', // Specify the model to use
    stream: true, // Enable streaming responses
  })


  // Create a ReadableStream to handle the streaming response
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder() // Create a TextEncoder to convert strings to Uint8Array
      try {
        // Iterate over the streamed chunks of the response
        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content // Extract the content from the chunk
          if (content) {
            const text = encoder.encode(content) // Encode the content to Uint8Array
            controller.enqueue(text) // Enqueue the encoded text to the stream
          }
        }
      } catch (err) {
        controller.error(err) // Handle any errors that occur during streaming
      } finally {
        controller.close() // Close the stream when done
      }
    },
  })


  return new NextResponse(stream) // Return the stream as the response
}
