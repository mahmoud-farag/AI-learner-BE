import mongoose from 'mongoose';

const ChatHistorySchema = new mongoose.Schema({

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  document: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    required: true,
  },


  message: [{
    
    role: { type: String, enum: ['user', 'assistent'], required: true },
    
    content: { type: String, required: true },

    relevantChunks: { type : [Number], default: [] },
  }],



}, { timestamps: true});


ChatHistorySchema.index({ user: 1, document: 1 });


const ChatHistory = mongoose.model('ChatHistory', ChatHistorySchema);


export default ChatHistory;
