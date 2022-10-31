const axios = require("axios")
const fs = require("fs");
global.infoCult = {}

async function cultureInfo(typeCulPlace, filters, cursReq, lengJSON) {
    const main = `https://opendata.mkrf.ru/v2/`;
    filters = "$?f=" + JSON.stringify(filters);
    cursReq = "&s=" + String(cursReq);
    lengJSON = "&l=" + String(lengJSON);
    console.log(main + typeCulPlace + "/"+ filters + cursReq + lengJSON)
    const encoded = encodeURI(main + typeCulPlace + "/"+ filters + cursReq + lengJSON);
    console.log(encoded);

    await axios({
        url: `${encoded}`, 
        method: 'get',
        headers: {'X-API-KEY': '36d3377e24482d3145942ba7fae27a9ec521bb783ab8b3621162f4b1e8c19412'},
        responseType: 'json'
    }) 
        .then(function (response) {
            console.log(response.data)
            global.infoCult = response.data // .pipe(fs.createWriteStream('culturePlace.json'))
    })
    
    
}

async function cultureHandler() {
    setTimeout(() => {
        const infoTest = require("./culturePlace.json")
    let categories = [];
    for (let i = 0; i < infoTest.data.length; i++) {
        if (infoTest.data[i].data.general.extraFields.types) {
            for (let j = 0; j < infoTest.data[i].data.general.extraFields.types.length; j++) {    
                categories.push(infoTest.data[i].data.general.extraFields.types[j]);
                // Для вывода информации
                // console.log(i + ". " + infoTest.data[i].data.general.category.name + " - " + infoTest.data[i].data.general.name + " - " + infoTest.data[i].data.general.extraFields.types[j]);  
            }
        }
        console.log(infoTest.data[i].data.general.name)
    }

    // let withoutRep = [];
    // for(let i in categories){
    //     if(withoutRep.indexOf(categories[i])==-1)withoutRep.push(categories[i]);
    // }

    // console.log(withoutRep);  

    }, 500);  
}

exports.cultureInfo = cultureInfo;
exports.cultureHandler = cultureHandler;

/**
 * TODO <<< Если забыл структуру запроса: >>>
 * 
 * ? https://opendata.mkrf.ru/v2/museums/$?f={"data.general.locale.name":{"$search":"Москва"},"data.general.address.street":{"$search":"Арбат"}}&l=10
 * 
 * ! https://opendata.mkrf.ru/v2/ - начало URL
 * 
 * * museums/ - тип культурного места
 * 
 * * $?f={"data.general.locale.name":{"$search":"Москва"},"data.general.address.street":{"$search":"Арбат"}} - фильтры через запятую
 * 
 * * &s=10 - Курсор, откуда начать
 * 
 * * &l=10 - Длина JSON
 * 
*/