const { Telegraf, session, Scenes, Markup } = require('telegraf')

const SceneGenerator = require("./Scenes")
const curScene = new SceneGenerator()
const typeOfCulPlaceScene = curScene.GentypeOfCulPlaceScene();
const keywordScene = curScene.GenkeywordScene()
const selectCityScene = curScene.GenselectCityScene()
const resultSelCityScene = curScene.GenresultSelScene()
const detailsScene = curScene.GenDetails()

const config = require("./config.json");
const { getLike } = require('./DBconnect');
const bot = new Telegraf(config.token)


const stage = new Scenes.Stage([typeOfCulPlaceScene, selectCityScene, keywordScene, resultSelCityScene, detailsScene])


bot.use(session())
bot.use(stage.middleware())

const keyboard = Markup.inlineKeyboard([
  Markup.button.url('🤘🏼', 'https://www.culture.ru/'),
  Markup.button.callback('Delete', 'delete')
])

// * команды
bot.start((ctx) => {
  ctx.reply('Персональный проект Лебедева Александра из 9Б класса: телеграм Бот афиша культурных мест \nПривет, я помогу тебе определиться с походом в культурное место Москвы! \nДля начала давай определимся с твоими предпочтениями! \nДля работы с фильтрами напиши /events')
  ctx.replyWithSticker('https://cdn.tlgrm.app/stickers/ef4/384/ef43849d-2d90-342e-a871-0684acf223c1/192/3.webp')
})
bot.help((ctx) => ctx.reply('Help message'))
bot.command('events', async (ctx) => {
  ctx.scene.enter('typeOfCulPlace')
})
bot.command('saves', async (ctx) => {
  getLike(ctx.from.id)
  setTimeout(() => {
    if (global.likes.length){
      for (let i = 0; i < global.likes.length; i++) {
        ctx.reply(global.likes[i].name)
        ctx.replyWithPhoto({url: global.likes[i].image})
    }} else {
      ctx.reply("У вас еще нет сохраненных мест")
      }
  }, 500);
})


// * в случае, если нет такого сообщения
bot.on('message', (ctx) => ctx.telegram.sendCopy(ctx.message.chat.id, ctx.message, keyboard))
bot.action('delete', (ctx) => ctx.deleteMessage())

bot.launch()

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
