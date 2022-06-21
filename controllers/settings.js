const settingsService = require('../services/database/settings');

const getBonusPoolById = async (request, response) => {
    try {
        const Id = request.params.id;
        const data = await settingsService.getBonusPoolById(Id);
        if(!data) {
            return response.status(404).send({ message: "Data Not Found!" });
        } else {
            return response.status(200).send({ success: true, message: "Data fetch Successfully!", data: data });
        }
    } catch (err) {
        return response.status(500).json({
            message: "Data Not Found",
            errorMessage: err.errors[0].message,
        });
    }
}

const updateBonusPool = async (request, response) => {
    try {
        let Id = request.params.id;
        const data = await settingsService.getBonusPoolById(Id);
        if(!data){
            // return a response to client
            response.status(404).json({
                message: "Not Found for updating a data with id = " + Id,
            });
        } else {    
        // update new change to database            
        const { org_bonus_pool } = request.body;
          if(!org_bonus_pool) {
            return response.send({ status: false, message: "Please fill the required field"});
          }
          const data = { org_bonus_pool };
          const result = await settingsService.updateBonusPool(Id, data);
          if(!result) {
                response.status(500).json({
                    message: "Data Not Updated, Something went wrong!"
                });
            } else {
                return response.status(201).send({ success: true, message: "Bonus Updated Successfully!", updatedBonus: result[1].org_bonus_pool });
            }  
        }
      } catch (err) {
          console.log("err====> ", err)
          return response.status(500).json({
            message: "Data Not Updated",
            errorMessage: err.errors[0].message,
        });
      }
}

module.exports = {
    updateBonusPool,
    getBonusPoolById,
}