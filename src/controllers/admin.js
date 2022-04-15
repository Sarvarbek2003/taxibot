const { admin,send, cancel } = require('../menu.js');
const { insertAdmin, selectAdmin, selctUsers, selectCity, updateUsers, deleteCity } = require('../models/query.js')

let list = [];
let list2 = [];
let citId;
let sendRoole;
let habar;
let photo;
let forId;
const textPanel = async (bot, msg) =>  {
    let chatId = msg.chat.id;
    let text = msg.text;
    let steep = (await selctUsers()).find(user => user.user_id == chatId)?.steep.split(' ');
    let st = steep[steep.length - 1];
    if(text == '➕ Viloyat qo\'shish' && st == 'admin'){
        steep.push('addCity');
        await updateUsers(chatId, {steep: steep});
        bot.sendMessage(chatId, "➕ Qo'shmoqchi bo'lgan viloyatingiz nomini yozing",{
            reply_markup: {
                resize_keyboard: true, 
                keyboard: [
                    [{text: '🔙 Ortga'}],
                ]
            }
        });
    }
    else if(text == '➕ Shaxar qo\'shish' && st == 'admin'){
        steep.push('addDist');
        await updateUsers(chatId, {steep: steep});
        let obj = await button('cit',true);
        bot.sendMessage(chatId, "➕ Qo'shmoqchi bo'lgan shaxringiz qaysi viloyatda",{
            reply_markup: {
                resize_keyboard: true,
                keyboard: obj.cit.inline_keyboard
            }
        })
    }
    else if(text == '🔝 Admin qo\'shish' && st == 'admin'){
        let res = (await selectAdmin())[0];
        if(res.roole == 'root' && res.user_id == chatId){
            steep.push('addAdm');
            await updateUsers(chatId, {steep: steep});
            bot.sendMessage(chatId, "➕ Qo'shmoqchi bo'lgan Admin id raqamini yozing",{reply_markup: cancel});
        }else bot.sendMessage(chatId, "Kechirasiz sizning admin qo'shish uchun ruxsatingiz yo'q buni faqat bosh admin qila oladi")
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
    else if (text == '➖ Admin o\'chirish' && st == 'admin'){
        let res = (await selectAdmin())[0];
        if(res.roole == 'root' && res.user_id == chatId){
            steep.push('addAdm');
            await updateUsers(chatId, {steep: steep});
            bot.sendMessage(chatId, "Olib tashlamoqchi bo'lgan admin id raqamini kiriting",{reply_markup:cancel})
        }else bot.sendMessage(chatId, "Kechirasiz sizning admin olib tashlash uchun ruxsatingiz yo'q buni faqat bosh admin qila oladi")
    }
    else if(st == 'addCity'){
        let res = await insertAdmin({city_name: text});
        await updateUsers(chatId, {steep: ['admin']})
        if(res.length){
            bot.sendMessage(chatId, "Viloyat qo'shildi ✅",{reply_markup: admin});
        }else bot.sendMessage(chatId, "Viloyat qo'shilmadi qayta urinib ko'ring ♻️",{reply_markup: admin})
    }
    else if(st == 'addDist'){
        citId = (await selectCity(true)).find(el => el.city_name == text);
        if(citId.length) return bot.sendMessage(chatId, "Bunday viloyat yo'q avval bu viloyatni qo'shing");
        steep.push('addDist2');
        await updateUsers(chatId, {steep: steep})
        bot.sendMessage(chatId, "Qo'shmoqchi bo'lgan shaxringizni yozing",{
            reply_markup: {
                resize_keyboard: true, 
                keyboard: [
                    [{text: '🔙 Ortga'}],
                ]
            }
        })
    }
    else if(text  == '🚖 Haydovchilarga xabar'){
        sendRoole = 'driver';
        bot.sendMessage(chatId, "🔖 Xabar turini tanlang",{
            reply_markup: send
        });
    }
    else if(text  == '🏃 Yo\'lovchilarga xabar'){
        sendRoole = 'passager';
        bot.sendMessage(chatId, "🔖 Xabar turini tanlang",{
            reply_markup: send
        });
    }
    else if(text  == '📨 Barchaga xabar'){
        sendRoole = false;
        bot.sendMessage(chatId, "🔖 Xabar turini tanlang",{
            reply_markup: send
        });
    }
    else if(text  == '📨 Forward xabar'){
        steep.push('forsend');
        await updateUsers(chatId, {steep: steep});
        bot.sendMessage(chatId, "🔗 Forward xabarni yuboring",{
            reply_markup: cancel
        });
    }
    else if(text == '💬 Matinli xabar'){
        steep.push('textMessage');
        await updateUsers(chatId, {steep: steep});
        bot.sendMessage(chatId, "📧 Yubormoqchi bo`lgan xabar matnini yozing",{
            reply_markup: cancel
        });
    }
    else if(text == '🖼 Rasmli xabar'){
        steep.push('photoMessage');
        await updateUsers(chatId, {steep: steep});
        bot.sendMessage(chatId, "📰 Yubormoqchi bo`lgan rasmingizni yuboring",{
            reply_markup: cancel
        });
    }
    else if(text == '📊 Statistika'){
        let users = await selctUsers()
        bot.sendMessage(chatId, "📊 Statistika bo'yicha\n\n👥 Useralar soni "+users.length+ ' ta')
    }
    else if(st == 'textMessage'){
        if(text == '✅ Tasdiqlash'){
            let ok = [];
            let is = undefined;
            await updateUsers(chatId, {steep: ['admin']});
            if(sendRoole == 'passager') is = true;
            else if(sendRoole == 'driver') is = false;
            let users = await selctUsers()
            await users.map(async user => {
                if(is === undefined){
                    try {
                        let rr = await bot.sendMessage(user.user_id, habar)
                        if(rr) ok.push(true) ;
                    } catch (error) {
                        ok.push('blocked');
                    }
                }
                else if(is == true ? user.is_passager : user.is_driver){
                    try {
                        let rr = await bot.sendMessage(user.user_id, habar)
                        if(rr) ok.push(true);
                    } catch (error) {
                        ok.push('blocked');
                    }
                }else ok.push(false)
            })
            let interval = setInterval(() => {
                if(ok.length == users.length){
                    let blockCount = 0;
                    let confcount = 0;
                    ok.map(el => {
                        if(el == true) confcount++;
                        else if(el == 'blocked') blockCount++; 
                    })
                    bot.sendMessage(chatId, '📬 Xabar '+confcount+' ta odamga yuborildi\n\n📭 '+blockCount+' ta odam botni blocklagan',{reply_markup: admin})
                    clearInterval(interval)
                }
            }, 500);
        } else {
            bot.sendMessage(chatId, '✅ Yubormoqchi bo‘lgan habaringgizni tasdiqlang shu zahoti foydalanuvchilarga yuboriladi',{
                reply_markup: {
                    resize_keyboard: true,
                    keyboard: [
                        [{text: '✅ Tasdiqlash'}]
                    ]
                }
            })
            habar = text
        }
    }
    else if(st == 'forsend'){
        if(text == '✅ Tasdiqlash'){
            let ok = [];
            let is = undefined;
            await updateUsers(chatId, {steep: ['admin']});
            if(sendRoole == 'passager') is = true;
            else if(sendRoole == 'driver') is = false;
            let users = await selctUsers()
            await users.map(async user => {
                if(is === undefined){
                    try {
                        let rr = await bot.forwardMessage(user.user_id, chatId, forId )
                        if(rr) ok.push(true) ;
                    } catch (error) {
                        ok.push('blocked');
                    }
                }
                else if(is == true ? user.is_passager : user.is_driver){
                    try {
                        let rr = await bot.forwardMessage(user.user_id, chatId, forId )
                        if(rr) ok.push(true);
                    } catch (error) {
                        ok.push('blocked');
                    }
                }else ok.push(false)
            })
            let interval = setInterval(() => {
                if(ok.length == users.length){
                    let blockCount = 0;
                    let confcount = 0;
                    ok.map(el => {
                        if(el == true) confcount++;
                        else if(el == 'blocked') blockCount++; 
                    })
                    bot.sendMessage(chatId, '📬 Xabar '+confcount+' ta odamga yuborildi\n\n📭 '+blockCount+' ta odam botni blocklagan',{reply_markup: admin})
                    clearInterval(interval)
                }
            }, 500);
        } else {
            bot.sendMessage(chatId, '✅ Yubormoqchi bo‘lgan habaringgizni tasdiqlang shu zahoti foydalanuvchilarga yuboriladi',{
                reply_markup: {
                    resize_keyboard: true,
                    keyboard: [
                        [{text: '✅ Tasdiqlash'}]
                    ]
                }
            })
            forId = msg?.message_id || 0
        }
    }
    else if(st == 'photoMessage'){
        if(text == '✅ Tasdiqlash'){
            let ok = [];
            let is = undefined;
            await updateUsers(chatId, {steep: ['admin']});
            if(sendRoole == 'passager') is = true;
            else if(sendRoole == 'driver') is = false;
            let users = await selctUsers();
            users.map(async user => {
                if(is === undefined){
                    try {
                        let rr = await bot.sendPhoto(user.user_id, photo, {caption: habar})
                        if(rr) ok.push(true) ;
                    } catch (error) {
                        ok.push('blocked');
                    }
                }
                else if(is == true ? user.is_passager : user.is_driver){
                    try {
                        let rr = await bot.sendPhoto(user.user_id, photo, {caption: habar});
                        if(rr)  ok.push(true);
                    } catch (error) {
                        ok.push('blocked');
                    }
                }else ok.push(false);
            });
            let interval = setInterval(() => {
                if(ok.length == users.length){
                    let blockCount = 0;
                    let confcount = 0;
                    ok.map(el => {
                        if(el == true) confcount++;
                        else if(el == 'blocked') blockCount++; 
                    })
                    bot.sendMessage(chatId, '📬 Xabar '+confcount+' ta odamga yuborildi\n\n📭 '+blockCount+' ta odam botni blocklagan',{reply_markup: admin})
                    clearInterval(interval)
                }
            }, 500);
        }
        else if (msg.photo) {
            photo = msg.photo[0].file_id;
            bot.sendMessage(chatId, '✅ Rasmning tagiga (caption) yoziladigan xabar matnini kiriting');
        }
        else {
            bot.sendMessage(chatId, '✅ Yubormoqchi bo‘lgan habaringgizni tasdiqlang shu zahoti foydalanuvchilarga yuboriladi',{
                reply_markup: {
                    resize_keyboard: true,
                    keyboard: [
                        [{text: '✅ Tasdiqlash'}]
                    ]
                }
            })
            habar = text;
        }
    }
    else if(st == 'addDist2') {
        let res = await insertAdmin({dist: {city_id: citId.city_id, dist_name: text}});
        await updateUsers(chatId, {steep: ['admin']})
        if(res.length) {
            bot.sendMessage(chatId,"Shaxar qo'shildi ✅", {reply_markup: admin});
        }else bot.sendMessage(chatId, "Shaxar qo'shilmadi qayta urunib ko`ring ♻️",{reply_markup: admin})
    }
    else if(st == 'addAdm'){
        let res = await insertAdmin({addAdmin: text})
        await updateUsers(chatId, {steep: ['admin']})
        if(res.length){
            bot.sendMessage(chatId,'Admin qo\'shildi', {reply_markup: admin});
            bot.sendMessage(text, "Assalomualekum siz botga admin bo'lib tayorlandingiz panelga o'tish uchun /admin buyrug'idan foydalaning");
        }else bot.sendMessage(chatId, 'Admin qo\'shilmadi qayta urunib koring',{reply_markup: admin})
    }
    else if(st == 'delAdmin'){
        let res = await insertAdmin({deladmin: text});
        if(res.length){
            bot.sendMessage(chatId,'Admin o\'chirildi', {reply_markup: admin});
        }else bot.sendMessage(chatId, 'Admin o\'chmadi qayta urunib koring',{reply_markup: admin})
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
        await updateUsers(chatId, {steep: ['admin']})
        bot.deleteMessage(chatId, msgId);
        bot.sendMessage(chatId, 'Muvoffaqyatli o\'chirildi ✅', {reply_markup: admin})
    }else if(dat == 'deleteDstr'){
        list2.map(async el => {
            await deleteCity({dist_id: +el})
        })
        await updateUsers(chatId, {steep: ['admin']})
        bot.deleteMessage(chatId, msgId);
        bot.sendMessage(chatId, 'Muvoffaqyatli o\'chirildi ✅', {reply_markup: admin})
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
        if(data) array.push([{text: '🔙 Ortga'}])
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