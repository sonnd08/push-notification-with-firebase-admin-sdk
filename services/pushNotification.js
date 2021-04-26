import firebaseAdmin from 'firebase-admin';

export function initFirebaseAdmin() {
  console.log(
    'GOOGLE_APPLICATION_CREDENTIALS',
    process.env.GOOGLE_APPLICATION_CREDENTIALS,
  );
  firebaseAdmin.initializeApp();
}

export async function sendMessageToMultipleDevice({
  deviceTokens = [],
  notification,
}) {
  const { body, title, image } = notification;
  const __deviceTokens = deviceTokens.slice(0, 500);

  if (deviceTokens.length > 500) {
    console.log(
      `
      You can only specify up to 500 device registration tokens per invocation (${deviceTokens.length}/500)
      Sending message to first 500 tokens
      `,
    );
  }

  const multicastPayload = {
    tokens: __deviceTokens,
    notification: {
      title,
      body,
      image,
    },
  };
  const response = await firebaseAdmin
    .messaging()
    .sendMulticast(multicastPayload);

  console.log(response.successCount + ' messages were sent successfully');
  if (response.failureCount > 0) {
    const failedTokens = [];
    response.responses.forEach((resp, idx) => {
      if (!resp.success) {
        failedTokens.push(__deviceTokens[idx]);
      }
    });
    console.log('List of tokens that caused failures: ' + failedTokens);
  }
  return response;
}
