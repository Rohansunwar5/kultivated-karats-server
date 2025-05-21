const generateJwt = asyncHandler( async (req, res) => {
    try {

        

    } catch (error) {
        console.log(error);        
        return res.status(error.status || 500).json(error);
    }
});