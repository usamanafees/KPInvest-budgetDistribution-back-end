const ratingsService = require('../services/database/ratings');


const getAllRatings = async (request, response) => {
    try {
       let ratings = await ratingsService.getAllRatings();
        if(!ratings) {
            return response.status(404).send({ message: "Ratings Not Found!" });
        } else {
            return response.status(200).send({ 
                success: true, 
                message: "Ratings fetch Successfully!", 
                ratings: ratings
            });
        }
    } catch (err) {
        return response.status(500).json({
            message: "Ratings Not Found",
            error: err.errors,
        });
    }
}

const getRatingByIds = async (request, response) => {
    try {
        const { rating_from, rating_to } = request.body;
        let rating = await ratingsService.getRatingByIds(rating_from, rating_to);
        if(!rating) {
            return response.status(404).send({ message: "Rating Not Found!" });
        } else {
            return response.status(200).send({ 
                success: true, 
                message: "Rating fetch Successfully!", 
                rating: rating,
            });
        }
    } catch (err) {
        return response.status(500).json({
            message: "Rating Not Found",
            error: err.errors,
        });
    }
}

const updateScore = async (request, response) => {
    try {
        const { score, ratingFrom, ratingTo } = request.body;
        const rating = {
            score,
            ratingFrom,
            ratingTo,
        }
        const result = await ratingsService.updateScore(rating)
        if(!result) {
            response.status(500).json({
                message: "Score Not Updated, Something went wrong!"
            });
        } else {
            return response.status(201).send({ success: true, message: "Score Updated Successfully!", score: result });
        }         
    } catch (err) {
          console.log("err====> ", err)
          return response.status(500).json({
            message: "Score not Updated",
            errorMessage: err.errors,
        });
      }
}

module.exports = {
    getAllRatings,
    getRatingByIds,
    updateScore,
}