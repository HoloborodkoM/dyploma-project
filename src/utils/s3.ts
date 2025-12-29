import { S3Client } from '@aws-sdk/client-s3';

const B2_KEY_ID = process.env.B2_KEY_ID!;
const B2_APP_KEY = process.env.B2_APP_KEY!;
const B2_ENDPOINT = process.env.B2_ENDPOINT!;
const B2_REGION = process.env.B2_REGION!;

const globalForS3 = global as unknown as { s3: S3Client };

export const s3 =
  globalForS3.s3 ||
  new S3Client({
    region: B2_REGION,
    endpoint: `https://${B2_ENDPOINT}`,
    credentials: {
      accessKeyId: B2_KEY_ID,
      secretAccessKey: B2_APP_KEY,
    },
    forcePathStyle: true,
  });

if (process.env.NODE_ENV !== 'production') globalForS3.s3 = s3;