import { STATUS_CODES } from '../common/index.js';
import { documentService } from '../services/index.js';
import { customErrors } from '../utils/index.js';


const { BadRequestError } = customErrors;

const documentController = {};

documentController.uploadDocument = async (req, res, next) => {
  try {


    if (!req?.body?.title) 
      throw new BadRequestError('Pdf File title not provided in the payload');

    if (!req?.file) 
      throw new BadRequestError('Pdf File not provided in the payload');

    const params = {
      payload: req.body ,
      file: req.file,
      userId: req.user._id,
    };

    const { document } = await documentService.uploadPdfDocument({params});


    res.status(STATUS_CODES.CREATED).json({
      success: true,
      data: { document },
      message: 'File uploaded successfully, it under the processing now....',
    })

  } catch(error) {
    next(error);
  }
}

documentController.getDocuments = async (req, res, next) => {
  try {

  } catch(error) {
    next(error);
  }
}

documentController.getDocument = async (req, res, next) => {
  try {

  } catch(error) {
    next(error);
  }
}

documentController.deleteDocument = async (req, res, next) => {
  try {

  } catch(error) {
    next(error);
  }
}

documentController.updateDocument = async (req, res, next) => {
  try {

  } catch(error) {
    next(error);
  }
}




export default documentController;