const models = require('../models');
const Settings = models.Settings;
const User = models.User;
const Ratings = models.Ratings;

const iterative_algrithm = async (Id, data, flag_condition="bonus") => {
    let bonusPool = 0;
    let updatedBonus = 0;
    if(flag_condition == "after_update_applied")
    {
         bonusPool = data;
    }else
    {
        updatedBonus =  await Settings.update(data, { returning: true, plain: true, where: {id: Id} });
        bonusPool = updatedBonus[1].org_bonus_pool;
    }

    // for get all rating_to users from rating_from 
    const fromAll = await Ratings.findAll({ 
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
        // where: { ratingFrom: 7 }
    })

    // for get all rating_to users from rating_from 
    const allUsers = await User.findAll({ 
        order: [ ['id', 'DESC'] ]
    })
    // console.log("allUsers=========>", allUsers)
    // console.log("fromAll========>", fromAll)

    // Assign defult 0
    let arr = [];
    for (let j = 0; j < allUsers.length; j++) {
        const element = allUsers[j];
        for (let k = 0; k < fromAll.length; k++) {
            const el = fromAll[k];
            if(el.rating_to.participation_status === true) {
                if(element.id === el.rating_from.id || element.id === el.rating_to.id) {
                    arr.push(element.id);
                }
            }
        }
    }
    var unique = arr.filter(function(elem, index, self) {
        return index === self.indexOf(elem);
    });
    console.log("total users",unique);
    unique.sort(function(a, b) {
        return a - b;
    });

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

    var random;
    if(flow.length > 0) {
        random = flow[0];
        flow[0].bonus_value = bonusPool
        if(random.to_arr.length > 0) {
            const element = random.to_arr[0];
            for(var key in element) {
                for (let j = 0; j < fromAll.length; j++) {
                    const from_all = fromAll[j];
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
    // console.log("first iteration result",flow);
    // process.exit();
    // next flow for different iteration
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
                for (let j = 0; j < fromAll.length; j++) {
                    const from_all = fromAll[j];
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
            console.log("aaaaaaaaaaaaaaa from updating",flow[z].prev_total ,"@@@@@@@", flow[z].total_aloc_val);
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
            for (let j = 0; j < flow.length; j++) {
                const element = flow[j];
                const real_value = Math.round(element.total_rev_value)
                await User.update({ score:real_value }, {
                    where: { id: element.own }
                })
            }
        }
    }
    console.log("count init", count_init);
    return updatedBonus;
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
    iterative_algrithm
}