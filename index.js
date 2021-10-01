const {prefix, token} = require('./config.json');
const discord = require('discord.js');
const {AudioManager} = require('discordaudio');
const client = new discord.Client({intents: [discord.Intents.FLAGS.GUILDS, discord.Intents.FLAGS.GUILD_MESSAGES, discord.Intents.FLAGS.GUILD_VOICE_STATES]});
const connections = new Map();
const audioManager = new AudioManager();

client.once('ready', () => console.log(`${client.user.username} is online!`));

client.on('messageCreate', message => {
    if(message.author.bot || message.channel.type === `DM`) return;
    
    if(!message.content.startsWith(prefix)) return;
    
    let args = message.content.substring(prefix.length).split(" ");
    
    const vc = connections.get(message.guild.me.voice.channel?.id);
    
    switch(args[0].toLowerCase()){
        case 'play':
            if(!message.member.voice.channel && !message.guild.me.voice.channel) return message.channel.send({content: `음성 채널에 들어오셔서 절 불러주세요.`});
            if(!args[1]) return message.channel.send({content: `올바른 URL이 아닙니다.`});
            const uvc = message.member.voice.channel || message.guild.me.voice.channel;
            audioManager.play(uvc, args[1], {
                quality: 'high',
                audiotype: 'arbitrary',
                volume: 10
            }).then(queue => {
                connections.set(uvc.id, uvc);
                if(queue === false) message.channel.send({content: `노래가 현재 재생 중입니다.`});
                else message.channel.send({content: `노래가 정상적으로 추가되었습니다.`});
            }).catch(err => {
                console.log(err);
                message.channel.send({content: `음성채널에 연결하는데 에러가 발생했습니다.`});
            });
            break;
        case 'skip':
            if(!vc) return message.channel.send({content: `현재 재생중인 곡이 없습니다.`});
            audioManager.skip(vc).then(() => message.channel.send({content: `정상적으로 스킵했습니다.`})).catch(err => {
                console.log(err);
                message.channel.send({content: `스킵하는데 에러가 발생했습니다.`});
            });
            break;
        case 'stop':
            if(!vc) return message.channel.send({content: `현재 재생중인 곡이 없습니다.`});
            audioManager.stop(vc);
            message.channel.send({content: `정상적으로 종료되었습니다.`});            
            break;

    }
});

client.login(token)