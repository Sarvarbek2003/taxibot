const token = '1947116926:AAGyhdQWoNPanOqva6Qq78lanHtkUpNFQk8';
const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot(token,{polling: true});

const passager = require('./controllers/passager.js');
const driver = require('./controllers/driver.js');

const { roole, home, from_city } = require('./menu.js');
const { selctUsers, 
        insertUser, 
        updateUsers, 
        insertOrder, 
        updateOrder, 
        deleteOrder,
        orderSearch, 
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
        await deleteOrder(chatId)
        bot.sendMessage(chatId, 'Assalomualekum',{reply_markup: {remove_keyboard: true,}});
        let steep = (await selctUsers()).find(user => user.user_id == chatId)?.steep.split(' ');
        if(!steep) await insertUser(chatId,['home']);
        else await updateUsers(chatId, {steep: ['home']});
        bot.sendMessage(chatId, 'Taxi xizmati botiga xush kelibsiz\n\nSiz bu bot orqali viloyatlar aro taxi xizmatiga buyurtma berishingiz mumkin\n\nAgar siz taxis bo\'lsangiz yo\'lovchi topishingiz mumkin\n\n<b>Siz kimsiz?</b>',{
            parse_mode: 'html',
            reply_markup: roole
        });
    }else if(steep[steep.length-1] == 'tel'){
        bot.deleteMessage(chatId, msgId,{ reply_markup: {remove_keyboard: true} });
        bot.deleteMessage(chatId, msgId-1,{ reply_markup: {remove_keyboard: true} });
        await updateOrder(msg.chat.id,{tel: msg.text});
        bot.sendMessage(msg.chat.id, '✅Yaxshi arizangiz qabul qilindi aloqada qoling sizga haydovchi izlayabmiz!\n\n<b>Siz bilan haydovchi bog`lanadi</b>',{
            parse_mode: 'html',
            reply_markup: home
        });
    }

});

bot.on('contact', async msg => {
    let chatId = msg.chat.id;
    let msgId = msg.message_id;
    let txt = ''
    bot.deleteMessage(chatId, msgId,{ reply_markup: {remove_keyboard: true} });
    bot.deleteMessage(chatId, msgId-1,{ reply_markup: {remove_keyboard: true} });
    await updateOrder(msg.chat.id,{tel: msg.contact.phone_number});
    let obj = await search(chatId);
    if(obj) txt = obj.txt 
    bot.sendMessage(chatId, '✅Yaxshi arizangiz qabul qilindi aloqada qoling sizga haydovchi izlayabmiz!\n\n'+txt,{
        parse_mode: 'markdown',
        reply_markup: home
    });
})

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
            if (dat == 'updateorder') steep.splice(1), await updateUsers(chatId, {steep: steep})
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
    }
    if(dat == 'myorder'){
        let txt = await orderRun(chatId)
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
        let obj = await searchDriver(chatId);
        let txt = obj?.txt
        if(txt === undefined) txt = '❌ Topilmadi'
        bot.editMessageText('✅Yaxshi arizangiz qabul qilindi aloqada qoling sizga haydovchi izlayabmiz!\n\n'+txt,{
            chat_id:chatId,
            message_id: msgId,
            parse_mode: 'markdown',
            reply_markup: home
        });
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

async function render(chatId){
    let o = await order(chatId);
    let obj = {from_city: o.from_city, from_district: o.from_district, to_city: o.to_city, to_district: o.to_district }
    return obj
} 

async function searchDriver(userId){
    let orders1 = await orderSearch();
    let order = await orders(userId);
    if(!orders1 || !order) return
    let res = orders1.find(el => {
        if( order[0].from_city == el.from_city && 
            order[0].to_city == el.to_city && 
            el?.from_district.includes(order[0].from_district) && 
            el?.to_district.includes(order[0].to_district) && 
            order[0].date == el.date && 
            order[0].time == el.time && order[0].user_id != el.user_id
        ){
            return el
        }
    });
    if(res) return {id: res.user_id, txt: `🚕 Haydovchi topildi 👇\n\n📨 Telegram orqali: [Bog'lanish](tg://user?id=887528138)\n📞 Telelefon raqami: ${res.phone}`}
}

async function search(userId){
    let orders1 = await orderSearch();
    let order = await orders(userId);
    if(!orders1 || !order) return
    let res = orders1.filter(el => {
        if( order[0]?.from_city == el?.from_city && 
            order[0]?.to_city == el?.to_city && 
            el?.from_district.includes(order[0]?.from_district) && 
            el?.to_district.includes(order[0]?.to_district) && 
            order[0]?.date == el?.date && 
            order[0]?.time == el?.time && 
            el?.roole == 'driver' && order[0]?.roole != 'driver'
        ){
            return el
        } else if(
            order[0]?.from_city == el?.from_city && 
            order[0]?.to_city == el?.to_city && 
            order[0]?.from_district.includes(el?.from_district) && 
            order[0]?.to_district.includes(el?.to_district) && 
            order[0]?.date == el?.date && 
            order[0]?.time == el?.time && 
            el?.roole == 'passager'
        ){
            return el
        }
    });
    if(res?.roole == 'driver') return {id: res[0].user_id, txt: `🚕 Haydovchi topildi 👇\n\n📨* Telegram orqali:* [Bog'lanish](tg://user?id=${res[0].user_id})\n📞 *Telelefon raqami:* \`${res[0].phone}\``}
    if(res?.roole == 'passager'){
        let ress = await render(res.user_id)
        ress.map(el => txt+= `🚕 Yo'lovchi topildi 👇\n\n🚩 *${ress.from_city} ➡️ ${ress.from_district}dan*\n🏁 *${ress.to_city} ➡️ ${ress.to_district}ga*\n📨 *Telegram orqali:* [Bog'lanish](tg://user?id=${res.user_id})\n📞 *Telelefon raqami:* \`${res.phone}\``)
        // return {id: res.user_id, txt: `🚕 Yo'lovchi topildi 👇\n\n🚩 *${ress.from_city} ➡️ ${ress.from_district}dan*\n🏁 *${ress.to_city} ➡️ ${ress.to_district}ga*\n📨 *Telegram orqali:* [Bog'lanish](tg://user?id=${res.user_id})\n📞 *Telelefon raqami:* \`${res.phone}\``}
    }
}

async function renderPassager (){
    
}


