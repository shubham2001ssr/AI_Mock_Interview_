import { generateText } from "ai";
import { google } from "@ai-sdk/google";

import { db } from "@/firebase/admin";
import { getRandomInterviewCover } from "@/lib/utils";

export async function POST(request: Request) {
  // Vapi likely sends 'techstack' based on existing configuration, so we handle both
  const { type, role, level, focusAreas, techstack, amount, userid } = await request.json();

  const topics = focusAreas || techstack;

  try {
    const { text: questions } = await generateText({
      model: google("gemini-2.0-flash-001"),
      prompt: `Prepare questions for a professional job interview.
        The job role is ${role}.
        The job experience level is ${level}.
        The focus areas/topics for the interview are: ${topics}.
        The interview type is: ${type}.
        The amount of questions required is: ${amount}.
        
        Please return only the questions, without any additional text.
        The questions are going to be read by a voice assistant so do not use "/" or "*" or any other special characters which might break the voice assistant.
        
        Guidelines based on interview type:
        
        ${type === "Technical Coding" || type === "Data Structures & Algorithms" ? `
        - Provide coding problems with clear problem statements
        - Focus on ${topics} concepts
        - Include questions on time and space complexity analysis
        - Cover arrays, strings, trees, graphs, dynamic programming, etc.
        - Range from easy to hard based on the ${level} level
        - Ask candidates to explain their approach verbally (this is a voice interview)
        - Example: "How would you find the longest substring without repeating characters? Please explain your approach and discuss the time complexity."
        ` : type === "System Design" ? `
        - Provide system design scenarios (e.g., design a URL shortener, design Twitter, design a parking lot)
        - Focus on scalability, reliability, and trade-offs
        - Include questions on databases, caching, load balancing, microservices
        - Ask about handling high traffic and data consistency
        - Appropriate for ${level} level
        - Example: "Design a scalable notification system that can handle millions of users. Discuss your architecture choices."
        ` : type === "Technical HR" ? `
        - Mix of behavioral and technical background questions
        - Ask about past projects and technical challenges
        - Questions about teamwork in technical settings
        - Problem-solving approach and learning mindset
        - Example: "Tell me about a challenging bug you fixed. How did you approach debugging it?"
        ` : type === "Case Study" || type === "Case" ? `
        - Provide a short business scenario, market sizing, or profitability framework question
        - Appropriate for MBA/business candidates
        ` : type === "Technical Finance" ? `
        - Provide rigorous questions on valuation (DCF, LBO, Multiples), accounting (3 statements), or M&A
        - Appropriate for MBA Finance candidates
        ` : type === "Operations" ? `
        - Focus on process optimization, bottleneck analysis, supply chain resilience, or Little's Law
        - Appropriate for MBA Operations candidates
        ` : type === "Behavioral" ? `
        - Provide STAR method based questions focusing on leadership and conflict resolution
        - Appropriate for all candidates
        ` : `
        - Create relevant questions based on the role and focus areas
        - Ensure questions are appropriate for the ${level} level
        `}
        
        Return the questions formatted like this:
        ["Question 1", "Question 2", "Question 3"]
        
        Thank you! <3
    `,
    });

    const interview = {
      role: role,
      type: type,
      level: level,
      focusAreas: topics ? topics.split(",") : [],
      questions: JSON.parse(questions),
      userId: userid,
      finalized: true,
      coverImage: getRandomInterviewCover(),
      createdAt: new Date().toISOString(),
    };

    await db.collection("interviews").add(interview);

    return Response.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error:", error);
    return Response.json({ success: false, error: error }, { status: 500 });
  }
}

export async function GET() {
  return Response.json({ success: true, data: "Thank you!" }, { status: 200 });
}
