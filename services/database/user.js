const models = require('../../models');
const User = models.User;
const Teams = models.Teams;
const Ratings = models.Ratings;
const UsersTeams = models.UsersTeams
const randomize = require('randomatic');

const { Op } = require("sequelize");

const addUser = async (user, teams) => {
    const userObj = await User.create(user);
    const userId = userObj.id;
    for (let i = 0; i < teams.length; i++) {
        const element = teams[i];
        const user_team = { 
            UserId: userId, 
            TeamId: element 
        }
        await UsersTeams.create(user_team)
    }
    return userObj;
};
const bulkaddUsers = async (obj) => {
    let addedUsers =[]; 
        for(let i=0;i<obj.length;i++)
        {
            try {
                let link = randomize('Aa', 6);
                let user = {
                    firstName:obj[i].firstName,
                    lastName:obj[i].lastName,
                    email:obj[i].email,
                    link_key:link
                }
                let userObj = await User.create(user);
                let userId = userObj.id;
                for(let k=0;k<obj[i].teams.length;k++)
                {
                    if(obj[i].teams[k] != undefined && obj[i].teams[k] != null)
                    {
                        const result = await Teams.findOne({ where: { teamName: obj[i].teams[k] } });
                        if(result)
                        {
                            let user_team = { 
                                UserId: userId, 
                                TeamId: result.id 
                            }
                            await UsersTeams.create(user_team);
                        }
                    }

                }
                addedUsers.push(userObj);
            }catch (error) {
                console.log(error);
            }    
        }
        return addedUsers;
};
const getAllUsers = async () => {
    return await User.findAll({
        order: [
            ['id', 'DESC']
        ],
        include: [
            {
                model: Teams,
                as: "teams",
                attributes: ["id", "teamName"]
            }
        ]
    })    
}

const getAllUsersWithSearch = async (searchQuery) => {
    return await User.findAll({
        where: {
            [Op.or]: [
                { 'firstName': { [Op.iLike]: '%' + searchQuery + '%' } },
                { 'lastName': { [Op.iLike]: '%' + searchQuery + '%' } },
                { 'email': { [Op.iLike]: '%' + searchQuery + '%' } },
                // { '$teams.teamName$': { [Op.iLike]: '%' + searchQuery + '%' } }
            ]
        },
        order: [
            ['id', 'DESC']
        ],
        include: {
            model: Teams,
            as: "teams",
            attributes: ["id", "teamName"]
        }
    })    
}

const getPaginatedUsersWithSearch = async (perPage, page, searchQuery) => {
    if(searchQuery !== '') {
        return await User.findAndCountAll({
            where: {
                [Op.or]: [
                    { 'firstName': { [Op.iLike]: '%' + searchQuery + '%' } },
                    { 'lastName': { [Op.iLike]: '%' + searchQuery + '%' } },
                    { 'email': { [Op.iLike]: '%' + searchQuery + '%' } },
                    // { '$teams.teamName$': { [Op.iLike]: '%' + searchQuery + '%' } }
                ]
            },
            include: {
                model: Teams,
                as: "teams",
                attributes: ["id", "teamName"]
            },
            order: [
                ['id', 'DESC']
            ],
            limit: perPage,
            offset: (page -1) * perPage,
        })    
    } else {
        return await User.findAndCountAll({
            include: {
                model: Teams,
                as: "teams",
                attributes: ["id", "teamName"]
            },
            order: [
                ['id', 'DESC']
            ],
            limit: perPage,
            offset: (page -1) * perPage,
        })
    }
}

const getAllTeams = async () => {
    return await Teams.findAll()
}

const getUserById = async (userId) => {
    return await User.findOne({ 
        where: {id: userId},
        include: {
            model: Teams,
            as: "teams",
            attributes: ["id", "teamName"]
        }
    });
}

const getUserByLink = async (link) => {
    return await User.findOne({ 
        where: {link_key: link},
        include: {
            model: Teams,
            as: "teams",
            attributes: ["id", "teamName"]
        }
    });
}

const updateUser = async (userId, user, teams, link_opened) => {
    if(link_opened) {
        await User.update({ link_opened: link_opened }, { where: { id: userId } })
    } else {
        const userObj = await User.update(user, { 
            returning: true, 
            plain: true, 
            where: {id: userId} 
        });
        await UsersTeams.destroy({ where: { UserId: userId } })
        for (let i = 0; i < teams.length; i++) {
            const element = teams[i];
            const user_team = { 
                UserId: userId, 
                TeamId: element 
            }
            await UsersTeams.create(user_team)
        }
        return userObj;
    }
}

const bulkUpdateUsers = async (isActive) => {
    console.log("isActiveeee", isActive)
    const users = await User.findAll({ order: [['id', 'DESC']] });
    // return users;
    for (let i = 0; i < users.length; i++) {
        const element = users[i];
        await User.update({ isActive: isActive }, {
            // returning: true, 
            plain: true, 
            where: {id: element.id}
        })
    }
    return users
}

const deleteUser = async (userId) => {
    return await User.destroy({ where: { id: userId } });
}

module.exports = {
    addUser,
    bulkaddUsers,
    getAllUsers,
    getUserById,
    getUserByLink,
    updateUser,
    deleteUser,
    getAllTeams,
    bulkUpdateUsers,
    getPaginatedUsersWithSearch,
    getAllUsersWithSearch
}