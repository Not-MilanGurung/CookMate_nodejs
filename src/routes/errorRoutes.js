const pageNotFound = async (req, res) => {
    try{
        res.status(404).json({error: "Route not found"});
    } catch (e ){
        console.error("Error reporting page not found: ", e);
        return res.status(500).json({error: "Internal server error"});
    }
};

module.exports = {pageNotFound};