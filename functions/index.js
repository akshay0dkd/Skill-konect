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
      
      const mentorData = mentorDoc.data();
      const menteeData = menteeDoc.data();

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
      const mentorConversations = mentorData.conversations;
      if (Array.isArray(mentorConversations)) {
        transaction.update(mentorRef, {
          conversations: admin.firestore.FieldValue.arrayUnion(conversationRef.id),
        });
      } else {
        transaction.update(mentorRef, {
          conversations: [conversationRef.id],
        });
      }

      console.log(`Updating mentee profile: ${menteeId}`);
      const menteeConversations = menteeData.conversations;
      if (Array.isArray(menteeConversations)) {
        transaction.update(menteeRef, {
          conversations: admin.firestore.FieldValue.arrayUnion(conversationRef.id),
        });
      } else {
        transaction.update(menteeRef, {
          conversations: [conversationRef.id],
        });
      }
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

exports.rateUser = functions.https.onCall(async (data, context) => {
    const { ratedUserId, raterUserId, rating } = data;

    if (!context.auth) {
        throw new functions.https.HttpsError(
            "unauthenticated",
            "The function must be called while authenticated."
        );
    }

    if (context.auth.uid !== raterUserId) {
        throw new functions.https.HttpsError(
            "permission-denied",
            "You can only submit ratings as yourself."
        );
    }

    if (ratedUserId === raterUserId) {
        throw new functions.https.HttpsError(
            "invalid-argument",
            "You cannot rate yourself."
        );
    }

    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
        throw new functions.https.HttpsError(
            "invalid-argument",
            "Rating must be a number between 1 and 5."
        );
    }

    const db = admin.firestore();
    const ratedUserRef = db.collection("users").doc(ratedUserId);
    const ratingRef = ratedUserRef.collection("ratings").doc(raterUserId);

    try {
        await db.runTransaction(async (transaction) => {
            const ratedUserDoc = await transaction.get(ratedUserRef);
            if (!ratedUserDoc.exists) {
                throw new functions.https.HttpsError("not-found", "Rated user not found.");
            }

            const userData = ratedUserDoc.data();
            const oldRatingDoc = await transaction.get(ratingRef);

            let newRatingCount = (userData.ratingCount || 0) + 1;
            let newTotalRating = (userData.totalRating || 0) + rating;

            if (oldRatingDoc.exists) {
                // User is updating their rating
                const oldRatingData = oldRatingDoc.data();
                newRatingCount -= 1; // No change in count, just updating
                newTotalRating -= oldRatingData.rating;
            }

            const newAverageRating = newTotalRating / newRatingCount;

            // Update the user's average rating and rating count
            transaction.update(ratedUserRef, {
                averageRating: newAverageRating,
                ratingCount: newRatingCount,
                totalRating: newTotalRating
            });

            // Save the individual rating
            transaction.set(ratingRef, { rating: rating });
        });

        return { success: true };
    } catch (error) {
        console.error("Rating transaction failed: ", error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError("internal", "An unexpected error occurred while submitting the rating.");
    }
});
