const teamService = require('../services/database/teams');

const addTeam = async (request, response) => {
    try {
      const { teamName } = request.body;
        const data = {
            teamName
        }
        const result = await teamService.addTeam(data);
        if(!result) {
            response.status(500).json({
                message: "Team Not Created, Something went wrong!"
            });
        } else {
            return response.status(201).send({ success: true, message: "Team Created Successfully!", team: result });
        }  
    } catch (err) {
        console.log("err====> ", err.errors[0].message);
        return response.status(500).json({
            message: "Team Not Created",
            errorMessage: err.errors[0].message,
        });
    }
}
const editTeam = async (request, response) => {
    try {
      const { teamName,teamId } = request.body;
        const result = await teamService.editTeam(teamId,teamName);
        if(!result) {
            response.status(500).json({
                message: "Team Not Updated, Something went wrong!"
            });
        } else {
            return response.status(201).send({ success: true, message: "Team Updated Successfully!", updatedTeam: result });
        }  
    } catch (err) {
        console.log("err====> ", err.errors[0].message);
        return response.status(500).json({
            message: "Team Not updated",
            errorMessage: err.errors[0].message,
        });
    }
}


const deleteTeam = async (request, response, next) => {
    try{
        let teamId = request.params.id;
            await teamService.deleteTeam(teamId);
            response.status(200).json({
                success: true,
                message: "Team deleted successfully",
            });
    } catch(error) {
        response.status(500).json({
            message: "Team Not deleted",
            error: error.errors[0].message,
        });
    }
}

const getAllTeams = async (request, response, next) => {
    try {
        let teams = await teamService.getAllTeams();
        if(!teams) {
            return response.status(404).send({ message: "Teams Not Found!" });
        } else {
            return response.status(200).send({ 
                success: true, 
                message: "Teams fetch Successfully!", 
                teams: teams,
            });
        }
    } catch (err) {
        return response.status(500).json({
            message: "Teams Not Found",
            error: err.errors[0].message,
        });
    }
}

module.exports = {
    addTeam,
    getAllTeams,
    editTeam,
    deleteTeam
}