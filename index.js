const { Client } = require('discord.js');
const client = global.Client = new Client({ fetchAllMembers: true, partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });
const mongoose = require('mongoose');
const { token, prefix, url } = require('./config.json');
const data = require('./database/reaction.js');

mongoose.connect(url, {
useNewUrlParser: true,
useUnifiedTopology: true
}).catch(err => {console.error(err);});

client.on('ready', async () => {
console.log(`${client.user.tag} Bot Başarı İle Başlatıldı.`)
})

client.on('message', async message => {
    if (message.author.bot || !message.guild || !message.content.toLowerCase().startsWith(prefix)) return;
    let args = message.content.split(' ').slice(1);
    let command = message.content.split(' ')[0].slice(prefix.length);

    if(command === 'reaksiyon') {
    if(args[0] !== 'ekle' && args[0] !== 'sil') return message.reply(`reaksiyonu \`Ekle/sil\` yazmalısınız.`);
    if(args[0] === 'ekle') {
    let channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[1]);
    let id = args[2];
    let rol = message.mentions.roles.first() || message.guild.roles.cache.get(args[3]);
    let emoji = args[4];
    if(!channel) return message.reply('Tepki mesajı kanalını belirtmelisiniz.');
    if(!id) return message.reply('Bir tepki mesajı ID si belirtmelisiniz.');
    if(!rol) return message.reply('Tepkiye Atanacak rolü belirtmelisiniz.');
    if(!emoji) return message.reply('Tepki emojisini belirtmelisiniz.');
    channel.messages.fetch(id).then(msgid => {
    msgid.react(emoji);
    new data({
    guild: message.guild.id,
    message: id,
    role: rol.id,
    emoji: emoji
    }).save();
    message.reply(`Reaksiyon başarıyla oluşturuldu. (${emoji})`);
    })
    }
    if(args[0] === 'sil') {
        let id = args[1];
        if(!id) return message.reply('Bir tepki mesajı IDsi belirtmelisiniz.');;
        let x = await data.findOne({ message: id });
        if(!x) return message.reply('Databasede Böyle bir tepki bulamadım.');
      await data.findOneAndDelete({ guild: message.guild.id, message: id });
      message.reply('reaksiyon başarıyla silindi.');
        }
}
})

client.on('messageReactionAdd', async (reaction, user) => {
if(!reaction.message.guild) return;
if(client.user.id === user.id) return;
let emoji = reaction.emoji.toString();
data.findOne({ guild: reaction.message.guild.id, message: reaction.message.id, emoji: emoji }, async function (err, docs) {
   if(docs) {
let member = reaction.message.guild.members.cache.get(user.id)
if(reaction.message.guild.roles.cache.get(docs.role)) {
if(!member.roles.cache.has(docs.role)) member.roles.add(docs.role)
console.log(`${member}, adlı kullanıcı reaksiyon emojisne bastı ve rolü verildi.`)
}
}
})
})

client.on('messageReactionRemove', async (reaction, user) => {
    if(!reaction.message.guild) return;
    if(client.user.id === user.id) return;
    let emoji = reaction.emoji.toString();
    data.findOne({ guild: reaction.message.guild.id, message: reaction.message.id, emoji: emoji }, async function (err, docs) {
     if(docs) {
    let member = reaction.message.guild.members.cache.get(user.id)
    if(reaction.message.guild.roles.cache.get(docs.role)) {
    if(member.roles.cache.has(docs.role)) member.roles.remove(docs.role)
    console.log(`${member}, adlı kullanıcı tekrardan reaksiyon emojisne bastı ve rolü alındı.`)
    }
     }
    })
    })

client.login(token).catch(hata => {console.error(hata); });
