const Cuisine = require('../models/cuisinesModel');
const User = require('../models/user_model');

const addCuisine = async (req, res) => {
    try{
        const userId = req.userId;
        const {name, dishes} = req.body;
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
        if (dishes){
            cuisine.dishes = dishes;
        }

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
        return res.status(400).json({cuisines});

    } catch (error) {
        console.error("Error fetching cuisine:", error);
        return res.status(500).json({ error: "Server error. Please try again later." });
    }
}

const addDishes = async (req, res) => {
    try{
        const userId = req.userId;
        const {name} = req.params;
        const {dishes, overwrite} = req.body;
        if (!name || !dishes) {
            return res.status(400).json({ error: 'Fields can not be empty'});
        }
        const user = await User.findById(userId);
        if (!user){
            return res.status(401).json({ error: "The user doesn't exist"});
        }
        if (!user.role.admin) {
            return res.status(401).json({ error: 'Unauthorized access'});
        }
        const cuisine = await Cuisine.findOne({name}); 
        if (!cuisine){
            return res.status(400).json({ error: "The cuisine"+ name + "doesn't exist"});
        }
        if (overwrite){
            cuisine.dishes = dishes;
        }else {
            cuisine.dishes.push({ $each: dishes });
        }
        
        await cuisine.save();
        return res.status(200).json({ message: 'Cuisine updated', cuisine})

    } catch (error) {
        console.error("Error adding cuisine:", error);
        return res.status(500).json({ error: "Server error. Please try again later." });
  }
}

module.exports = { addCuisine, fetchCuisines, addDishes};