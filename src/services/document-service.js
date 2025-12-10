import awsService from './aws-service.js';

import { Document } from '../models/index.js';
import { parsePdf, textChunkerUtils } from '../utils/index.js'

// it is a hack way as the json import is not supported in the current version of nodejs
import { createRequire } from 'module';
const require = createRequire(import.meta.url)
const S3Folders = require('../data/S3-folders.json');

const documentService = {};


documentService.uploadPdfDocument = async (params = {}) => {
  try {
    console.log('documentService.uploadPdfDocument:: started');

    const { payload, file, userId } = params;

    const originalFileName = file.originalname;
    const mimeType = file.mimetype;

    // *) upload the file to the S3 

    const { folder, fileName } = await uploadPdfFileToS3({ file });


    // *) create a new record in the db
    const fileSize = file.size / (1024 * 1024);

    const document = await Document.create({
      title: payload.title,
      S3Data: {
        mimeType,
        fileName,
        folder,
      },
      originalFileName,
      fileSize,
      user: userId,
      status: 'processing',
    });


    // *) do the background job for text extractation and chunk
    processPdf({ file, documentId: document._id });



    return { document };
  } catch (error) {

    throw error;
  }
}

async function uploadPdfFileToS3(params = {}) {

  const { file } = params;

  const originalName = file.originalname;
  const fileBuffer = file.buffer;
  const mimeType = file.mimetype;

  const folder = S3Folders.PDF_Documents;
  const fileName = `${originalName}_${Date.now()}.pdf`;

  const S3params = {
    fileBuffer,
    folder,
    fileName,
    mimeType,
  };

  await awsService.uploadFile(S3params);

  return { folder, fileName };
}


async function processPdf(params = {}) {
  let { file, documentId } = params;
  try {

    const result = await parsePdf({ fileBuffer: file.buffer });

    const chunks = textChunkerUtils.chunkText({ text: result.text, chunkSize: 60, overlap: 10 });

    await Document.findOneAndUpdate({
      _id: documentId
    }, {
      extractedText: result.text,
      chunks,
      status: 'ready',
    }
    );


    return;

  } catch (error) {

    console.error('Error while processing the Pdf file:\n', error);

    await Document.findOneAndUpdate({ _id: documentId }, { status: 'failed' });

  } finally {

    file = null;
  }
}





export default documentService;