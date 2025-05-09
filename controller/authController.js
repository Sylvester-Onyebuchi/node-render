import {User, Post} from "../modes/userModel.js"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import mongoose from "mongoose"

import {generateTokenAndSetCookie} from "../utils/verifyCode.js"

import {sendPasswordResetEmail, sendVerificationEmail, sendWelcomeEmail, sendResetPasswordSuccessEmail} from "../nodemailer/mail.js"


export const signup = async(req,res) => {
    const {email, name} = req.body
    try {
        if(!email || !req.body.password || !name){
            throw new Error("All fields are required")
        }
        const userExist = await User.findOne({email})
        if(userExist){
            return res.status(400).json({message:"User already exists"})
        }
        const hashPassword = await bcrypt.hash(req.body.password , 10)
        const verificationToken = Math.floor(100000 + Math.random() * 900000).toString()
        const newUser = new User({
            email,
            password: hashPassword,
            name,
            verificationToken, 
            verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000
        })
        await newUser.save() 

        generateTokenAndSetCookie(res, newUser._id)
        await sendVerificationEmail(newUser.email, verificationToken)
        const {password, ...userWithoutPassword} = newUser._doc
        res.status(201).json({
            success: true,
            message: "User created successfully",
            User: userWithoutPassword
        })

    } catch (error) {
       res.status(400).json({message:error.message}) 
    }
}

export const verifyEmail = async(req, res) =>{
    const {code} = req.body
    try {
        const user = await User.findOne({
            verificationToken: code,
            verificationTokenExpiresAt: {$gt: Date.now()}
        })
        if(!user){
            return res.status(400).json({message:"Invalid or expired verification code"})
        }
        user.isVerified = true
        user.verificationToken = undefined
        user.verificationTokenExpiresAt = undefined 
        await user.save()
        await  sendWelcomeEmail(user.email, user.name)

        res.status(201).json({success: true, message:"Email verified"})

    } catch (error) {
        
    }
}

export const login = async(req,res) => {
    const {email} = req.body
    try {
        const user = await User.findOne({email})
        if(!user){
            return res.status(400).json({message:"Invalid credentials"})
        }
        if(user.isVerified === false){
            return res.status(400).json({message:"User email not yet verified"})
        }
        const comparePassword = await bcrypt.compare(req.body.password, user.password)
        if(!comparePassword){
            return res.status(400).json({message:"Invalid credentials"})
        }
        generateTokenAndSetCookie(res, user._id)
        user.lastLogin = new Date();
        await user.save()
        const {password, ...userWithoutPassword} = user._doc
        res.status(201).json({message:"User login successfully",User: userWithoutPassword})
    } catch (error) {
        res.status(400).json({message:error.message})
    }
}
export const logout = async(req,res) => {
    res.clearCookie("token",)
    res.status(200).json({success:true, message:"Logged out successfully"})
}

export const forgotPassword = async(req,res) => {
    const {email} = req.body
    try {
        const user = await User.findOne({email})
        if(!user){
            return res.status(400).json({message:"User does not exist"})
        }
        const resetToken = crypto.randomBytes(15).toString("hex")
        const resetPasswordExpiresAt = Date.now() + 60 * 60 * 1000
        user.resetPasswordToken = resetToken
        user.resetPasswordExpiresAt = resetPasswordExpiresAt
        await user.save()
        await sendPasswordResetEmail(user.email, `${process.env.CLIENT_URL}/reset-password/${resetToken}`)
        res.status(200).json({success:true, message:"Reset token successfully"})
    }catch(err){
        res.status(400).json({message:err})
    }
}

export const resetPassword = async(req,res) => {
    try {


        const user = await User.findOne({
            resetPasswordToken: req.params.token,
            resetPasswordExpiresAt:{$gt: Date.now()}
        })
        console.log("User found:", user);
        if(!user){
            return res.status(400).json({message:"Invalid or expired reset token"})
        }

        user.password = await bcrypt.hash(req.body.password, 10)
        user.resetPasswordToken = undefined;
        user.resetPasswordExpiresAt = undefined;
        await user.save()
        await sendResetPasswordSuccessEmail(user.email)
        res.status(200).json({success:true, message:"Password reset successfully"})
    }catch(err){
        res.status(400).json({message:err})
    }
}

export const checkAuth = async(req,res) => {
    try {
        const user = await User.findById(req.userId).select("-password")
        if(!user){
            return res.status(400).json({message:"User does not exist"})
        }
        res.status(200).json({success:true, user})
    }catch(err){
        console.log(err)
        res.status(400).json({message:err})
    }
}


export const getAllPosts = async(req,res) => {
    try {
        const posts = await Post.find().populate("postedBy", "name")
        res.status(200).json({success:true, posts})
    }catch(err){
        res.status(400).json({message:err})
    }
}

export const createPost = async(req,res) => {
    const {title, content} = req.body
    try {
        if(!title || !content){
            return res.status(400).json({message:"All fields are required"})
        }
        const newPost = new Post({
            title,
            content,
            postedBy: req.userId
        })
        await newPost.save()
        res.status(201).json({success:true, message:"Post created successfully", post:newPost})
    }catch(err){
        res.status(400).json({message:err})
    }
}

export const editPost = async(req,res) => {
    const {title, content} = req.body
    try {
        if(!title || !content){
            return res.status(400).json({message:"All fields are required"})
        }
        const post = await Post.findById(req.params.id)
        if(!post){
            return res.status(400).json({message:"Post does not exist"})
        }
        if(post.postedBy.toString() !== req.userId){
            return res.status(400).json({message:"You are not authorized to edit this post"})
        }
        post.title = title
        post.content = content
        await post.save()
        res.status(200).json({success:true, message:"Post updated successfully", post})
    }catch(err){
        res.status(400).json({message:err})
    }
}
export const deletePost = async (req, res) => {
  const postId = req.params.postId;
  if (!mongoose.Types.ObjectId.isValid(postId)) {
    return res.status(400).json({ message: "Invalid post ID format" });
  }

  try {
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post does not exist" });
    }

    if (post.postedBy.toString() !== req.userId) {
      return res.status(403).json({ message: "You are not authorized to delete this post" });
    }

    await post.deleteOne(); 
    return res.status(200).json({ success: true, message: "Post deleted successfully" });
    
  } catch (err) {
    console.error('Delete error:', err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const createComment = async(req,res) => {
    const {content} = req.body
    try {
        if(!content){
            return res.status(400).json({message:"All fields are required"})
        }
        const post = await Post.findById(req.params.id)
        if(!post){
            return res.status(400).json({message:"Post does not exist"})
        }
        const newComment = new Comment({
            content,
            postId: req.params.id,
            postedBy: req.userId
        })
        await newComment.save()
        post.comments.push(newComment._id)
        await post.save()
        res.status(201).json({success:true, message:"Comment created successfully", comment:newComment})
    }catch(err){
        res.status(400).json({message:err})
    }
}

