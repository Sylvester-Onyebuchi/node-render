import express from 'express'
import {verifyToken} from "../middleware/verifyToken.js";
import { login, signup, logout, verifyEmail, forgotPassword, resetPassword, checkAuth, getAllPosts, createPost, editPost, createComment, deletePost} from '../controller/authController.js'
 const router = express.Router()

router.get("/check-auth",verifyToken, checkAuth )

 router.post("/signup", signup)

 router.post("/login", login )

 router.post("/logout", logout )

 router.post("/verify-email",verifyEmail)

 router.post("/forgot-password", forgotPassword)

router.post("/reset-password/:token", resetPassword)

router.get('/allPosts', getAllPosts)
router.post('/post', createPost)
router.post('/comment/:postId', createComment)
router.put('/editPost/:id', editPost)
router.delete('/delete/:id', deletePost)

 export default router

