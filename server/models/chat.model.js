import mongoose from "mongoose"

const messageSchema = new mongoose.Schema({
    sender : {
        type : String,
        required : true,
    },
    text : {
        type : String,
        required : true
    },
    createdAt : {
        type : Date,
        default : Date.now
    }
}, { _id : false })   // Prevents _id for subdocuments

const chatSchema = new mongoose.Schema({
    title : {type : String, required : true},
    messages: {
      type: [messageSchema], // Array of subdocuments without _id
      default: [], // 👈 ensures new chat starts with []
    }, 
}, {timestamps : true})  // adds createdAt, updatedAt for the whole chat

const chatModel = mongoose.model('Chat', chatSchema);

export default chatModel;