const models = require('../../models');
const User = models.User;
const Teams = models.Teams;
const Ratings = models.Ratings;
const UsersTeams = models.UsersTeams;
const Settings = models.Settings;
const { QueryTypes } = require('sequelize')
const filteredScore = async (filtered, filteredUsers,check_f) => {

    console.log('fitered=====>',check_f)
    // console.log('fitered=====> llllllll', filtered,filteredUsers.length)
    const filtered_users = await models.sequelize.query(`with cte as (
        SELECT "UserId" FROM public."UsersTeams" where "TeamId" in (${filtered})
        )
        select id,"firstName","lastName" from "Users" where "id" in (select * from cte) and "participation_status" = true`, {
        type: QueryTypes.SELECT
    });
    let filtered_user_array = filtered_users.map((el)=>{
        return el.id;
    });
    var unique = filtered_user_array.filter(function(elem, index, self) {
        return index === self.indexOf(elem);
    });

    let ratings_ = await models.sequelize.query(`
        select * from "Ratings" where "ratingFrom" in (${unique}) and "ratingTo" in (${unique})`, {
        type: QueryTypes.SELECT
    });

    // process.exit();
    // duplication_array
    let duplication_array = [];
    for (let i = 0; i < ratings_.length; i++) 
    {
        if(duplication_array.includes(ratings_[i].ratingFrom))
        {
            continue;
        }else
        {
            duplication_array.push(ratings_[i].ratingFrom);
        }
        let rating_init = ratings_[i].ratingFrom; 
        let rating_init_sum = 0;
        let rating_to_array = [];
        for(let j=0;j<ratings_.length;j++)
        {
            if(ratings_[j].ratingFrom === rating_init)
            {
                let found = ratings_.some(el => el.ratingFrom === ratings_[j].ratingTo);
                let temp_sum_j = 0;
                for (let index = 0; index < ratings_.length; index++) {
                    if(ratings_[index].ratingFrom === ratings_[j].ratingTo)
                    { 
                        temp_sum_j += ratings_[index].score;
                    }                    
                }
                if(found === true && temp_sum_j > 0)
                {
                    rating_init_sum += ratings_[j].score;
                    rating_to_array.push(j);
                }else
                {
                    ratings_[j].appliedPercent = 0;
                }
            }
        }
        if(rating_to_array.length > 0)
        {
            for(let k=0;k<rating_to_array.length;k++)
            {
                let apl_p = (ratings_[rating_to_array[k]].score/rating_init_sum) * 100;
                if(isNaN(apl_p))
                {
                    ratings_[rating_to_array[k]].appliedPercent = 0;
                }else
                {
                    ratings_[rating_to_array[k]].appliedPercent = apl_p;
                }
            }
        }
    }
// * for testing
// for (let index = 0; index < ratings_.length; index++) {
//     console.log('users======>aaaaaaaaaaaaaazzzzzbbb', ratings_[index].ratingFrom,"->",ratings_[index].ratingTo,"///",ratings_[index].score,"==",ratings_[index].appliedPercent);
// }
// * for testing

    unique.sort(function(a, b) {
        return a - b;
    });

    let export_csv = [];

    // first row initializatio 
    let arr = [];
    arr.push('user inputs');
    for(let x in unique)
    {
        let user = filtered_users.filter(user => user.id === unique[x])
        arr.push(user[0].firstName+' '+user[0].lastName);
    }
    export_csv.push(arr);

        // adding raw allocations to multidimentional arrays

    for(let i in unique)
    {
        let temp_csv_row = [];
        let user = filtered_users.filter(user => user.id === unique[i])
        temp_csv_row.push(user[0].firstName+' '+user[0].lastName);
        for(let x in unique)
        {
            if(unique[x] === unique[i])
            {
                temp_csv_row.push('0');
                continue;
            }else
            {
                let aplp_temp = ratings_.filter(function (rating) {
                    if(rating.ratingFrom === unique[i] && rating.ratingTo === unique[x])
                    {
                        return rating;
                    }else
                    {
                        return false;
                    }
                });
                if(aplp_temp.length>0)
                {
                    temp_csv_row.push((aplp_temp[0].appliedPercent).toString());
                }else
                {
                    temp_csv_row.push('0');
                }
            }
        }
        export_csv.push(temp_csv_row);
    }

// console.log("xxxxxxcxfxfdukgjhfxfcghjkljhgcf",export_csv);

    let flow = [];
    for (let i = 0; i < unique.length; i++) {
        const el = unique[i];
        const obj = { 
            own: el, 
            bonus_value: 0,
            prev_total: 0, 
            total_aloc_val: 0,
            total_rev_value:0 
        }
            let to_array= [];
            let to_obj= {};
        for(let j = 0; j < unique.length; j++) {
            const element = unique[j];
            if(element !== el) {
                to_obj['' + element] = 0;
            }
        }
        to_array.push(to_obj);
        obj['to_arr'] = to_array;
        flow.push(obj);
    }
     let bonusPool = 0;

    // random initialization
    if(flow.length > 0) {
        const setting = await Settings.findAll();
        bonusPool = setting[0].org_bonus_pool;
        let random = flow[0];
        flow[0].bonus_value = bonusPool
        if(random.to_arr.length > 0) {
            const element = random.to_arr[0];
            for(var key in element) {
                for (let j = 0; j < ratings_.length; j++) {
                    const from_all = ratings_[j];
                    if(from_all.ratingTo === Number(key) && from_all.ratingFrom === random.own) {
                        flow[0].to_arr[0][key] = (from_all.appliedPercent/100) * flow[0].bonus_value;
                        flow[0].total_aloc_val += flow[0].to_arr[0][key];
                    }
                }
            }
            for (let i = 0; i < flow.length; i++) {
                let total_rev = await calculate_rev(flow,flow[i].own,i);
                flow[i].total_rev_value = total_rev;
            }
        }
    }


    // starting filtered iterations
    let chek_flag = 1;
    let count_init = 0;
    while(chek_flag == 1) {
        count_init ++;
        let init_arr_ = [];
        for(let i = 0; i < flow.length; i++) {
            if(flow[i].total_rev_value > 0) {
                init_arr_.push(i);
            }
        }
        // console.log("initialization array",init_arr_);
        // setting every thing again to zero
        for(let j = 0; j < flow.length; j++) {
            const element_ = flow[j].to_arr[0];
            flow[j].prev_total = flow[j].total_aloc_val;
            flow[j].bonus_value = flow[j].total_rev_value;
            flow[j].total_rev_value = 0;
            flow[j].total_aloc_val = 0;
            for(var key in element_) {
                flow[j].to_arr[0][key] = 0;
                // flow[j].total_aloc_val += flow[j].to_arr[0][key];
            }
        }

        for(let x = 0; x < init_arr_.length; x++) {
            // console.log("from first for loop",init_arr_[x]);
            const element_ = flow[init_arr_[x]].to_arr[0];
            flow[init_arr_[x]].total_aloc_val = 0;

            for(var key in element_) {
                for (let j = 0; j < ratings_.length; j++) {
                    const from_all = ratings_[j];
                    if(from_all.ratingTo === Number(key) && from_all.ratingFrom === flow[init_arr_[x]].own) {
                        flow[init_arr_[x]].to_arr[0][key] = (from_all.appliedPercent/100) * flow[init_arr_[x]].bonus_value;
                        flow[init_arr_[x]].total_aloc_val += flow[init_arr_[x]].to_arr[0][key];
                    }
                }
            }
        }
        for(let y = 0; y < flow.length; y++) {
            let total_rev = await calculate_rev(flow,flow[y].own,y);
                flow[y].total_rev_value = total_rev;
        }
        for(let z=0;z<flow.length;z++)
        {
            // if(flow[z].prev_total.toFixed(4) === flow[z].total_aloc_val.toFixed(4))
            if(Math.round(flow[z].prev_total) === Math.round(flow[z].total_aloc_val))
            {
                chek_flag=0;
            }else
            {
                chek_flag=1;
                break;
            }
        }
        if(count_init == 1700){
            chek_flag=0;
        }
        // update users to add output vlue in to users table
        if (chek_flag === 0) {
            console.log("total count init",count_init);
            for(let k=0;k<filteredUsers.length;k++)
            {
                for (let j = 0; j < flow.length; j++) {
                    if(filteredUsers[k].id === flow[j].own)
                    {
                        // console.log("abc",filteredUsers[k].id ,flow[j].own,"===",flow[j].total_rev_value);
                        filteredUsers[k].score = Math.round(flow[j].total_rev_value);
                    }
                }
            }
        }
    }
    return {'filteredUsers':filteredUsers,'export_csv':export_csv};
}
async function calculate_rev(flow,key,index) {
    let count_ = 0;
    for(let i = 0; i < flow.length; i++) {
        if(i != index) {
            count_ += flow[i].to_arr[0][key];
        }
    }
    return count_;
}
module.exports = {
    filteredScore
}