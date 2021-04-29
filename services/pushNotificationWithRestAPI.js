import axios from 'axios';

function chunkArray(array, chunk_size) {
  const results = [];
  while (array.length) {
    results.push(array.splice(0, chunk_size));
  }
  return results;
}

export async function sendMessageToMultipleDevice({
  deviceTokens = [],
  notification,
}) {
  const MAX_DEVICES_PER_REQUEST = 100;
  const { body, title, image } = notification;
  const deviceTokenChunks = chunkArray(deviceTokens, MAX_DEVICES_PER_REQUEST);
  const requestHeaders = {
    Authorization: `key=${process.env.FCM_SERVER_KEY}`,
  };

  // using multiple request to send notification to all device tokens
  const responses = await Promise.allSettled(
    deviceTokenChunks.map(async (deviceTokens, index) => {
      const fcmPayload = {
        registration_ids: deviceTokens,
        notification: {
          body,
          title,
          image,
        },
      };
      const { data } = await axios.post(
        'https://fcm.googleapis.com/fcm/send',
        fcmPayload,
        {
          headers: requestHeaders,
        },
      );
      return data;
    }),
  );

  const result = deviceTokenChunks.reduce((result, currChunk, chunkIndex) => {
    const currChunkResponse = responses[chunkIndex];
    if (currChunkResponse.status === 'rejected') {
      return [
        ...result,
        ...currChunk.map((deviceToken) => ({
          deviceToken,
          status: 'error',
          errorMessage:
            currChunkResponse.reason && currChunkResponse.reason.message,
        })),
      ];
    }

    // request fulfilled
    return [
      ...result,
      ...currChunk.map((deviceToken, responseIndexInChunk) => {
        const { message_id, error } = currChunkResponse.value.results[
          responseIndexInChunk
        ];
        return {
          deviceToken,
          status: error ? 'error' : 'success',
          errorMessage: error,
          messageId: message_id,
        };
      }),
    ];
  }, []);

  return result;
}
