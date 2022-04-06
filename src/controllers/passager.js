const { selctUsers, selectCity, updateUsers, updateOrder } = require('../models/query.js')
const { date, time, cancel } = require('../menu')
const d = new Date()

module.exports = async(bot, msg) => {
    let chatId = msg.from.id;
    let data = msg?.data;
    let msgId = msg.message.message_id;
    let dat = data.split('=')[0];
    data = data.split('=')[1];
    
    let steep = (await selctUsers()).find(user => user.user_id == chatId)?.steep.split(' ');
    let st = steep[steep.length - 1];

    if(dat == 'roole' || dat == 'updateorder'){
        bot.editMessageText('🚩 Qaysi viloyatdan ketasiz?',{
            chat_id: chatId,
            message_id: msgId,
            reply_markup: await button(true)
        }); 
    }else if(dat == 'district'){
        await updateOrder(chatId, {from_city: data})
        steep.push(data);
        await updateUsers(chatId, {steep: steep});
        bot.editMessageText('🚩 Qaysi tumandan ketasiz?',{
            chat_id: chatId,
            message_id: msgId,
            reply_markup: await button(false,data)
        });
    }else if(data == 'districtcancel'){
        bot.editMessageText('🚩 Qaysi tumandan ketasiz?',{
            chat_id: chatId,
            message_id: msgId,
            reply_markup: await button(false,st)
        });
    }else if( dat == 'date') {
        await updateOrder(chatId, {from_dist: data})
        bot.editMessageText('📆 Ketadigan kuninggizni belgilang',{
            chat_id: chatId,
            message_id: msgId,
            reply_markup: date
        });
    }else if( data == 'datecancel') {
        await updateOrder(chatId, {from_dist: data})
        bot.editMessageText('📆 Ketadigan kuninggizni belgilang',{
            chat_id: chatId,
            message_id: msgId,
            reply_markup: date
        });
    }else if(dat == 'time' || msg.data == 'tim=cancel'){
        if(msg.data != 'tim=cancel') await updateOrder(chatId, {date: data})
        bot.editMessageText('⏰ Ketadigan vaqtingiz oralig\'ini belgilang',{
            chat_id: chatId,
            message_id: msgId,
            reply_markup: time
        });
    }else if(dat == 'to_city' || msg.data == 'to_cit=cancel'){
        if(msg.data != 'to_cit=cancel')await updateOrder(chatId, {time: data})
        bot.editMessageText('🏁 Boradigan manzilizni belgilang!',{
            chat_id: chatId,
            message_id: msgId,
            reply_markup: await button2(true)
        });
    }else if(dat == 'to_district'){
        await updateOrder(chatId, {to_city: data})
        bot.editMessageText('🏁 Boradigan tumaningizni belgilang!',{
            chat_id: chatId,
            message_id: msgId,
            reply_markup: await button2(false, data)
        });
    }else if(dat == 'tel'){
        await updateOrder(chatId, {to_district: data});
        steep.push('tel');
        await updateUsers(chatId, {steep: steep});
        bot.deleteMessage(chatId, msgId)
        bot.sendMessage(chatId,'☎️ Telefon raqamingizni yozing yoki pastagi tugamadan foydalanig\n\n‼️<b>Diqqat telefon raqam, siz bilan haydovchi bog`lanishi uchun kerak</b>',{
            parse_mode: 'html',
            reply_markup: {
                resize_keyboard: true,
                keyboard: [
                    [{text: '📞 Telefon raqam', request_contact: true}]
                ]
            }
        });
    }
}

async function button (kluch,data) {
    let city = await selectCity(kluch);
    let array = [];
    if(kluch) {
        city.map( cit => {
            array.push([{text:'🚩'+ cit.city_name, callback_data: 'district='+cit.city_id}]);
        });
        array.push([{text: '🔙 Ortga', callback_data: 'home=cancel'}]);
    } else {
        city.map( cit => {
            if(data == cit.city_id ) array.push([{text:'🚩'+ cit.district_name, callback_data: 'date='+cit.district_id}]);
        });
        array.push([{text: '🔙 Ortga', callback_data: 'roole=cancel'}]);
    }
    return { inline_keyboard: array }
}

async function button2 (kluch,data) {
    let city = await selectCity(kluch);
    let array = [];
    if(kluch) {
        city.map( cit => {
            array.push([{text:'🏁'+ cit.city_name, callback_data: 'to_district='+cit.city_id}]);
        });
        array.push([{text: '🔙 Ortga', callback_data: 'tim=cancel'}]);
    } else {
        city.map( cit => {
            if(data == cit.city_id ) array.push([{text:'🏁'+ cit.district_name, callback_data: 'tel='+cit.district_id}]);
        });
        array.push([{text: '🔙 Ortga', callback_data: 'to_cit=cancel'}]);
    }
    return { inline_keyboard: array }
}
