import multer from 'multer';
import { customErrors } from '../utils/index.js';

const { BadRequestError, InternalServerError } = customErrors;

const uploadFiles = (params = {}) => {

  const { allowedMimeTypes = [], maxFileSize = 1024 * 1024 * 5, mode = 'single', fieldName = 'file', maxCount = 5 } = params;
  
  if (!allowedMimeTypes?.length) 
    throw new InternalServerError('Allowed MimeTypes can not be empty');

  const storage = multer.memoryStorage();

  const fileFilter = (req, file, cb) => {
    if (allowedMimeTypes.length === 0 || allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new BadRequestError(`Invalid file type, only ${allowedMimeTypes.join(', ')} are allowed!`), false);
    }
  };

  const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
      fileSize: maxFileSize
    }
  });

  if (mode === 'single') return upload.single(fieldName);
  if (mode === 'array') return upload.array(fieldName, maxCount);

  return upload;
};

export default uploadFiles;