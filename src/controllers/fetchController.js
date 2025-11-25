const Cuisine = require('../models/cuisinesModel');
const Dish = require('../models/dishesModel');
const User = require('../models/user_model');
const { uploadFoodPic } = require('../services/imageServices');

const addCuisine = async (req, res) => {
    try{
        const userId = req.userId;
        const {name} = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Cuisine name not given'});
        }
        const user = await User.findById(userId);
        if (!user){
            return res.status(401).json({ error: "The user doesn't exist"});
        }
        if (!user.role.admin) {
            return res.status(401).json({ error: 'Unauthorized access'});
        }
        const existsing = await Cuisine.findOne({name}); 
        if (existsing){
            return res.status(400).json({ error: "A cuisine with same name already exists"});
        }
        const cuisine = new Cuisine({name});

        await cuisine.save();
        return res.status(200).json({ message: 'Cuisine added', cuisine})

    } catch (error) {
        console.error("Error adding cuisine:", error);
        return res.status(500).json({ error: "Server error. Please try again later." });
  }
}

const fetchCuisines = async (req, res) => {
    try{
        const cuisines = await Cuisine.find();
        return res.status(200).json({cuisines});

    } catch (error) {
        console.error("Error fetching cuisine:", error);
        return res.status(500).json({ error: "Server error. Please try again later." });
    }
}

const addDishes = async (req, res) => {
    try{
        const userId = req.userId;
        const {name} = req.params;
        const {dish} = req.body;
        if (!name || !dish) {
            return res.status(400).json({ error: 'Fields can not be empty'});
        }
        const user = await User.findById(userId);
        if (!user){
            return res.status(401).json({ error: "The user doesn't exist"});
        }
        if (!user.role.chef) {
            return res.status(401).json({ error: 'Unauthorized access'});
        }
        const cuisine = await Cuisine.findOne({name}); 
        if (!cuisine){
            return res.status(400).json({ error: "The cuisine"+ name + "doesn't exist"});
        }
        const dishModel = new Dish({
            name: dish,
            chef: userId,
            cuisine: cuisine.id,
        });
        
        const imageURL = await uploadFoodPic(req.file.path, dishModel.id);
        if (imageURL){
            dishModel.urlToImage = imageURL;
        }
        await dishModel.save();
        return res.status(200).json({ message: 'Cuisine updated', dishModel})

    } catch (error) {
        console.error("Error adding cuisine:", error);
        return res.status(500).json({ error: "Server error. Please try again later." });
  }
}

module.exports = { addCuisine, fetchCuisines, addDishes};