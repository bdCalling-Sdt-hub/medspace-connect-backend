import * as admin from 'firebase-admin';
import path from 'path';

const serviceAccount = require(path.join(
  process.cwd(),
  'medspace-connect-notify-firebase-adminsdk-ta8pq-f226e2d319.json'
));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export const firebaseAdmin = admin;
