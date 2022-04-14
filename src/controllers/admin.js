const { admin } = require('../menu.js');
const { insertAdmin, selctUsers, selectCity, updateUsers, deleteCity } = require('../models/query.js')

let list = [];
let list2 = [];
const textPanel = async (bot, msg) =>  {
    let chatId = msg.chat.id;
    let text = msg.text;
    let steep = (await selctUsers()).find(user => user.user_id == chatId)?.steep.split(' ');
    let st = steep[steep.length - 1];
    if(text == '➕ Viloyat qo\'shish' && st == 'admin'){
        steep.push('addCity');
        await updateUsers(chatId, {steep: steep});
        bot.sendMessage(chatId, "➕ Qo'shmoqchi bo'lgan viloyatingiz nomini yozing");
    }
    else if(text == '➕ Shaxar qo\'shish' && st == 'admin'){
        steep.push('addDist');
        await updateUsers(chatId, {steep: steep});
        let obj = await button('city')
        bot.sendMessage(chatId, "➕ Qo'shmoqchi bo'lgan shaxringiz qaysi viloyatda",{
            reply_markup: {
                resize_keyboard: true,
                keyboard: obj.cit.inline_keyboard
            }
        })
    }
    else if(text == '🔝 Admin qo\'shish' && st == 'admin'){
        steep.push('addAdm');
        await updateUsers(chatId, {steep: steep});
        bot.sendMessage(chatId, "➕ Qo'shmoqchi bo'lgan Admin id raqamini yozing");
    }
    else if(text == '➖ Viloyat o\'chirish' && st == 'admin'){
        let obj = await button(true);
        bot.sendMessage(chatId, "O'chirmoqchi bo'lgan viloyatingizni belgilang",{
            reply_markup: obj.cit
        });
    }
    else if(text == '➖ Shaxar o\'chirish' && st == 'admin'){
        let obj = await button('cit');
        bot.sendMessage(chatId, "O'chirmoqchi bo'lgan shaxringizni qaysi viloyatda",{
            reply_markup: obj.cit
        });
    }
    else if(st == 'addCity'){
        await insertAdmin({city_name: text})
        bot.sendMessage(chatId, "Viloyat qo'shildi ✅")
    }
    else if(st == 'addDist'){
        await insertAdmin({dist: {city_id}})
        bot.sendMessage(chatId, "Viloyat qo'shildi ✅")
    }
}

const inlinePanel = async (bot, msg) => {
    let chatId = msg.from.id;
    let data = msg.data;
    let msgId = msg.message.message_id;
    let dat = data.split('=')[0];
    data = data.split('=')[1]; 

    if(dat == 'deleteCity'){
        list.push(+data)
        let obj = await button(true, data)
        let txt = obj?.cit_name;
        bot.editMessageText("O'chirmoqchi bo'lgan viloyatingizni belgilang\n\n"+txt,{
            chat_id: chatId,
            message_id: msgId,
            reply_markup: obj.cit
        });
    } else if(dat == 'city'){
        list.push(+data);
        let obj = await button(false,data);
        bot.editMessageText("O'chirmoqchi bo'lgan shaxarlaringizni belgilang",{
            chat_id: chatId,
            message_id: msgId,
            reply_markup: obj.cit
        });
    } else if (dat == 'deleteDist'){
        list2.push(+data);
        let obj = await button(false,data);
        let txt = obj?.cit_name;
        bot.editMessageText("O'chirmoqchi bo'lgan shaxarlaringizni belgilang\n\n"+txt,{
            chat_id: chatId,
            message_id: msgId,
            reply_markup: obj.cit
        });
    } else if (dat == 'delete'){
        list.map(async el => {
            await deleteCity({city_id: +el})
        })
    }else if(dat == 'deleteDstr'){
        list2.map(async el => {
            await deleteCity({dist_id: +el})
        })
    }
}

async function button (kluch,data) {
    let city = await selectCity(kluch == 'cit' || kluch == true ? true : false);
    let array = [];
    let cit_name = '';
    if(kluch == 'cit'){
        city.map(el => {
            if(!data) array.push([{text: el.city_name, callback_data: 'city='+el.city_id}])
            if(data) array.push([{text: el.city_name}])
        });
    }else if(kluch === true){
        city.map(el => {
            if(data == el.city_id || list.includes(el.city_id)){
                array.push([{text:'✅ '+ el.city_name, callback_data: 'deleteCity='+el.city_id}]);
                cit_name+='\n'+el.city_name;
            }
            else array.push([{text: el.city_name, callback_data: 'deleteCity='+el.city_id}])
        });
        array.push([{text: '❌ O\'chirish', callback_data: 'delete'}])
    }else if(kluch === false){
        city.map(el => {
            if(list.includes(el.city_id)){
                if(data == el.district_id || list2.includes(el.district_id)){
                    array.push([{text:'✅ '+ el.district_name, callback_data: 'deleteDist='+el.district_id}]);
                    cit_name+='\n'+el.district_name;
                }
                else array.push([{text: el.district_name, callback_data: 'deleteDist='+el.district_id}])
            }
        });
        array.push([{text: '❌ O\'chirish', callback_data: 'deleteDstr'}])
    } 
    return {cit_name: cit_name, cit:{ inline_keyboard: array }}
}

module.exports = {
    inlinePanel,
    textPanel
}