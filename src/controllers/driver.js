const { selctUsers, selectCity, updateUsers, updateOrder, order, orders } = require('../models/query.js');
const { date, time, cancel } = require('../menu');

module.exports = async(bot, msg) => {
    let chatId = msg.from.id;
    let data = msg?.data;
    let msgId = msg.message.message_id;
    let dat = data.split('=')[0];
    data = data.split('=')[1];
    
    let steep = (await selctUsers()).find(user => user.user_id == chatId)?.steep.split(' ');
    let st = steep[steep.length - 1];

    if(dat == 'roole' || dat == 'updateorder'){
        await updateOrder(chatId, {from_dist: 'null'})
        bot.editMessageText('🚩 Qaysi viloyatdan odam olasiz?',{
            chat_id: chatId,
            message_id: msgId,
            reply_markup: (await button(true)).cit
        }); 
    }
    else if(dat == 'district'){
        steep.push(data);
        await updateUsers(chatId, {steep: steep});
        await updateOrder(chatId, {from_city: data});
        bot.editMessageText('🚩 Qaysi tumanlardan odam olasiz?\nBir nechta belgilashingiz mumkin! 👇',{
            chat_id: chatId,
            message_id: msgId,
            reply_markup: (await button(false,data)).cit
        });
    }
    else if(data == 'districtcancel'){
        await updateOrder(chatId, {from_dist: 'null'})
        bot.editMessageText('🚩 Qaysi tumanlardan odam olasiz?\nBir nechta belgilashingiz mumkin! 👇',{
            chat_id: chatId,
            message_id: msgId,
            reply_markup: (await button(false,st)).cit
        });
    }
    else if( dat == 'date_dr') {
        let city = (await orders(chatId));
        let dist = (city[0]?.from_district != 'null' && city[0]?.from_district !== null && city.length ) ? city[0].from_district.split('-') : [];
        dist.push(data);
        await updateOrder(chatId, {from_dist: dist.join('-')});
        const obj = await button('id', data, st, dist);
        bot.editMessageText('🚩 Qaysi tumanlardan odam olasiz?\nBir nechta belgilashingiz mumkin! 👇\n'+obj.cit_name,{
            chat_id: chatId,
            message_id: msgId,
            reply_markup: obj.cit
        });
    }else if(dat == 'ok'){
        bot.editMessageText('📆 Ketadigan kuningini belgilang',{
            chat_id: chatId,
            message_id: msgId,
            reply_markup: date
        });
    }else if(data == 'datecancel'){
        bot.editMessageText('📆 Ketadigan kuningini belgilang',{
            chat_id: chatId,
            message_id: msgId,
            reply_markup: date
        });
    }else if(dat == 'time' || msg.data == 'tim=cancel'){
        if(msg.data != 'tim=cancel') await updateOrder(chatId, {date: data})
        await updateOrder(chatId, {to_district: 'null'})
        bot.editMessageText('⏰ Ketadigan vaqtingiz oralig\'ini belgilang',{
            chat_id: chatId,
            message_id: msgId,
            reply_markup: time
        });
    }else if(dat == 'to_city' || msg.data == 'to_cit=cancel'){
        if(msg.data != 'to_cit=cancel')await updateOrder(chatId, {time: data})
        bot.editMessageText('🏁 Qaysi viloyatga borasiz!',{
            chat_id: chatId,
            message_id: msgId,
            reply_markup: (await button2(true)).cit
        });
    }else if(dat == 'to_district_dr'){
        steep.push(data);
        await updateUsers(chatId, {steep: steep});
        await updateOrder(chatId, {to_city: data})
        const obj = await button2(false, data);
        bot.editMessageText('🏁 Boradigan tumaningizni belgilang!\nBir nechta belgilashingiz mumkin!👇',{
            chat_id: chatId,
            message_id: msgId,
            reply_markup: obj.cit
        });
    }else if(dat == 'to_dr'){
        let city = (await orders(chatId));
        let dist = (city[0]?.to_district != 'null' && city[0]?.to_district !== null && city.length ) ? city[0].to_district.split('-') : [];
        dist.push(data);
        await updateOrder(chatId, {to_district: dist.join('-')});
        const obj = await button2('id', data, st, dist);
        bot.editMessageText('🏁 Boradigan tumaningizni belgilang!\nBir nechta belgilashingiz mumkin!👇\n'+obj.cit_name,{
            chat_id: chatId,
            message_id: msgId,
            reply_markup: obj.cit
        });
    }else if(dat == 'okok'){
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

async function button (kluch,data,st,arr) {
    let city = await selectCity(kluch == 'id' || kluch == false ? false : true);
    let array = [];
    let cit_name = '';
    if (kluch == 'id') {
        city.map( cit => {
            if(cit.city_id == st ){
                if(data == cit.district_id || arr.includes(`${cit.district_id}`)) {
                    array.push([{text:'🚩'+ cit.district_name +' ✅', callback_data: 'date_dr='+cit.district_id}]);
                    cit_name += '\n🚩'+cit.district_name;
                } else  array.push([{text:'🚩'+ cit.district_name, callback_data: 'date_dr='+cit.district_id}]);
            }
        });
        array.push([{text: '✅ Tasdiqlash', callback_data: 'ok=ok'}]);
        array.push([{text: '🔙 Ortga', callback_data: 'roole=cancel'}]);
    } else if(kluch) {
        city.map( cit => {
            array.push([{text:'🚩'+ cit.city_name, callback_data: 'district='+cit.city_id}]);
        });
        array.push([{text: '🔙 Ortga', callback_data: 'home=cancel'}]);
    } else if(kluch == false) {
        city.map( cit => {
            if(data == cit.city_id ) array.push([{text:'🚩'+ cit.district_name, callback_data: 'date_dr='+cit.district_id}]);
        });
        array.push([{text: '✅ Tasdiqlash', callback_data: 'ok=ok'}]);
        array.push([{text: '🔙 Ortga', callback_data: 'roole=cancel'}]);
    }
    return {cit_name:cit_name, cit:{ inline_keyboard: array }}
}

async function button2 (kluch,data,st,arr) {
    let city = await selectCity(kluch == 'id' || kluch == false ? false : true);
    let array = [];
    let cit_name = '';
    if (kluch == 'id') {
        city.map( cit => {
            if(cit.city_id == st ){
                if(data == cit.district_id || arr.includes(`${cit.district_id}`)) {
                    array.push([{text:'🏁'+ cit.district_name +' ✅', callback_data: 'to_dr='+cit.district_id}]);
                    cit_name += '\n🏁'+cit.district_name;
                } else  array.push([{text:'🏁'+ cit.district_name, callback_data: 'to_dr='+cit.district_id}]);
            }
        });
        array.push([{text: '✅ Tasdiqlash', callback_data: 'okok=ok'}]);
        array.push([{text: '🔙 Ortga', callback_data: 'tim=cancel'}]);
    }else if(kluch) {
        city.map( cit => {
            array.push([{text:'🏁'+ cit.city_name, callback_data: 'to_district_dr='+cit.city_id}]);
        });
        array.push([{text: '🔙 Ortga', callback_data: 'tim=cancel'}]);
    } else if (kluch === false) {
        city.map( cit => {
            if(data == cit.city_id ) array.push([{text:'🏁'+ cit.district_name, callback_data: 'to_dr='+cit.district_id}]);
        });
        array.push([{text: '🔙 Ortga', callback_data: 'to_cit=cancel'}]);
    }
    return {cit_name:cit_name, cit:{ inline_keyboard: array }}
}


