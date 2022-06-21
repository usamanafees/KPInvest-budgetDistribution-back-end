const models = require('../../models');
const Teams = models.Teams;
const UsersTeams = models.UsersTeams;

const addTeam = async (data) => {
    return await Teams.create(data);
};
const editTeam = async (teamId, teamName) => {
    return await Teams.update({ teamName: teamName }, { 
        where: { id: teamId },
        returning: true, 
        plain: true  
    });
};
const getAllTeams = async () => {
    return await Teams.findAll({
        order: [
            ['createdAt', 'DESC']
        ]
    })    
}
const deleteTeam = async (teamId) => {
    await UsersTeams.destroy({ where: { TeamId: teamId } });
    await Teams.destroy({ where: { id: teamId } });
    return true
}
module.exports = {
    addTeam,
    getAllTeams,
    editTeam,
    deleteTeam
}