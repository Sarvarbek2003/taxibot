const admin = {
    resize_keyboard: true,
    keyboard: [
        [{text: '➕ Viloyat qo\'shish'},{text: '➕ Shaxar qo\'shish'}],
        [{text: '➖ Viloyat o\'chirish'},{text: '➖ Shaxar o\'chirish'}],
        [{text: '🔝 Admin qo\'shish'},{text: '➖ Admin o\'chirish'}],
        [{text: '🚖 Haydovchilarga xabar'},{text: '🏃 Yo\'lovchilarga xabar'}],
        [{text: '📨 Forward xabar'},{text: '📨 Barchaga xabar'}],
        [{text: '📊 Statistika'}]
    ]
} 
const send = { 
    resize_keyboard: true,
    keyboard: [
        [{text: "💬 Matinli xabar"},{text:"🖼 Rasmli xabar"}]
    ]
}

const date = {
    inline_keyboard: [
        [{text: '1', callback_data: 'time=01'},{text: '2', callback_data: 'time=02'},{text: '3', callback_data: 'time=03'},{text: '4', callback_data: 'time=04'},{text: '5', callback_data: 'time=05'},{text: '6', callback_data: 'time=06'},{text: '7', callback_data: 'time=07'}],
        [{text: '8', callback_data: 'time=08'},{text: '9', callback_data: 'time=09'},{text: '10', callback_data: 'time=10'},{text: '11', callback_data: 'time=11'},{text: '12', callback_data: 'time=12'},{text: '13', callback_data: 'time=13'},{text: '14', callback_data: 'time=14'}],
        [{text: '15', callback_data: 'time=15'},{text: '16', callback_data: 'time=16'},{text: '17', callback_data: 'time=17'},{text: '18', callback_data: 'time=18'},{text: '19', callback_data: 'time=19'},{text: '20', callback_data: 'time=20'},{text: '21', callback_data: 'time=21'}],
        [{text: '22', callback_data: 'time=22'},{text: '23', callback_data: 'time=23'},{text: '24', callback_data: 'time=24'},{text: '25', callback_data: 'time=25'},{text: '26', callback_data: 'time=26'},{text: '27', callback_data: 'time=27'},{text: '28', callback_data: 'time=28'}],
        [{text: '29', callback_data: 'time=29'},{text: '30', callback_data: 'time=30'},{text: '31', callback_data: 'time=31'}],
        [{text: '🔙 Ortga', callback_data: 'd=districtcancel'}]
    ]   
}

const time = {
    inline_keyboard: [
        [{text: '00:00 - 03:00', callback_data: 'to_city=1'},{text: '03:00 - 06:00', callback_data: 'to_city=2'},{text: '06:00 - 09:00', callback_data: 'to_city=3'}],
        [{text: '09:00 - 12:00', callback_data: 'to_city=4'},{text: '12:00 - 15:00', callback_data: 'to_city=5'},{text: '15:00 - 18:00', callback_data: 'to_city=6'}],
        [{text: '18:00 - 21:00', callback_data: 'to_city=7'},{text: '21:00 - 00:00', callback_data: 'to_city=8'}],
        [{text: '🔙 Ortga', callback_data: 'd=datecancel'}]
    ]
}

const cancel = {
    resize_keyboard: true,
    keyboard: [
        [{text: '🔙 Ortga'}]
    ]
}

const order = {
    resize_keyboard: true,
    keyboard: [
        [{text: '🔙 Ortga'}]
    ]
}

const from_city = {
    inline_keyboard: [
        [{text: '⬆️ Toshkentdan', callback_data: 'district=1'}],
        [{text: '⬆️ Andijondan', callback_data: 'district=2'}]
    ]
}

const to_city = {
    inline_keyboard: [
        [{text: '⬇️ Toshkentga', callback_data: 'date=1'}],
        [{text: '⬇️ Andijonga', callback_data: 'date=2'}]
    ]
}

const home = {
    inline_keyboard: [
        [{text: '📁 Mening buyurtmam', callback_data: 'myorder=order'},{text: '🔎 Haydovchi izlash', callback_data: 'search=driver'}],
        [{text: '🖌 Buyurmani o`zgartirish', callback_data: 'updateorder=update'}, {text: '✂️ Buyurtmani bekor qilish', callback_data:'cancelOrder=cancel'}]
    ]
}

const homedr = {
    inline_keyboard: [
        [{text: '🔎 Yo\'lovchi izlash', callback_data: 'search=pass'}],
        [{text: '🖌 Buyurmani o`zgartirish', callback_data: 'updateorder=driver'}, {text: '✂️ Buyurtmani bekor qilish', callback_data:'cancelOrder=cancel'}]
    ]
}

const roole = {
    remove_keyboard: true,
    inline_keyboard: [
        [{text: '🚕 Xaydovchiman', callback_data: 'roole=driver'},{text: '🚶‍♂️Yo\'lovchiman', callback_data: 'roole=passager'}],
    ]
}


module.exports = {
    from_city,
    to_city,
    cancel,
    homedr,
    order,
    admin,
    roole,
    date,
    send,
    home,
    time
}