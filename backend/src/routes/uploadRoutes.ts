import express, { Request, Response } from 'express';
import multer from 'multer';
import multerS3 from 'multer-s3';
import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import { RequestHandler } from 'express';

const router = express.Router();

// ✅ Correct AWS SDK v2 initialization
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  region: process.env.AWS_REGION!,
});

// ✅ Configure multer to use S3
const upload = multer({
  storage: multerS3({
    s3,
    bucket: process.env.S3_BUCKET_NAME!,
    metadata: (_req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (_req, file, cb) => {
      const uniqueName = `${Date.now()}-${uuidv4()}-${file.originalname}`;
      cb(null, uniqueName);
    },
  }),
});

// ✅ Upload route
const uploadHandler: RequestHandler = (req, res): void => {
  const file = req.file as Express.Multer.File & { location?: string };

  if (!file || !file.location) {
    res.status(400).json({ error: 'No file uploaded' });
    return;
  }

  res.status(200).json({ imageUrl: file.location });
};

router.post('/upload', upload.single('image'), uploadHandler);

export default router;