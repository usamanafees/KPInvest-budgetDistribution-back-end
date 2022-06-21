const models = require('../../models');
const {
    sequelize
  } = require('sequelize');
const User = models.User;
const Ratings = models.Ratings;
const Settings = models.Settings;
const Teams = models.Teams;
const itrations = require('../iterative_alg')

const getAllRatings = async () => {
    const fromAll = await Ratings.findAll({
        include: [
            {
                model: User,
                as: 'rating_from',
                include: {
                    model: Teams,
                    as: 'teams',
                    attributes: ['id', 'teamName']
                }
            },
            {
                model: User,
                as: 'rating_to',
                include: {
                    model: Teams,
                    as: 'teams',
                    attributes: ['id', 'teamName']
                }
            },
        ],
        // where: { ratingFrom: 7 }
    });

    const IdArr = []
    for (let i = 0; i < fromAll.length; i++) {
        const element = fromAll[i];

        if(element.rating_to.participation_status === true) {
            IdArr.push(element.ratingTo)
        }
        
    }
    var granted = 0;
    for (let i = 0; i < fromAll.length; i++) {
        const element = fromAll[i];
        granted += element.score   
    }
    var appliedTotal = 0;
    for (let i = 0; i < fromAll.length; i++) {
        const element = fromAll[i];
        if(element.rating_from.participation_status === true) {
            appliedTotal += element.score   
        }
    }

    var appliedPercent = [];
    for (let i = 0; i < fromAll.length; i++) {
        const element = fromAll[i];
        if(element.rating_from.participation_status === true) {
            const percent = (element.score / appliedTotal) * 100
            // appliedPercent.push(Math.round(percent))
            appliedPercent.push(percent)
        }
    }

    var totalPercentForTo = 0;
        for (let n = 0; n < fromAll.length; n++) {
            const element = fromAll[n];
            if(element.rating_from.participation_status === true) {
                totalPercentForTo += Number(element.appliedPercent)
            }
        }

    return { fromAll, granted, IdArr} 
}

const getRatingByIds = async (rating_from, rating_to) => {
    return await Ratings.findOne({ 
        where: { ratingFrom: rating_from, ratingTo: rating_to } 
    });
}

const updateScore = async (rating) => {
    const rating_from = rating.ratingFrom;
    const rating_to = rating.ratingTo;
    const score = rating.score;
    // for get all from user total score
    const fromAll = await Ratings.findAll({ 
        where: { ratingFrom: rating_from },
        include: [
            {
                model: User,
                as: 'rating_from'
            },
            {
                model: User,
                as: 'rating_to'
            },
        ],
    })
    
    // Query for check rating already exist or not
    const result = await Ratings.findOne({ where: { ratingFrom: rating_from, ratingTo: rating_to } });
    if (!result) {
        console.log("=======IT COMES HERE IN CREATE!!!!======")
        // get user for rating_to
        const userTo = await User.findOne({ where: { id: rating_to } })
        // console.log("userTo======>", userTo)

        // Total Score/Granted/Applied
        var granted = 0;
        var applied = 0;
        for (let i = 0; i < fromAll.length; i++) {
            const element = fromAll[i];
            granted += Number(element.score)
            // Applied Total
            if(element.rating_to.participation_status === true) {
                applied += Number(element.score)  
            }
        }
        console.log('granted UPER======>', granted)
        // For subtract those user score who not participate but link opened
        for (let j = 0; j < fromAll.length; j++) {
            const element = fromAll[j];
            if(element.rating_to.link_opened === true && element.rating_to.participation_status === false) {
                granted = granted - Number(element.score)
            }
        }
        console.log('applied======>', applied)
        console.log('granted LOWER======>', granted)
        var grantedTotal = Number(granted) + Number(score);
        console.log("grantedTotal========>", grantedTotal)
        var appliedTotal = Number(applied) + Number(score)
        console.log("aplliedTotal========>", appliedTotal) 

        // applied percentage for ratingTo User
        var percent = 0;
        if (userTo.link_opened === false && userTo.participation_status === false) {
            // const appliedPercent = score / grantedTotal * 100
            // percent = appliedPercent.toFixed(2);
            percent = 0;
            console.log("======= Percent IN IFFFF ===>", percent)
        } else if(userTo.link_opened === true && userTo.participation_status === false) {
            percent = 0;
            console.log("======= IIINNN EEELSLLEE===>")
        } else if(userTo.participation_status === true) { // If rating_to status=true from any one emplyee, but its score 0
            const appliedPercent = (score / appliedTotal) * 100
            // percent = Math.round(appliedPercent);
            percent = appliedPercent
            console.log("======= Percent IN APPLIED ELSSEE ===>", percent)
        }

        const ratingObj = {
            score,
            appliedPercent: percent,
            ratingFrom: rating_from,
            ratingTo: rating_to
        }
        const updatedScore = await Ratings.create(ratingObj);
        console.log("updateScore=========>", updatedScore)
        // for get all from user total score
        const fromAllAfterUpdate = await Ratings.findAll({ 
            where: { ratingFrom: rating_from },
            include: [
                {
                    model: User,
                    as: 'rating_from'
                },
                {
                    model: User,
                    as: 'rating_to'
                },
            ],
        })
        // Update other rating_to applied %
        var totalScore = 0 // this is for aftere add score and get updated %
        for (let m = 0; m < fromAllAfterUpdate.length; m++) {
            const element = fromAllAfterUpdate[m];
            if(element.rating_to.participation_status === true) {
                totalScore += Number(element.score)
            }
        }
        for (let k = 0; k < fromAllAfterUpdate.length; k++) {
            const element = fromAllAfterUpdate[k];
            if(element.rating_to.participation_status === true) {    
                console.log("totalScore IN Looop=======>", totalScore)
                await Ratings.update({ appliedPercent: ((element.score/totalScore) * 100) }, { 
                    where: { ratingFrom: element.rating_from.id, ratingTo: element.rating_to.id }
                })
            }
        }
        // updating previous appliced percentages and its participation status
        
        let existing_user_status = await User.findOne({where: {id: rating_from} });
        if(existing_user_status.participation_status === false)
        {
            // Update user to active when it place rating
            await User.update({participation_status: true}, {where: {id: rating_from} });
            const existing_ratings = await Ratings.findAll({ 
                where: {ratingTo: rating_from}
            });
            for (let i = 0; i < existing_ratings.length; i++) {
                const element = existing_ratings[i];
                const updatedPercentages = await Ratings.findAll({
                    where: { ratingFrom: element.ratingFrom},
                    include: [
                        {model: User, as: 'rating_to'},
                        {model: User, as: 'rating_from'},
                    ]
                });
                let total_score_ = 0
                for (let k = 0; k < updatedPercentages.length; k++) {
                    const element = updatedPercentages[k];
                    if(element.rating_to.participation_status === true) {  
                        total_score_ += element.score    
                    }
                }

                for (let l = 0; l < updatedPercentages.length; l++) {
                    const element = updatedPercentages[l];
                    if(element.rating_to.participation_status === true) {    
                        console.log("totalScore IN Looop=======>", total_score_)
                        await Ratings.update({ appliedPercent: ((element.score/total_score_) * 100) }, { 
                            where: { ratingFrom: element.rating_from.id, ratingTo: element.rating_to.id }
                        });
                    }
                }
            
            // console.log('total_score======>', total_score,updatedPercentages[0].ratingFrom,updatedPercentages[1].ratingFrom);
            // process.exit();
            }
            // console.log("all the ratings to for fisrt time status true",existing_ratings)

        }
        return {
            updatedScore
            // updatedUser: updatedUser[1]
        }
    } else {
        console.log("======IT COMES HERE IN UPDATE!!!!=======")
        // Total Score/Granted/Applied
        var granted = 0;
        var applied = 0;
        for (let i = 0; i < fromAll.length; i++) {
            const element = fromAll[i];
            if(element.rating_to.id !== rating_to) {
                granted += Number(element.score)
                // Applied Total
                if(element.rating_to.participation_status === true) {
                    applied += Number(element.score)  
                }
            }
        }
        // For subtract those user score who not participate but link opened
        for (let j = 0; j < fromAll.length; j++) {
            const element = fromAll[j];
            if(element.rating_to.id !== rating_to && element.rating_to.link_opened === true && element.rating_to.participation_status === false) {
                granted = granted - Number(element.score)
            }
        }
        console.log('applied======>', applied)
        console.log('granted======>', granted)
        var grantedTotal = Number(granted) + Number(score);
        console.log("grantedTotal========>", grantedTotal)
        var appliedTotal = Number(applied) + Number(score)
        console.log("aplliedTotal========>", appliedTotal) 
        // get user for rating_to
        const userTo = await User.findOne({ where: { id: rating_to } })
        // console.log("userTo======>", userTo)

        // applied percentage for ratingTo User
        var percent = 0;
        if (userTo.link_opened === false && userTo.participation_status === false) {
            // const appliedPercent = score / grantedTotal * 100
            // percent = appliedPercent.toFixed(2);
            percent = 0;
            console.log("======= Percent IN IFFFF ===>", percent)
        } else if(userTo.link_opened === true && userTo.participation_status === false) {
            percent = 0;
            console.log("======= IIINNN EEELSLLEE===>")
        } else if(userTo.participation_status === true) { // If rating_to status=true from any one emplyee, but its score 0
            const appliedPercent = (score / appliedTotal) * 100
            // percent = Math.round(appliedPercent);
            percent = appliedPercent
            console.log("======= Percent IN APPLIED ELSSEE ===>", percent)
        }

        const ratingObj = {
            score,
            appliedPercent: percent,
            ratingFrom: rating_from,
            ratingTo: rating_to
        }
        // Update Rating Score
        const updatedScore = await Ratings.update(ratingObj, { 
            returning: true,
            plain: true, 
            where: {ratingFrom: rating_from, ratingTo: rating_to} 
        });

        const updated_ratings_false = await Ratings.findAll({ 
            where: {ratingFrom: rating_from},
            include: [
                {model: User, as: 'rating_to'},
                {model: User, as: 'rating_from'},
            ]
        });

        let updated_total_score_ = 0
        for (let k = 0; k < updated_ratings_false.length; k++) {
            const element = updated_ratings_false[k];
            // if(element.rating_to.participation_status === true) {  
                updated_total_score_ += element.score    
            // }
        }
        console.log("$$$$$$$$$$$$$$$$");
        console.log("$$$$$$$$$$$$$$$$");
        console.log("$$$$$$$$$$$$$$$$",updated_total_score_);
        if(updated_total_score_ <= 0) {
            await User.update({participation_status: false}, {where: {id: rating_from} });
            console.log("comming from if",updated_total_score_);

                const existing_ratings = await Ratings.findAll({ 
                    where: {ratingTo: rating_from}
                });
                for (let i = 0; i < existing_ratings.length; i++) {
                    const element = existing_ratings[i];
                    const updatedPercentages = await Ratings.findAll({
                        where: { ratingFrom: element.ratingFrom},
                        include: [
                            {model: User, as: 'rating_to'},
                            {model: User, as: 'rating_from'},
                        ]
                    });
                    let total_score_ = 0
                    for (let k = 0; k < updatedPercentages.length; k++) {
                        const element = updatedPercentages[k];
                        if(element.rating_to.participation_status === true) {  
                            total_score_ += element.score    
                        }
                    }
    
                    for (let l = 0; l < updatedPercentages.length; l++) {
                        const element = updatedPercentages[l];
                        if(element.rating_to.participation_status === true) {    
                            await Ratings.update({ appliedPercent: ((element.score/total_score_) * 100) }, { 
                                where: { ratingFrom: element.rating_from.id, ratingTo: element.rating_to.id }
                            });
                        }else
                        {
                            await Ratings.update({ appliedPercent: 0 }, { 
                                where: { ratingFrom: element.rating_from.id, ratingTo: element.rating_to.id }
                            });
                        }
                    }
                }
        } else 
        {
            console.log("comming from elseeeeeee",updated_total_score_);
            let existing_user_status = await User.findOne({where: {id: rating_from} });
            if(existing_user_status.participation_status === false)
            {
                console.log("comming from 2nd elseeeeeee",updated_total_score_);

                await User.update({participation_status: true}, {where: {id: rating_from} });
                const existing_ratings = await Ratings.findAll({ 
                    where: {ratingTo: rating_from}
                });
                for (let i = 0; i < existing_ratings.length; i++) {
                    const element = existing_ratings[i];
                    const updatedPercentages = await Ratings.findAll({
                        where: { ratingFrom: element.ratingFrom},
                        include: [
                            {model: User, as: 'rating_to'},
                            {model: User, as: 'rating_from'},
                        ]
                    });
                    let total_score_ = 0
                    for (let k = 0; k < updatedPercentages.length; k++) {
                        const element = updatedPercentages[k];
                        if(element.rating_to.participation_status === true) {  
                            total_score_ += element.score    
                        }
                    }

                    for (let l = 0; l < updatedPercentages.length; l++) {
                        const element = updatedPercentages[l];
                        if(element.rating_to.participation_status === true) {    
                            console.log("totalScore IN Looop=======>", total_score_)
                            await Ratings.update({ appliedPercent: ((element.score/total_score_) * 100) }, { 
                                where: { ratingFrom: element.rating_from.id, ratingTo: element.rating_to.id }
                            });
                        }
                    }
                
                // console.log('total_score======>', total_score,updatedPercentages[0].ratingFrom,updatedPercentages[1].ratingFrom);
                // process.exit();
                }
            }
        }

        // if(grantedTotal <= 0) {
        //     await User.update({participation_status: false}, {where: {id: rating_from} });
        // } else {
        //     await User.update({participation_status: true}, {where: {id: rating_from} });
        // }

        // for get all from user total score
        const fromAllAfterUpdate = await Ratings.findAll({ 
            where: { ratingFrom: rating_from },
            include: [
                {
                    model: User,
                    as: 'rating_from'
                },
                {
                    model: User,
                    as: 'rating_to'
                },
            ],
        })
        // Update other rating_to applied %
        var totalScore = 0 // this is for aftere add score and get updated %
        for (let m = 0; m < fromAllAfterUpdate.length; m++) {
            const element = fromAllAfterUpdate[m];
            if(element.rating_to.participation_status === true) {
                totalScore += Number(element.score)
            }
        }
        for (let k = 0; k < fromAllAfterUpdate.length; k++) {
            const element = fromAllAfterUpdate[k];
            if(element.rating_to.participation_status === true) {    
                console.log("totalScore IN Looop=======>", totalScore)
                await Ratings.update({ appliedPercent: ((element.score/totalScore) * 100) }, { 
                    where: { ratingFrom: element.rating_from.id, ratingTo: element.rating_to.id }
                })
            }
        }

        // starting to work on iterative algorithm after applied percentage has been updated
        const setting = await Settings.findAll();
        console.log("setting====>", setting)
        const bonusPool = setting[0].org_bonus_pool;
        console.log("before calling iteratve alg=====>")
        await itrations.iterative_algrithm(setting[0].id,bonusPool,"after_update_applied");
        console.log("after calling iteratve alg=====>")

        // Get totalPercent for rating_to against all rating_from
        // const percentFromRatingTo = await Ratings.findAll({
        //     where: { ratingTo: updatedScore[1].ratingTo },
        //     include: [
        //         {model: User, as: 'rating_to'},
        //         {model: User, as: 'rating_from'}
        //     ]
        // })
        // console.log("percentFromTo=====>", percentFromRatingTo)
        // var totalPercentForTo = 0;
        // for (let n = 0; n < percentFromRatingTo.length; n++) {
        //     const element = percentFromRatingTo[n];
        //     if(element.rating_from.participation_status === true) {
        //         totalPercentForTo += Number(element.appliedPercent)
        //     }
        // }
        // console.log("totalPercentForTo", totalPercentForTo)

        // Update Score into User
        // const updatedUser = await User.update({ score: rating.score}, 
        //  {
        //     returning: true, 
        //     plain: true, 
        //     where: { id: rating_to }
        // })
        return {
            updatedScore: updatedScore[1], 
            // updatedUser: updatedUser[1]
        }
    }  
}
module.exports = {
    getAllRatings,
    getRatingByIds,
    updateScore
}