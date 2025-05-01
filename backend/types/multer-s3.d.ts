declare module 'multer-s3' {
  import { StorageEngine } from 'multer';
  import AWS from 'aws-sdk';

  interface MulterS3Options {
    s3: AWS.S3;
    bucket: string | ((req: any, file: Express.Multer.File, cb: (error: any, bucket?: string) => void) => void);
    key?: (req: any, file: Express.Multer.File, cb: (error: any, key?: string) => void) => void;
    acl?: string | ((req: any, file: Express.Multer.File, cb: (error: any, acl?: string) => void) => void);
    metadata?: (req: any, file: Express.Multer.File, cb: (error: any, metadata?: any) => void) => void;
    contentType?: (req: any, file: Express.Multer.File, cb: (error: any, mime?: string) => void) => void;
    cacheControl?: string | ((req: any, file: Express.Multer.File, cb: (error: any, cacheControl?: string) => void) => void);
    contentDisposition?: string | ((req: any, file: Express.Multer.File, cb: (error: any, contentDisposition?: string) => void) => void);
    shouldTransform?: (req: any, file: Express.Multer.File, cb: (error: any, shouldTransform?: boolean) => void) => void;
  }

  function multerS3(options: MulterS3Options): StorageEngine;

  export = multerS3;
}