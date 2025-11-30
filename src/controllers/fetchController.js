const Cuisine = require('../models/cuisinesModel');
const Dish = require('../models/dishesModel');
const {User} = require('../models/user_model');

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
        if (!user.role.includes("admin")) {
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
        const {name, id} = req.params;
        const {dish} = req.body;
        if (!name || !dish) {
            return res.status(400).json({ error: 'Fields can not be empty'});
        }
        const user = await User.findById(userId);
        if (!user){
            return res.status(404).json({ error: "The user doesn't exist"});
        }
        if (!user.role.includes("chef")) {
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
        
        await dishModel.save();
        return res.status(200).json({ message: 'Cuisine updated', dishModel})

    } catch (error) {
        console.error("Error adding cuisine:", error);
        return res.status(500).json({ error: "Server error. Please try again later." });
  }
}

const getDishes = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (!user){
            return res.status(404).json({ error: "The user doesn't exist"});
        }
        if (!user.role.includes("chef")){
            return res.status(401).json({ error: "The requested user is not a chef"});
        }
        const dishes = await Dish.find({ chef: id})
            .populate('cuisine')
            .select('-chef');
        const grouped = dishes.reduce((acc, dish) => {
            const cuisineName = dish.cuisine?.name || "Unknown";

            if (!acc[cuisineName]) {
                acc[cuisineName] = [];
            }
            
            acc[cuisineName].push(dish);
            return acc;
        }, {});

        return res.status(200).json({ message: "Got dishes", dishes: grouped});
    } catch (error) {
        console.error("Error getting dishes: ", error);
        return res.status(500).json({ error: "Server error. Please try again later."});
    } 
};




module.exports = { addCuisine, fetchCuisines, addDishes, getDishes};