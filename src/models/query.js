const { data } = require('./postgres.js');

///////////////////   users    //////////////////////

const selctUsers = async () => {
    let res = await data(`
        select * from users
    `);
    return res
}

const insertUser = async (userId,steep) => {
    steep = steep.join(' ');
    let res = await data(`
        insert into users (user_id, steep) values 
        ($1, $2)
    `,userId, steep);
    return res
}


const updateUsers = async (userId, obj) => {
    if(obj.steep){
        let steep = obj.steep.join(' ');
        let res = await data(`
            update users set steep = $2 where user_id = $1 returning *
        `,userId, steep);
    }else if(obj.username){
        await data(`
            update users set username = $2 where user_id =$1
        `,userId, obj.username);
    }else if(obj.roole){
        const is_pas = obj.roole?.is_ps || false;
        const is_dr = obj.roole?.is_dr || false;
        await data(`
            update users set is_driver = $2, is_passager = $3 where user_id = $1
        `,userId, is_dr, is_pas);
    }
    
}

///////////////////  orders  //////////////////////

const orders = async (chatId) => {
    let res = await data(`
        select * from orders where user_id = $1
    `,chatId);
    return res
}

const orderSearch = async () => {
    let res = await data(`
        select * from orders
    `);
    return res
}

const insertOrder = async (userId, roole) => {
    await data(`
        insert into orders (user_id, roole) values
        ($1, $2)
    `,userId, roole);
}

const updateOrder = async(userId,obj) => {
    if(obj.from_city){
        await data(`
            update orders set from_city = $2 where user_id = $1
        `,userId, obj.from_city);
    }else if(obj.from_dist){
        await data(`
            update orders set from_district = $2 where user_id = $1
        `,userId, obj.from_dist);
    }else if(obj.to_city){
        await data(`
            update orders set to_city = $2 where user_id = $1
        `,userId, obj.to_city);
    }else if(obj.to_district){
        await data(`
            update orders set to_district = $2 where user_id = $1
        `,userId, obj.to_district);
    }else if(obj.time){
        await data(`
            update orders set time = $2 where user_id = $1
        `,userId, +obj.time);
    }else if(obj.date){
        await data(`
            update orders set date = $2 where user_id = $1
        `,userId, +obj.date);
    }else if(obj.tel){
        await data(`
            update orders set phone = $2 where user_id = $1
        `,userId, +obj.tel);
    }
}

const order = async(userId) => {
    let res = await data(`
        select 
            c1.city_name as from_city,
            c.city_name as to_city,
            d1.district_name as from_district,
            d.district_name as to_district,
            o.time,
            o.date,
            o.phone
        from orders as o
        left join city as c on o.to_city = c.city_id::varchar
        left join city as c1 on o.from_city = c1.city_id::varchar
        left join district as d on o.to_district = d.district_id::varchar 
        left join district as d1 on o.from_district = d1.district_id::varchar
        where o.user_id = $1
        group by o.user_id, c.city_name, c1.city_name, d.district_name, d1.district_name, o.time, o.date, o.phone
    `,userId);
    return res[0]
}

const deleteOrder = async (userId) => {
    await data(`
        delete from orders where user_id = $1
    `,userId);
}
//////////////////   city   ///////////////////////

const selectCity = async (city) => {
    if(city){
        let res = await data(`
            select * from city
        `);
        return res
    } else {
        let res = await data(`
            select * from district
        `);
        return res
    }
}


module.exports = {
    insertOrder,
    updateUsers,
    deleteOrder,
    orderSearch,
    updateOrder,
    selctUsers, 
    insertUser,
    selectCity,
    orders,
    order
}