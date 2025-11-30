const { Types, Schema } = require('mongoose');
const {Post, Comment} = require('../models/chefPostModel');
const { User } = require('../models/user_model');
const { uploadFoodPic } = require('../services/imageServices');

const createPost = async (req, res) => {
    try{
        const userId = req.userId;
        const {title, description} = req.body;
        const image = req.file;
        if (!title || !description) {
            return res.status(400).json({ error: "All fields are required"});
        }
        if (!image){
            return res.status(400).json({ error: "No image recived"});
        }

        const chef = await User.findById(userId);
        if (!chef) {
            return res.status(404).json({ error: "User not found"});
        }
        if (!chef.role.includes('chef')){
            return res.status(401).json({ error: "Only chefs can make posts"});
        }
        const post = new Post({
            chef: userId,
            title : title,
            description: description
        });
        const urlToImage = await uploadFoodPic(image.path, post.id, userId);
        if (!urlToImage){
            return res.status(400).json({ error: "Error uploading the image to database"});
        }
        post.urlToImage = urlToImage;

        await post.save();
        return res.status(200).json({message: "Post created successfully", post});
    } catch (error) {
        console.error("Error creating a post: ", error);
        return res.status(500).json({ error: "Internal server error. Try again later."});
    }
};

const updatePost = async (req, res) => {
    try {
        const userId = req.userId;
        const { id } = req.params;
        const { title, description} = req.body;
        const image = req.file;
        if (!title && !description && !image){
            return res.status(400).json({ error: "An updated field is required"});
        }
        const post = await Post.findById(id);
        if (!post){
            return res.status(404).json({error: "Post not found"});
        }
        if (!post.chef.equals(userId)){
            return res.status(401).json({ error: "Only the poster can update the post."});
        }
        if (title) post.title = title;
        if (description) post.description = description;
        if (image){
            const urlToImage = await uploadFoodPic(image.path, post.id, userId);
            if (!urlToImage) return res.status(400).json({ error: "Error updating image"});
            post.urlToImage = urlToImage;
        }
        await post.save();
        return res.status(200).json({ message: "Successfully updated the post"});
    }catch (error) {
        console.error("Error updating a post: ", error);
        return res.status(500).json({ error: "Internal server error. Try again later."});
    }
}

const deletePost = async (req,res) => {
    try {
        const userId = req.userId;
        const { id } = req.params;
        const post = await Post.findById(id);
        if (!post){
            return res.status(404).json({error: "Post not found"});
        }
        if (!post.chef.equals(userId) && !((await User.findById(userid)).role.includes('admin'))){
            return res.status(401).json({ error: "Unauthorized action."});
        }
        await post.deleteOne();
        return res.status(200).json({ message: "Successfully deleted post"});
    } catch (error) {
        console.error("Error updating a post: ", error);
        return res.status(500).json({ error: "Internal server error. Try again later."});
    }
}

const getPosts = async (req, res) => {
    try {
        const userId = req.userId;
        const { skip } = req.query;
        if (!skip) skip = 0;
        const posts = await Post.find().sort({ createdAt: 'asc'}).skip(skip).limit(20)
                    .populate('chef', 'fullName _id urlToImage chef').exec();
        const user = await User.findById(userId);
        const postMap = posts.map((e) => {
            const {likes : likes, comments : __, ...data} = e.toObject();
            data.liked = false;
            data.favorite = false;
            if (likes.some(id => id.equals(userId))){
                data.liked = true;
            } 
            if (user.favoritePosts.includes(data._id)){
                data.favorite = true;
            }
            return data;
        }); 
        return res.status(200).json({posts: postMap});
    } catch (error) {
        console.error("Error getting posts: ", error);
        return res.status(500).json({ error: "Internal server error. Try again later."});
    }
}

const getPostById = async (req, res) => {
    try {
        const userId = req.userId;
        const { id } = req.params;
        const post = await Post.findById(id).populate({path: 'chef', select: 'fullName _id chef'})
                    .populate('comments')
                    .populate({path: 'comments', 
                        populate: {path: 'user', select:'fullName _id urlToImage'}}).exec();
        if (!post){
            return res.status(404).json({error: "Post not found"});
        }
        const user = await User.findById(userId);
        const { likes , ...postData} = post.toObject();
        postData.liked = false;
        postData.favorite = false;
        if (likes.some(id => id.equals(userId))){
            liked = true;
        }
        if (user.favoritePosts.includes(post.id)){
            postData.favorite = true;
        }
        return res.status(200).json({ postData});
    } catch (error) {
        console.error("Error getting a post: ", error);
        return res.status(500).json({ error: "Internal server error. Try again later."});
    }
}

const likeUnlikePost = async (req, res) => {
    try {
        const userId = req.userId;
        const { id } = req.params;
        const post = await Post.findById(id);
        if (!post){
            return res.status(404).json({error: "Post not found"});
        }
        if (post.likes.includes(userId)) {
            post.likes.pop(userId);
            await post.save();
            return res.status(200).json({ message: "Unliked the post"});
        } else {
            post.likes.push(userId);
            await post.save();
            return res.status(200).json({ message: "Liked the post."});
        }
    } catch (error) {
        console.error("Error liking a post: ", error);
        return res.status(500).json({ error: "Internal server error. Try again later."});
    }
}

const favoriteUnfavoritePost = async (req, res) => {
    try {
        const userId = req.userId;
        const {id} = req.params;
        const post = await Post.findById(id);
        if (!post){
            return res.status(404).json({error: "Post not found"});
        }
        const user = await User.findById(userId);
        if (!user){
            return res.status(404).json({error: "User not found"});
        }
        if (user.favoritePosts.includes(id)){
            user.favoritePosts.pop(id);
            await user.save();
            return res.status(200).json({message: "Unfavorited post"});
        } else {
            user.favoritePosts.push(id);
            await user.save();
            return res.status(200).json({message: "Favorited post"});
        }
    } catch (error){
        console.error("Error favoriting a post: ",error);
        return res.status(500).json({ error: "Internal server error. Try agina later."});
    }
}

const createComment = async (req, res) => {
    try {
        const userId = req.userId;
        const { id } = req.params;
        const { text } = req.body;
        const post = await Post.findById(id);
        if (!post){
            return res.status(404).json({error: "Post not found"});
        }
        const comment = new Comment({
            user: userId,
            body: text
        })
        await comment.save();
        post.comments.push(comment.id);
        await post.save();
        return res.status(200).json({message: "Created comment"});
    } catch (error) {
        console.error("Error creating a comment: ", error);
        return res.status(500).json({ error: "Internal server error. Try again later."});
    }
}

const deleteComment = async (req, res) => {
    try {
        const userId = req.userId;
        const {id} = req.params;

        const comment = await Comment.findById(id);
        if (!comment){
            return res.status(404).json({error: "Comment not found"});
        }
        if (!comment.user.equals(userId)){
            return res.status(401).json({ error: "Unauthorized action."});
        }
        await comment.deleteOne();
        return res.status(200).json({ message: "Successsfully deleted comment"});

    } catch (error) {
        console.error("Error deleting a comment: ", error);
        return res.status(500).json({ error: "Internal server error. Try again later."});
    }
}

const updateComment = async (req, res) => {
    try {
        const userId = req.userId;
        const {id} = req.params;
        const { text } = req.body;
        if (!text){
            return res.status(400).json({ error: "Insuffecient fields"});
        }
        const comment = await Comment.findById(id);
        if (!comment){
            return res.status(404).json({error: "Comment not found"});
        }
        if (!comment.user.equals(userId)){
            return res.status(401).json({ error: "Unauthorized action."});
        }
        comment.body = text;
        await comment.save();

        return res.status(200).json({ message: "Comment updated", comment});
    } catch (error) {
        console.error("Error updating a comment: ", error);
        return res.status(500).json({ error: "Internal server error. Try again later."});
    }
}
module.exports = { createPost, getPosts, likeUnlikePost, updatePost, getPostById, deletePost, createComment, deleteComment, updateComment, favoriteUnfavoritePost};