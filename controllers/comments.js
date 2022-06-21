const commentService = require('../services/database/comments');

const sendFeedback = async (request, response) => {
    try {
      const { comment, UserId } = request.body;
        const data = {
            comment,
            UserId
        }
        const result = await commentService.sendFeedback(data);
        if(!result) {
            response.status(500).json({
                message: "Feedback Not Send, Something went wrong!"
            });
        } else {
            return response.status(201).send({ success: true, message: "Feedback Sent Successfully!", feedback: result });
        }  
    } catch (err) {
        console.log("err====> ", err.errors[0].message);
        return response.status(500).json({
            message: "Feedback Not Sent",
            errorMessage: err.errors[0].message,
        });
    }
}

const getAllComments = async (request, response, next) => {
    try {
        let comments = await commentService.getAllComments();
        if(!comments) {
            return response.status(404).send({ message: "Comments Not Found!" });
        } else {
            return response.status(200).send({ 
                success: true, 
                message: "Comments fetch Successfully!", 
                comments: comments,
            });
        }
    } catch (err) {
        return response.status(500).json({
            message: "Comments Not Found",
            error: err.errors[0].message,
        });
    }
}

module.exports = {
    sendFeedback,
    getAllComments
}