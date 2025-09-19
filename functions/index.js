const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

exports.acceptRequest = functions.https.onCall(async (data, context) => {
  const { requestId, menteeId } = data;
  const mentorId = context.auth.uid;

  if (!mentorId) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called while authenticated."
    );
  }

  const db = admin.firestore();

  try {
    const requestRef = db.collection("mentorship_requests").doc(requestId);
    const mentorRef = db.collection("users").doc(mentorId);
    const menteeRef = db.collection("users").doc(menteeId);
    const conversationRef = db.collection("conversations").doc();

    await db.runTransaction(async (transaction) => {
      console.log(`Starting transaction for requestId: ${requestId}`);
      const [requestDoc, mentorDoc, menteeDoc] = await Promise.all([
        transaction.get(requestRef),
        transaction.get(mentorRef),
        transaction.get(menteeRef),
      ]);

      if (!requestDoc.exists) {
        throw new functions.https.HttpsError(
          "not-found",
          `Request not found with ID: ${requestId}`
        );
      }
      
      if (requestDoc.data().toUserId !== mentorId) {
        throw new functions.https.HttpsError(
          "permission-denied",
          "You do not have permission to accept this request."
        );
      }

      if (!mentorDoc.exists) {
        throw new functions.https.HttpsError(
          "not-found",
          `Mentor profile not found for ID: ${mentorId}`
        );
      }

      if (!menteeDoc.exists) {
        throw new functions.https.HttpsError(
          "not-found",
          `Mentee profile not found for ID: ${menteeId}`
        );
      }

      // 1. Update the request
      console.log(`Updating request: ${requestId}`);
      transaction.update(requestRef, { status: "accepted" });

      // 2. Create the conversation and the initial message
      console.log(`Creating conversation for mentor: ${mentorId} and mentee: ${menteeId}`);
      transaction.set(conversationRef, {
        participants: [mentorId, menteeId],
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log(`Creating initial message for conversation: ${conversationRef.id}`);
      transaction.set(conversationRef.collection("messages").doc(), {
        senderId: mentorId,
        receiverId: menteeId,
        content: "Welcome! I've accepted your mentorship request.",
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });

      // 3. Add conversation to both users' profiles
      console.log(`Updating mentor profile: ${mentorId}`);
      transaction.update(mentorRef, {
        conversations: admin.firestore.FieldValue.arrayUnion(conversationRef.id),
      });

      console.log(`Updating mentee profile: ${menteeId}`);
      transaction.update(menteeRef, {
        conversations: admin.firestore.FieldValue.arrayUnion(conversationRef.id),
      });
      console.log(`Transaction for requestId: ${requestId} completed successfully`);
    });

    return { conversationId: conversationRef.id };
  } catch (error) {
    // Log the detailed error and rethrow it for the client to handle
    console.error("Transaction failed: ", error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError(
      "internal",
      "An unexpected error occurred while accepting the request.",
      error.message
    );
  }
});