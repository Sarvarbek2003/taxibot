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

///////////////// admin ////////////////////////

const selectAdmin = async () => {
    let res = await data(`
        select * from admins
    `);
    return res;
}

const insertAdmin = async (obj) => {
    if(obj.city_name){
        let res = await data(`
            insert into city (city_name) values ($1) returning *
        `,obj.city_name);
        return res
    }else if (obj.dist){
        let res = await data(`
            insert into district (city_id, district_name) values ($1,$2) returning *
        `,obj.dist.city_id, obj.dist.dist_name);
        return res
    }else if(obj.addAdmin){
        let res = await data(`
            insert into admins (user_id) values ($1) returning *
        `, obj.addAdmin)
        return res
    }else if (obj.deladmin){
        let res = await data(`
            delete from admins where user_id = $1 returning *
        `, obj.deladmin);
        return res
    }
}

const deleteCity = async (obj) => {
    if(obj.city_id){
        await data(`
            delete from city where city_id = $1
        `, obj.city_id);
        let res = await data('select * from district where city_id = $1',obj.city_id);
        res.map(async el => {
            await data('delete from district where city_id = $1', el.city_id);
        });
    }else if(obj.dist_id){
        await data(`
            delete from district where district_id = $1
        `, obj.dist_id);
    }
}



////////////////////////////////////////////
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
    } else if(obj.phone){
        await data(`
            update users set phone = $2 where user_id = $1
        `,userId, obj.phone)
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
    }
    else if(obj.tel){
        await data(`
            update orders set phone = $2 where user_id = $1
        `,userId, obj.tel);
    }
    else if(obj.status){
        await data(`
            update orders set status = $2 where user_id = $1
        `,userId, obj.status);
    }
    else if(obj.count || obj.count == 0){
        await data(`
            update orders set count = $2 where user_id = $1
        `,userId, +obj.count);
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
            o.user_id,
            o.phone
        from orders as o
        left join city as c on o.to_city = c.city_id::varchar
        left join city as c1 on o.from_city = c1.city_id::varchar
        left join district as d on o.to_district = d.district_id::varchar 
        left join district as d1 on o.from_district = d1.district_id::varchar
        where o.user_id = $1
        group by o.user_id, c.city_name, c1.city_name, d.district_name, d1.district_name, o.time, o.date, o.phone, o.user_id
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
    selectAdmin,
    insertAdmin,
    selctUsers, 
    deleteCity,
    insertUser,
    selectCity,
    orders,
    order
}