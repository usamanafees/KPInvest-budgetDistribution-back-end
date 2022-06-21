const models = require('../../models');
const Feedback = models.Feedback;
const { Op } = require("sequelize");

const sendFeedback = async (data) => {
    return await Feedback.create(data);
};

const getAllComments = async () => {
    return await Feedback.findAll({
        order: [
            ['createdAt', 'DESC']
        ],
        include: ["user"]
    })    
}

module.exports = {
    sendFeedback,
    getAllComments,
}