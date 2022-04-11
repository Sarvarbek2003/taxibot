const token = '1947116926:AAGyhdQWoNPanOqva6Qq78lanHtkUpNFQk8';
const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot(token,{polling: true});

const passager = require('./controllers/passager.js');
const driver = require('./controllers/driver.js');

const { roole, home, homedr } = require('./menu.js');
const { selctUsers, 
        updateUsers, 
        insertOrder, 
        updateOrder, 
        deleteOrder,
        orderSearch, 
        insertUser, 
        selectCity,
        orders, 
        order } = require('./models/query.js');

let kl = false;
let d = new Date()

bot.on('text', async msg => {
    const msgId = msg.message_id;
    const chatId = msg.chat.id;
    const text = msg.text;
    let steep = (await selctUsers()).find(user => user.user_id == chatId)?.steep.split(' ');
    if(text == '/start'){
        kl = true;
        // await deleteOrder(chatId);
        bot.sendMessage(chatId, 'Assalomualekum',{reply_markup: {remove_keyboard: true,}});
        let steep = (await selctUsers()).find(user => user.user_id == chatId)?.steep.split(' ');
        if(!steep) await insertUser(chatId,['home']);
        else await updateUsers(chatId, {steep: ['home']});
        bot.sendMessage(chatId, 'Taxi xizmati botiga xush kelibsiz\n\nSiz bu bot orqali viloyatlar aro taxi xizmatiga buyurtma berishingiz mumkin\n\nAgar siz taxis bo\'lsangiz yo\'lovchi topishingiz mumkin\n\n<b>Siz kimsiz?</b>',{
            parse_mode: 'html',
            reply_markup: roole
        });
    }else if(steep[steep.length-1] == 'tel'){
        if (!/^998(9[012345789]|3[3]|7[1]|8[8])[0-9]{7}$/.test(text)) {
            return bot.sendMessage(chatId,'☎️ Telefon raqamingizni 998901234567 shaklida to\'g\'ri yozing yoki pastagi tugamadan foydalanig\n\n‼️<b>Diqqat telefon raqam, siz bilan haydovchi bog`lanishi uchun kerak</b>',{
                parse_mode: 'html',
                reply_markup: {
                    resize_keyboard: true,
                    keyboard: [
                        [{text: '📞 Telefon raqam', request_contact: true}]
                    ]
                }
            });
        }else {
            steep.splice(1);
            await updateUsers(chatId, {steep: steep});
        }
        bot.deleteMessage(chatId, msgId,{ reply_markup: {remove_keyboard: true} });
        bot.deleteMessage(chatId, msgId-1,{ reply_markup: {remove_keyboard: true} });
        await updateOrder(msg.chat.id,{tel: text});
        await updateUsers(msg.chat.id, {phone: text})
        let order = await orders(chatId);
        bot.sendMessage(chatId, '✅Yaxshi arizangiz qabul qilindi aloqada qoling!\n\nKelishuv amalga oshganidan so\'ng buyurtmani bekor qilishni unutmang',{
            parse_mode: 'markdown',
            reply_markup: order[0].roole == 'driver'? homedr : home
        });
        await search(chatId);
    }

});

bot.on('contact', async msg => {
    let chatId = msg.chat.id;
    let steep = (await selctUsers()).find(user => user.user_id == chatId)?.steep.split(' ');
    let msgId = msg.message_id;
    steep.splice(1);
    await updateUsers(chatId, {steep: steep});
    bot.deleteMessage(chatId, msgId,{ reply_markup: {remove_keyboard: true} });
    bot.deleteMessage(chatId, msgId-1,{ reply_markup: {remove_keyboard: true} });
    await updateOrder(msg.chat.id,{tel: msg.contact.phone_number});
    await updateUsers(msg.chat.id, {phone: msg.contact.phone_number})
    let order = await orders(chatId);
    bot.sendMessage(chatId, '✅Yaxshi arizangiz qabul qilindi aloqada qoling!\n\nKelishuv amalga oshganidan so\'ng buyurtmani bekor qilishni unutmang',{
        parse_mode: 'markdown',
        reply_markup: order[0].roole == 'driver' ? homedr : home
    });
    await search(chatId);
});                     

bot.on('callback_query', async msg => {
    let chatId = msg.from.id;
    let data = msg.data;
    let msgId = msg.message.message_id;
    let dat = data.split('=')[0];
    data = data.split('=')[1];
    let steep = (await selctUsers()).find(user => user.user_id == chatId)?.steep.split(' ');
    let st = steep[steep.length - 1];
    if(steep[0] == 'home'){
        if(data == 'passager' || steep[1] == 'passager' || dat == 'updateorder'){
            passager(bot, msg);
            if(kl) bot.deleteMessage(chatId, msg.message.message_id-1); kl = false;
            let order = (await orders(chatId));
            if (dat == 'updateorder') steep.splice(1), await updateUsers(chatId, {steep: steep});
            await updateUsers(chatId, {roole: {is_ps: true}});
            if(!order.length) await insertOrder(chatId, 'passager');
            if(steep[1] != 'passager') {steep.push('passager'); await updateUsers(chatId, {steep: steep});}
        }else if(data == 'driver' || steep[1] == 'driver'){
            driver(bot, msg);
            if(kl) bot.deleteMessage(chatId, msg.message.message_id-1); kl = false;
            let order = (await orders(chatId));
            if (dat == 'updateorder') steep.splice(1), await updateUsers(chatId, {steep: steep});
            await updateUsers(chatId, {roole: {is_dr: true}});
            if(!order.length) await insertOrder(chatId, 'driver');
            if(steep[1] != 'driver') {steep.push('driver'); await updateUsers(chatId, {steep: steep});}
        }
    }
    if (dat == 'home'){
        steep.splice(1);
        await deleteOrder(chatId);
        await updateUsers(chatId, {steep: steep});
        bot.editMessageText('Assalomualekum taxi xizmati botiga xush kelibsiz\n\nSiz bu bot orqali viloyatlar aro taxi xizmatiga buyurtma berishingiz mumkin\n\nAgar siz taxis bo\'lsangiz yo\'lovchi topishingiz mumkin\n\n<b>Siz kimsiz?</b>',{
            chat_id: chatId,
            message_id: msgId,
            parse_mode: 'html',
            reply_markup: roole
        });
        return
    }
    if(dat == 'myorder'){
        let txt = await orderRun(chatId);
        setTimeout(() => {
            bot.editMessageText(txt,{
                chat_id: chatId,
                message_id: msgId,
                parse_mode: 'html',     
                reply_markup: home
            })
        }, 1000);
    }
    else if(dat == 'cancelOrder'){
        steep.splice(1);
        await updateUsers(chatId, {steep: steep});
        await deleteOrder(chatId);
        bot.editMessageText('Taxi xizmati botiga xush kelibsiz\n\nSiz bu bot orqali viloyatlar aro taxi xizmatiga buyurtma berishingiz mumkin\n\nAgar siz taxis bo\'lsangiz yo\'lovchi topishingiz mumkin\n\n<b>Siz kimsiz?</b>',{
            chat_id: chatId,
            message_id: msgId,
            parse_mode: 'html',
            reply_markup: roole
        })
    }
    else if(dat == 'search'){
        let res = await search(chatId);
        if(!res) bot.answerCallbackQuery(msg.id,{text: "❌ Topilmadi"})
    }
    else if(dat == 'accepted'){
        let userId = data.split('-')[0]
        bot.answerCallbackQuery(msg.id,{show_alert: true, text: "Bizning xizmatlardan foydalanganingiz uchun tashakkur😊"})
        bot.deleteMessage(chatId, msgId);
        bot.sendMessage(userId, "‼️ Haydovchi kelishuv amalga oshganini tasdiqladi!\n*Siz ham tasdiqlaysizmi?*",{
            parse_mode: 'markdown',
            reply_markup: {
                inline_keyboard: [
                    [{text: "✅ Tasdiqlayman", callback_data: 'confirm=passager'}],
                    [{text: "❌ Kelishuv amalga oshmadi", callback_data: 'cancel='+data}]

                ]
            }
        });
    }
    else if(dat == 'rejected' || dat == 'cancel'){
        let userId = data.split('-')[0];
        let userId2 = data.split('-')[1];

        let count = (await orders(userId2))[0].count;
        await updateOrder(userId2, {count: count+1});

        await updateOrder(userId, {status: 'pending'});
        bot.answerCallbackQuery(msg.id,{show_alert: true, text: "⛔️ Kelishuv amalga oshmaganidan afsusdamiz😔 Sizga boshqa yo\'ovchi qidiryabmiz\n\n🔎 *Yo\'lovchi izlash* tugmasini bosish orqali o\'zingiz topishingiz mumkin"})
        bot.deleteMessage(chatId, msgId);
    }
    else if (dat == 'accept'){
        let userId = data.split('-')[0];
        bot.answerCallbackQuery(msg.id,{show_alert: true, text: "Bizning xizmatlardan foydalanganingiz uchun tashakkur😊"})
        bot.deleteMessage(chatId, msgId);
        
        bot.sendMessage(userId, "‼️ Yo'lovchi kelishuv amalga oshganini tasdiqladi!\n*Siz ham tasdiqlaysizmi?*",{
            parse_mode: 'markdown',
            reply_markup: {
                inline_keyboard: [
                    [{text: "✅ Tasdiqlayman", callback_data: 'confirm=driver'}],
                    [{text: "❌ Kelishuv amalga oshmadi", callback_data: 'cancel_ps='+data}]
                ]
            }
        });
    } else if(dat == 'reject' || dat == 'cancel_ps'){
        let userId = data.split('-')[0];
        let userId2 = data.split('-')[1];

        let count = (await orders(userId))[0].count;
        await updateOrder(userId, {count: count+1})
        await updateOrder(userId2, {status: 'pending'})
        bot.answerCallbackQuery(msg.id,{show_alert: true, text: "⛔️ Kelishuv amalga oshmaganidan afsusdamiz😔 Sizga boshqa haydovchi qidiryabmiz\n\n🔎 *Haydovchi izlash* tugmasini bosish orqali o\'zingiz topishingiz mumkin"})
        bot.deleteMessage(chatId, msgId);
    }
    else if(dat == 'confirm' && data == 'driver'){
        bot.answerCallbackQuery(msg.id,{show_alert: true, text: "Bizning xizmatlardan foydalanganingiz uchun tashakkur😊"})
        bot.deleteMessage(chatId, msgId);
    }
    else if(dat == 'confirm' && data == 'passager'){
        bot.answerCallbackQuery(msg.id,{show_alert: true, text: "Bizning xizmatlardan foydalanganingiz uchun tashakkur😊"})
        bot.deleteMessage(chatId, msgId);
    }
});

let time = {
    1: '00:00 - 03:00',
    2: '03:00 - 06:00',
    3: '06:00 - 09:00',
    4: '09:00 - 12:00',
    5: '12:00 - 15:00',
    6: '15:00 - 18:00',
    7: '18:00 - 21:00',
    8: '21:00 - 00:00'
}

async function orderRun(chatId){
    let o = await order(chatId);
    let t = time[o.time];
    let m = d.getMonth().toString();
    let y = d.getFullYear();
    return `<b>🚩 Qayerdan:</b> ${o.from_city} --> ${o.from_district}\n\n<b>🏁 Qayerga:</b> ${o.to_city} --> ${o.to_district}\n\n<b>📆 Qachon:</b> ${o.date+'/'+m.padStart(2, '0')+'/'+y}\n\n<b>⏰ Soat:</b> ${t} oraliqda\n\n<b>📞 Telefon:</b> ${o.phone}\n\n<i>‼️Siz bilan haydovchi aloqaga chiqadi undan oldin o'zingiz haydovchini topishingiz mumkin uning uchun </i><b>🔎 Haydovchi izlash</b><i>ni bosing</i>`
} 

async function oRun(chatId){
    let o = await order(chatId);
    return {to_city: o.to_city, from_city: o.from_city, to_district: o.to_district, from_district: o.from_district, user_id: o.user_id, phone: o.phone}
} 

async function render(array){
    let city = await selectCity(true);
    let dist = await selectCity(false);
    let obj = {};
    let = arr = [];
    array.forEach(ell => {
        updateOrder(ell.user_id, {status: 'accepted'});
        city.forEach((el) => {
            if(ell.to_city == el.city_id){
                obj.user_id = ell.user_id;
                obj.phone = ell.phone;
                obj.to_city = el.city_name;
            } else if (ell.from_city == el.city_id){
                obj.from_city = el.city_name;
            } 
        });
        dist.forEach(el => {
            if (ell.to_district == el.district_id){
                obj.to_district = el.district_name;
            } else if(ell.from_district == el.district_id){
                obj.from_district = el.district_name;
            }
        })
        arr.push(obj);
        obj = {};
    });
    return arr;
} 

async function search(userId){
    let orders1 = await orderSearch();
    let order = await orders(userId);
    if(!orders1 || !order) return;
    let res = orders1.filter(el => {
        if( order[0]?.from_city == el?.from_city && 
            order[0]?.to_city == el?.to_city && 
            el?.from_district.includes(order[0]?.from_district) && 
            el?.to_district.includes(order[0]?.to_district) && 
            order[0]?.date == el?.date && 
            order[0]?.time == el?.time && 
            el?.roole == 'driver' && 
            order[0]?.roole != 'driver' && 
            el?.status == 'pending'
        ){
            return el;
        } else if(
            order[0]?.from_city == el?.from_city && 
            order[0]?.to_city == el?.to_city && 
            order[0]?.from_district.includes(el?.from_district) && 
            order[0]?.to_district.includes(el?.to_district) && 
            order[0]?.date == el?.date && 
            order[0]?.time == el?.time && 
            el?.roole == 'passager' && 
            order[0]?.roole != 'passager' &&   
            el?.status == 'pending'   
        ){
            return el;
        }
    });
    if(res[0]?.roole == 'driver') {
        let user = await oRun(order[0].user_id);
        let count = (await orders(res[0].user_id))[0].count;
        await updateOrder(res[0].user_id, {count: count-1});
        await updateOrder(order[0].user_id, {status: 'accepted'});
        bot.sendMessage(res[0].user_id, `🚕 Yo'lovchi topildi u bilan bog'laning\n\n🚩 *${user.from_city} ➡️ ${user.from_district}dan*\n🏁 *${user.to_city} ➡️ ${user.to_district}ga*\n📨 *Telegram orqali:* [Bog'lanish](tg://user?id=${user.user_id})\n📞 *Telelefon raqami:* \`${user.phone}\``,{
            parse_mode: 'markdown',
            reply_markup: {
                inline_keyboard: [
                    [{text: '🤝Kelishuv amalga oshdi✅', callback_data: 'accepted='+user.user_id+'-'+res[0].user_id}],
                    [{text: '🤝Kelishuv amalga oshmadi❌', callback_data: 'rejected='+user.user_id+'-'+res[0].user_id}]
                ]
            }
        })
        bot.sendMessage(order[0].user_id, `🚕 Haydovchi topildi 👇\n\n📨* Telegram orqali:* [Bog'lanish](tg://user?id=${res[0].user_id})\n📞 *Telelefon raqami:* \`${res[0].phone}\``,{
            parse_mode: 'markdown',
            reply_markup: {
                inline_keyboard: [
                    [{text: '🤝Kelishuv amalga oshdi✅', callback_data: 'accept='+res[0].user_id+'-'+user.user_id}],
                    [{text: '🤝Kelishuv amalga oshmadi❌', callback_data: 'reject='+res[0].user_id+'-'+user.user_id}]
                ]
            }
        })
        return true
    } else {
        let ret = await renderPassager(res,order[0]);
        return ret;
    }
}

async function renderPassager (array,obj){
    if (!array.length) return false;
    let count = (await orders(obj.user_id))[0].count;
    array.splice(count);
    let ress = await render(array); 
    ress.forEach(async (ress, index) => {
        count--
        bot.sendMessage(ress.user_id, `🚕 Haydovchi topildi u bilan bog'laning\n\n📨* Telegram orqali:* [Bog'lanish](tg://user?id=${obj.user_id})\n📞 *Telelefon raqami:* \`${obj.phone}\``,{
            parse_mode: 'markdown',
            reply_markup: {
                inline_keyboard: [
                    [{text: '🤝Kelishuv amalga oshdi✅', callback_data: 'accept='+obj.user_id+'-'+ress.user_id}],
                    [{text: '🤝Kelishuv amalga oshmadi❌', callback_data: 'reject='+obj.user_id+'-'+ress.user_id}]
                ]
            }
        });

        bot.sendMessage(obj.user_id, 1+index+`-yo'lovchi topildi 👇\n🚩 *${ress.from_city} ➡️ ${ress.from_district}dan*\n🏁 *${ress.to_city} ➡️ ${ress.to_district}ga*\n📨 *Telegram orqali:* [Bog'lanish](tg://user?id=${ress.user_id})\n📞 *Telelefon raqami:* \`${ress.phone}\``,{
            parse_mode: 'markdown',
            reply_markup: {
                inline_keyboard: [
                    [{text: '🤝Kelishuv amalga oshdi✅', callback_data: 'accepted='+ress.user_id+'-'+obj.user_id}],
                    [{text: '🤝Kelishuv amalga oshmadi❌', callback_data: 'rejected='+ress.user_id+'-'+obj.user_id}]
                ]
            }
        });
        updateOrder(obj.user_id, {count: count});
    });
    return true
}



