import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email:{
        type:String,
        required: true,
        unique: true
    },
    password:{
        type:String,
        required: true,
    },
    name:{
        type:String,
        required: true,
    },
    lastLogin:{
        type:Date,
       default: Date.now
    },
    isVerified:{
       type:Boolean,
       default:false 
    },
    resetPasswordToken: String,
    resetPasswordExpiresAt: Date,
    verificationToken:String,
    verificationTokenExpiresAt: Date
},{timestamps:true})


const postModel = new mongoose.Schema({
    title:{
        type:String,
        required: true,
    },
    content:{
        type:String,
        required: true,
    },

    postedBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    likes:{
        type: Number,
        default: 0
    },
    comments:{
        type: Number,
        default: 0
    },
},{timestamps:true})
const commentModel = new mongoose.Schema({
    content:{
        type:String,
        required: true,
    },
    postId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
        required: true
    },
    postedBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
},{timestamps:true})

export const Post = mongoose.model("Post", postModel)
export const Comment = mongoose.model("Comment", commentModel)


export const User = mongoose.model("User", userSchema)
