import mongoose from 'mongoose';

const DocumentSchema = new mongoose.Schema({

  user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

  title: {
    type: String,
    required: [true, 'Provide a title for the insrted Document'],
    trim: true,
  },

  S3Data: { 
    fileName: { type: String, required: true },
    folder: { type: String, required: true },
    mimeType: { type: String, required: true },
  },

  originalFileName: { type: String, required: true },

  fileSize: { type: Number, required: true },

  extractedText: { type: String, default: '' },

  chunks: [{

    content: { type: String, required: true },
    
    pageNumber: { type: Number, default: 0 },
    
    chunkIndex: { type: Number, required: true },
  }],

  uploadDate: { type: Date, default: Date.now},
  
  lastAccess: { type: Date, default: Date.now},

  status: {
    type: String,
    enum: ['processing', 'ready', 'failed'],
    default: 'processing',
  },
  
}, {timestamps: true});


DocumentSchema.index({user: 1, uploadDate: -1});


const Document = mongoose.model('Document', DocumentSchema);

export default Document;