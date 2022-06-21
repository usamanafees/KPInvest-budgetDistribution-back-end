const userService = require('../services/database/user');
const filteredService = require('../services/database/filtered_score');
const randomize = require('randomatic');
const admin = require('../config/admin.json');

const login = async (request, response) => {
    try {
      const { email, password } = request.body;
      let authenticate = admin.filter(function(user){
            if(user.email === email && user.password === password)
            {
                return true;
            }else
            {
                return false;
            }
      });
    //   if (email !== admin_email) 
    //     throw 'Sorry, Email does not exist'
    //   if (password !== admin_password)
    //     throw 'Your passsword is wrong, Please try again'
      if(authenticate.length > 0) {
        return response.status(201).send({ success: true, message: "Login Successfully!", email: authenticate[0].email, status: 'Authorized' });
      } else {
        console.log("comming in else");

        return response.status(401).json({
            success: false,
            errorMessage: "Login Failed, Invalid email or password"
        });
      }
    } catch (err) {
        return response.status(500).json({
            success: false,
            message: "Login Failed, Not Authorized",
            errorMessage: err,
        });
    }
}

const addUser = async (request, response) => {
    try {
      const link = randomize('Aa', 6);
      const { firstName, lastName, email, teams } =
      request.body;
        const user = {
            firstName,
            lastName,
            email,
            link_key: link,
        }
        const result = await userService.addUser(user, teams);
        if(!result) {
            response.status(500).json({
                message: "User Not Created, Something went wrong!"
            });
        } else {
            return response.status(201).send({ success: true, message: "User Created Successfully!", user: result });
        }  
    } catch (err) {
        console.log("err====> ", err.errors[0].message);
        return response.status(500).json({
            message: "User Not Created",
            errorMessage: err.errors[0].message,
        });
    }
}

const bulkaddUsers = async(request, response) => {
    let {users} = request.body;
    let result = await userService.bulkaddUsers(users);
    if(result.length > 0)
    {
        return response.status(201).send({ 
            success: true, 
            message: "Users Uploaded Successfully!", 
            users: result
        });
    }else
    {
        return response.status(500).send({ 
            success: false, 
            message: "Users not uploaded, data already exist", 
            users: result
        });
    }

}

const getAllUsers = async (request, response, next) => {
    try {
        let users = await userService.getAllUsers()
        if(!users) {
            return response.status(404).send({ message: "Users Not Found!" });
        } else {
            return response.status(200).send({ 
                success: true, 
                message: "Users fetch Successfully!", 
                users: users,
            });
        }
    } catch (err) {
        return response.status(500).json({
            message: "Users Not Found",
            error: err.errors[0].message,
        });
    }
}

const getPaginatedUsersWithSearch = async (request, response, next) => {
    // console.log('Triggered=====>', request.body)
    const { page, perPage, status, q } = request.body;
    try {
        let users;
        users = await userService.getAllUsersWithSearch(q);
        const {count, rows} = await userService.getPaginatedUsersWithSearch(perPage, page, q)
        if(!users) {
            return response.status(404).send({ message: "Users Not Found!" });
        } else {
            return response.status(200).send({ 
                success: true, 
                message: "Users fetch Successfully!", 
                users: users,
                total: count,
                pagedData: rows
            });
        }
    } catch (err) {
        return response.status(500).json({
            message: "Users Not Found",
            error: err.errors,
        });
    }
}

const getUserById = async (request, response, next) => {
    try {
        const userId = request.params.id;
        const user = await userService.getUserById(userId);
        if(!user) {
            return response.status(404).send({ message: "User Not Found!" });
        } else {
            return response.status(200).send({ success: true, message: "User fetch Successfully!", user: user });
        }
    } catch (err) {
        return response.status(500).json({
            message: "User Not Found",
            errorMessage: err.errors[0].message,
        });
    }
}

const getUserByLink = async (request, response, next) => {
    try {
        const link = request.params.link;
        const user = await userService.getUserByLink(link);
        if(!user) {
            return response.status(404).send({ message: "User Not Found!" });
        } else {
            return response.status(200).send({ success: true, message: "User fetch Successfully!", user: user });
        }
    } catch (err) {
        return response.status(500).json({
            message: "User Not Found",
            errorMessage: err.errors[0].message,
        });
    }
}

const updateUser = async (request, response, next) => {
    try {
        let userId = request.params.id;
        const user = await userService.getUserById(userId);
        if(!user){
            // return a response to client
            response.status(404).json({
                message: "Not Found for updating a user with id = " + userId,
            });
        } else {    
        // update new change to database            
        const { firstName, isActive, email, lastName, teams, link_opened } =
          request.body;
          if(link_opened) {
            console.log("IINNN IIFFFF")
          } else {
              if(!firstName || !lastName || !email || teams.length === 0) {
                return response.send({ status: false, errorMessage: "Please fill all required fields"});
              }
          }
          const userObj = {
            firstName,
            lastName,
            email,
            isActive,
        }
          const result = await userService.updateUser(userId, userObj, teams, link_opened);
            if(!result) {
                response.status(500).json({
                    message: "User Not Updated, Something went wrong!"
                });
            } else {
                return response.status(201).send({ success: true, message: "User Updated Successfully!", updatedUser: result[1] });
            }  
        }
      } catch (err) {
          console.log("err====> ", err)
          return response.status(500).json({
            message: "User Not Updated",
            errorMessage: err.errors,
        });
      }
}

const bulkUpdateUsers = async (request, response, next) => {
    try {
        const { isActive } = request.body
        console.log("body=====>", request.body)
        const result = await userService.bulkUpdateUsers(isActive)
        if(!result) {
            response.status(500).json({
                message: "Users Not Updated, Something went wrong!"
            });
        } else {
            return response.status(201).send({ success: true, message: "Users Updated Successfully!", isActive: isActive });
        }
      } catch (err) {
          console.log("err====> ", err)
          return response.status(500).json({
            message: "Users Not Updated",
            errorMessage: err.errors,
        });
      }
}

const getAllTeams = async (request, response, next) => {
    try {
        const teams = await userService.getAllTeams();
        if(!teams) {
            return response.status(404).send({ message: "Teams Not Found!" });
        } else {
            return response.status(200).send({ success: true, message: "Teams fetch Successfully!", teams: teams });
        }
    } catch (err) {
        console.log("error ====> ", err)
        return response.status(500).json({
            message: "Teams Not Found",
            error: err.errors[0].message,
        });
    }
}

const filteredScore = async (request, response, next) => {
    try {
        const  { filtered, filteredUsers,check } = request.body
        const result = await filteredService.filteredScore(filtered, filteredUsers,check);
        if(!result) {
            return response.status(404).send({ message: "Users Not Found!" });
        } else {
            return response.status(200).send({ success: true, message: "Users fetch Successfully!", data: result });
        }
    } catch (err) {
        console.log("error ====> ", err)
        return response.status(500).json({
            message: "Users Not Found",
            error: err.errors[0].message,
        });
    }
}

const deleteUser = async (request, response, next) => {
    try{
        let userId = request.params.id;
        const user = await userService.getUserById(userId);
        if(!user){
            // return a response to client
            response.status(404).json({
                message: "Not Found for updating a user with id = " + userId,
            });
        } else {
            await userService.deleteUser(userId);
            response.status(200).json({
                success: true,
                message: "Delete Successfully a user with id = " + userId,
            });
        }
    } catch(error) {
        response.status(500).json({
            message: "User Not deleted",
            error: error.errors[0].message,
        });
    }
}

module.exports = {
    addUser,
    bulkaddUsers,
    getAllUsers,
    updateUser,
    getUserById,
    deleteUser,
    getAllTeams,
    getUserByLink,
    bulkUpdateUsers,
    getPaginatedUsersWithSearch,
    login,
    filteredScore
}