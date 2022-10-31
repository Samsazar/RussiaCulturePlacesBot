const { Scenes, Markup } = require("telegraf");
const { zeroNumber, getQuery, updateNumber, addLike, deleteLike, getLike, addUser, updateUserToP, updateUserCity, updateUserKeyword } = require("./DBconnect")
const {cultureHandler, cultureInfo} = require("./apireqs");
const { set } = require("lodash");


class SceneGenerator {
    GentypeOfCulPlaceScene () {
        const typeOfCulPlace = new Scenes.BaseScene('typeOfCulPlace')
        typeOfCulPlace.enter(async (ctx) => {
            // клава
            
            const keyboard = Markup.keyboard([[
                Markup.button.text("Музей"),
                Markup.button.text("Театр")], [
                Markup.button.text("Библиотека"),
                Markup.button.text("Парки")
            ]]).resize();

            
            await ctx.reply('Выбери тип места', keyboard);
        })

        typeOfCulPlace.on('text', async (ctx) => {
            const currtypeOfCulPlace = ctx.message.text;
            const culPlaces = ["Музей", "Театр", "Библиотека", "Парки"] 
            if (culPlaces.indexOf(currtypeOfCulPlace) != -1) {
                // добавление в бд юзера
                console.log(ctx.message.from.id)
                addUser(ctx.from.id, ctx.message.text);
                await ctx.reply('Отлично, идем дальше', Markup.removeKeyboard());
                ctx.scene.enter('selectCity');
            }
            else {
                await ctx.reply("Повторите, я не совсем понял");
                ctx.scene.enter('typeOfCulPlace');
            }
        })

        typeOfCulPlace.on('message', (ctx) => {
            ctx.reply('Я все еще жду вашего ответа, выберите, пожалуйста, тип культурного места')
        })

        return typeOfCulPlace
    }
    
    GenselectCityScene () {
        const selectCity = new Scenes.BaseScene('selectCity')
        selectCity.enter(async (ctx) => {
             // клава
             const keyboard = Markup.keyboard([[
                Markup.button.text("Москва"),
                Markup.button.text("Санкт-Петербург")], [
                Markup.button.text("Калининград"),
                Markup.button.text("Новосибирск")], [
                Markup.button.text("Волгоград"),
                Markup.button.text("Владивосток"),
                ]]).resize();

            await ctx.reply('Теперь введите или выберите из предложенных город, в котором хотите посетить это место', keyboard)
        })
        selectCity.on('text', async (ctx) => {
            const currselectCity = ctx.message.text 
            if (currselectCity) {
                updateUserCity(ctx.from.id, ctx.message.text);
                await ctx.reply(`Выбран Город: ${currselectCity}`, Markup.removeKeyboard())
                ctx.scene.enter('keyword')
            }
            else {
                await ctx.reply("Повторите, я не совсем вас понял")
                ctx.scene.enter('selectCity')
            }
        })

        selectCity.on('message', (ctx) => {
            ctx.reply('Я все еще жду вашего ответа, выберите, пожалуйста, город')
        })
        return selectCity
    }
    
    
    GenkeywordScene () {
        const keyword = new Scenes.BaseScene('keyword')
        keyword.enter(async (ctx) => {
            await ctx.reply('Чтобы найти то самое место, которое будет тебе по душе, введи ключевое слово')
        })

        keyword.on('text', async (ctx) => {
            const currkeyword = ctx.message.text 
            if (currkeyword) {
                updateUserKeyword(ctx.from.id, ctx.message.text);
                await ctx.reply(`Ваше ключевое слово: ${currkeyword}`)
                await ctx.reply('А вот и результаты, можете выбирать')
                ctx.scene.enter('resultSel')
            }
            else {
                await ctx.reply("Повторите, пожалуйста")
                ctx.scene.enter('keyword')
            }
        })

        keyword.on('message', (ctx) => {
            ctx.reply('Повторите и напишите ключевое слово')
        })
        return keyword
    }

    GenresultSelScene () {
        const resultSel = new Scenes.BaseScene('resultSel')
        resultSel.enter(async (ctx) => {
            // клава
            const keyboard = Markup.keyboard([[
                Markup.button.text("❤️"),
                Markup.button.text("🧐"),
                Markup.button.text("👎"),
                Markup.button.text("❌")
            ]]).resize();
            
            // TODO Здесь должен быть результат 
            getQuery(ctx.from.id)
            console.log(global.infoQuery[0])
            setTimeout(() => {
                let fil = {"data.general.name":{"$search":global.infoQuery[0].keyword},"data.general.locale.name":{"$search":global.infoQuery[0].city}}
                console.log(fil)
                if (global.infoQuery[0].typeOfPlace == "Музей") {
                    global.infoQuery[0].typeOfPlace = "museums";
                }
                else if (global.infoQuery[0].typeOfPlace == "Парки") {
                    global.infoQuery[0].typeOfPlace = "parks";
                }
                else if (global.infoQuery[0].typeOfPlace == "Театр") {
                    global.infoQuery[0].typeOfPlace = "theaters";
                }
                else global.infoQuery[0].typeOfPlace = "libraries";

                cultureInfo(global.infoQuery[0].typeOfPlace, fil, global.infoQuery[0].number, 1);
            }, 500)
            await ctx.reply(`Как вам?`,keyboard)
            //     updateNumber(ctx.from.id);
            setTimeout(() => {
                if (global.infoCult.data.length != 0) {
                    ctx.reply(global.infoCult.data[0].data.general.name );
                    ctx.replyWithPhoto({url: global.infoCult.data[0].data.general.image.url});   
                } else {
                    ctx.reply("К сожалению, таких мест больше нет у меня в базе, поищите что-нибудь еще)")
                    
                } 
            }, 1000);
            
        })
           

        resultSel.on('text', async (ctx) => {
            
            const currresultSel = ctx.message.text
            console.log(currresultSel)
            if (currresultSel == '❤️') {
                await ctx.reply(`Отлично, давайте смотреть дальше`, Markup.removeKeyboard())

                setTimeout(() => {
                    let fil = {"data.general.name":{"$search":global.infoQuery[0].keyword},"data.general.locale.name":{"$search":global.infoQuery[0].city}}
                    console.log(fil)
                   

                    cultureInfo(global.infoQuery[0].typeOfPlace, fil, global.infoQuery[0].number, 1);
                }, 500)
                
                //     updateNumber(ctx.from.id);
                setTimeout(() => {
                    addLike(ctx.from.id, global.infoCult.data[0].data.general.id, global.infoCult.data[0].data.general.name, global.infoCult.data[0].data.general.image.url);
                    
                    ctx.scene.reenter()
                
                }, 1000);
            }
            else if (currresultSel == '🧐') {
                await ctx.reply(`Поподробнее с этого момента`, Markup.removeKeyboard())
                
                ctx.scene.enter('detailsPlc')
            }
            else if (currresultSel == '❌') {
                await ctx.reply(`Выходим в главное меню`, Markup.removeKeyboard())
                ctx.scene.leave()
                zeroNumber(ctx.from.id)
            }
            else if (currresultSel == '👎') {
                await ctx.reply(`Сейчас подберем что-нибудь другое для вас`, Markup.removeKeyboard())
                updateNumber(ctx.from.id);
                ctx.scene.reenter()
            }
            
            else {
                await ctx.reply("Повторите, пожалуйста")
                ctx.scene.enter('resultSel')
            }
        })

        resultSel.on('message', (ctx) => {
            ctx.reply('Повторите, пожалуйста, я не понял')
        })
        return resultSel
    }

    GenDetails () {
        const detailsPlc = new Scenes.BaseScene('detailsPlc')
        detailsPlc.enter(async (ctx) => {

            const keyboard = Markup.keyboard([[
                Markup.button.text("❤️"),
                Markup.button.text("👉")
            ]]).resize();

            getQuery(ctx.from.id)
            console.log(global.infoQuery[0])
            setTimeout(() => {
                let fil = {"data.general.name":{"$search":global.infoQuery[0].keyword},"data.general.locale.name":{"$search":global.infoQuery[0].city}}
                console.log(fil)
                if (global.infoQuery[0].typeOfPlace == "Музей") {
                    global.infoQuery[0].typeOfPlace = "museums";
                }
                else if (global.infoQuery[0].typeOfPlace == "Парки") {
                    global.infoQuery[0].typeOfPlace = "parks";
                }
                else if (global.infoQuery[0].typeOfPlace == "Театр") {
                    global.infoQuery[0].typeOfPlace = "theaters";
                }
                else global.infoQuery[0].typeOfPlace = "libraries";
               

                cultureInfo(global.infoQuery[0].typeOfPlace, fil, global.infoQuery[0].number, 1);
            }, 500)
            await ctx.reply('Детали этого места: \n', keyboard)
            setTimeout(() => {
                if (global.infoCult.data.length != 0) {
                    ctx.reply(global.infoCult.data[0].data.general.name + "\n\n" + global.infoCult.data[0].data.general.description.replace('<p>', '').replace('</p>', '').replace('<span>', '').replace('</span>', ''));
                    ctx.replyWithLocation(global.infoCult.data[0].data.general.address.mapPosition.coordinates[0], global.infoCult.data[0].data.general.address.mapPosition.coordinates[1]);   
                    ctx.reply(global.infoCult.data[0].data.general.address.fullAddress + "\n" + global.infoCult.data[0].data.general.externalInfo[0].serviceName + "\n" + global.infoCult.data[0].data.general.externalInfo[0].url)

                } else {
                    ctx.reply("К сожалению, таких мест нет у меня базе, поищите что-нибудь еще)")
                    ctx.scene.leave()
                } 
            }, 1000);
            
        })
        detailsPlc.on('text', async (ctx) => {
            const detailsPlc = ctx.message.text 
            if (detailsPlc == "❤️") {
                updateUserCity(ctx.from.id, ctx.message.text);
                await ctx.reply(`Сохранено`, Markup.removeKeyboard())
                ctx.scene.enter('resultSel')
            }
            else {
                await ctx.reply("Далее")
                ctx.scene.enter('resultSel')
            }
        })
        detailsPlc.on('message', (ctx) => {
            ctx.reply('Извините, повторите, пожалуйста, ваш запрос')
        })
        return detailsPlc
        }
}


module.exports = SceneGenerator

// https://opendata.mkrf.ru/v2/libraries/$?f={"data.general.name":{"$search":"Эрмитаж"},"data.general.locale.name":{"$search":"Санкт-Петербург"}}&s=0&l=1
// https://opendata.mkrf.ru/v2/museums/$?f={"data.general.name":{"$search":"Эрмитаж"},"data.general.locale.name":{"$search":"Санкт-Петербург"}}&s=0&l=1