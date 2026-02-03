
import { db } from "./firebase/admin";
import { getLatestInterviews, getInterviewsByUserId, getFeedbackByInterviewId, getInterviewsByUserId } from "./lib/actions/general.action";

async function test() {
  console.log("Testing Firebase Admin...");
  try {
    const collections = await db.listCollections();
    console.log("Collections:", collections.map(c => c.id));

    // Create a dummy interview to ensure queries run against data
    const dummyId = "test-interview-" + Date.now();
    await db.collection("interviews").doc(dummyId).set({
        userId: "test-user",
        role: "Software Engineer",
        type: "Technical",
        focusAreas: ["React"],
        finalized: true,
        createdAt: new Date().toISOString()
    });
    console.log("Created dummy interview:", dummyId);
    
    console.log("Testing getLatestInterviews...");
    // Use a dummy user ID to trigger the query
    const interviews = await getLatestInterviews({ userId: "test-user" });

    console.log("Testing getInterviewsByUserId...");
    const userInterviews = await getInterviewsByUserId("test-user");
    console.log("User Interviews:", userInterviews);

    if (userInterviews && userInterviews.length > 0) {
        console.log("Testing getFeedbackByInterviewId...");
        const feedback = await getFeedbackByInterviewId({
            interviewId: userInterviews[0].id,
            userId: "test-user"
        });
        console.log("Feedback:", feedback);
    } else {
        console.log("No user interviews found, skipping feedback test.");
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

test();
