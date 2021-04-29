# Push notification through legacy Rest API

# SET UP
1. Go to firebase console -> Project overview -> Project settings -> Cloud messaging -> copy Server Key
2. Run node js app with below env
```
FCM_SERVER_KEY=<Your server key from above>
```

# Snippet
```
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
```

# Example for several type of responses
```
{ // passed to provider
  "deviceToken": "d56afTaDRbys3e8f94bKFS:APA91bGtgeytWN4iZd7upPj6LmrLTqKxp9O1TAhx6HUwSmMJoS83V_Q_Ht7mGMzmDkMwkN3c__1PjIbdVxLNBUvYADjvLLBp-DTw4zkITijNKi2zQdRHj1zuMefDRnvCBIsIzP8LnDA0",
  "status": "success",
  "messageId": "0:1619682245446475%6b1423306b142330"
},
{ // Token no longer valid (remove app)
  "deviceToken": "cYm3Kji3SfSB4RMBTfreCI:APA91bHXsiwBRsG5Ik-m-cefFDKSbcxTGFWl-EJWuvg2SBXDScOwPBkLejgRJx7un5G8Eq3wrPF9TWYzpAvE5eNk8pb6peP1A5Oua8hk7E7ZcN5bljB-O8m5E4PNQ1FnL6Cix20mCWfV",
  "status": "error",
  "errorMessage": "NotRegistered"
},
{ // Wrong token type
  "deviceToken": "123",
  "status": "error",
  "errorMessage": "InvalidRegistration"
}
```
