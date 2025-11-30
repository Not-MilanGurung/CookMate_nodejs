const Package = require('../models/packageModel');
const {User} = require('../models/user_model');

const createPackage = async (req,res) =>{
    try{
        const userId = req.userId;
        const {name, price, description, dishes} = req.body;
        if (!name || !price || !description || !dishes){
            return res.status(400).json({error: "Insuffecient fields"});
        }
        const chef = await User.findById(userId);
        if (!chef){
            return res.status(404).json({ error: "User not found"});
        }
        if (!chef.role.includes('chef')){
            return res.status(401).json({error: "Only chefs can create packages"});
        }
        const existingPackage = await Package.findOne({chef: chef.id, name: name});
        if (existingPackage){
            return res.status(400).json({error: "You already have a package with the same name"});
        }
        const package = new Package({
            chef: chef.id,
            name: name,
            price: price,
            description : description,
            dishes: dishes
        });
        await package.save();
        return res.status(200).json({message: "Created package", package});
    } catch (e){
        console.error("Error creating package: ", e);
        return res.status(500).json({error:"Server error. Please try again later"});
    }
};

const getPackages = async (req, res) => {
    try{
        const {id} = req.params;
        const chef = await User.findById(id);
        if(!chef){
            return res.status(404).json({error: "User not found"});
        }
        if (!chef.role.includes('chef')){
            return res.status(400).json({ error: 'The user is not a chef'});
        }
        const packages = await Package.find({chef: chef.id});
        return res.status(200).json({message: "Got the packages", packages});
    }catch (e){
        console.error("Error getting package: ", e);
        return res.status(500).json({error:"Server error. Please try again later"});
    }
}

const updatePackage= async (req, res) => {
    try{
        const userId = req.userId;
        const {id} = req.params;
        const {name, price, description, dishes} = req.body;
        if (!name && !price && !description && !dishes) {
            return res.status(400).json({error: "Insuffecient fields"});
        }
        const package = await Package.findById(id);
        if (!package) {
            return res.status(404).json({error: "Could not find the package"});
        }
        if (!package.chef.equals(userId)){
            return res.status(401).json({error: "Unauthorized access"});
        }
        if (name) {
            package.name = name;
        }
        if (price) {
            package.price = price;
        }
        if (description) {
            package.description = description;
        }
        if (dishes) {
            package.dishes = dishes;
        }
        await package.save();
        return res.status(200).json({message: "Updated package", package});

    } catch (e) {
        console.error("Error updating package: ", e);
        return res.status(500).json({error:"Server error. Please try again later"});
    }
}

const deletePackage = async (req, res) => {
    try{
        const userId = req.userId;
        const {id} = req.params;
        const pack = await Package.findById(id);
        if (!pack) {
            return res.status(404).json({error: "Pacakge not found"});
        }
        if (!pack.chef.equals(userId)){
            return res.status(401).json({error: "Unauthorized access"});
        }
        await pack.deleteOne();
        return res.status(200).json({message: "Package deleted"});
    }catch (e) {
        console.error("Error deleting package: ", e);
        return res.status(500).json({error:"Server error. Please try again later"});
    }
}

module.exports = { createPackage, getPackages, updatePackage, deletePackage};