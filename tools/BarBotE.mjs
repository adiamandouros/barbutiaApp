import { Client, GatewayIntentBits } from 'discord.js'
import { getNextMatch } from '../model/matchController.mjs';

export class BarBotE {

    linkText = [
        'Linkάνθρωπος',
        'Linkιν Πάρκ',
        'Αβραάμ Linkολν',
        'Linkόσκυλο',
        'Βλέπει ο Θεός το Αϊβαlink',
        'Μπρούς Link',
        'Νίκος Χατζηlinkολάου',
        'Ε ντε λα μαγκέ ντε Βοταlink',
        'Linkουίνι',
        'Λερόι Μερlink',
        'Κακό σκυlink'
    ]

    constructor() {
        // Discord Bot Setup
        this.client = new Client({ 
            intents: [ 
                GatewayIntentBits.Guilds,  
                GatewayIntentBits.GuildMessages,  
                GatewayIntentBits.MessageContent] 
        });

        this.client.once('clientReady', () => { 
            console.log(`🤖 Logged in as ${this.client.user.tag}`); 
        }); 

        this.client.login(process.env.DISCORD_TOKEN);

        this.client.on('messageCreate', async message => { 

            // Ignore messages from bots 
            if (message.author.bot) return; 

            // Respond to a specific message 
            if (message.content.toLowerCase() === 'bar') {

                message.reply('BUTIA! 💜 🖤'); 
                const nextGame = await getNextMatch()
                
                // const nextGame = {
                //     date: 'Παρασκευή 4/9/1987 14:00',
                //     place: 'Κλειστό Γυμναστήριο Μπαρμπούτια',
                //     placeLink: 'https://goo.gl/maps/example'
                // }

                message.channel.send(
`💜 *ΕΠΟΜΕΝΟΣ ΑΓΩΝΑΣ* 🖤
        
${nextGame.date}
        
${nextGame.place}
        
${nextGame.placeLink}

${this.linkText[Math.floor(Math.random()*this.linkText.length)]}:
TBA`);
    ;
    
            } 
        });
    }

    postMessage(channelId, message) {
        const channel = this.client.channels.cache.get(channelId);
        if (channel) {
            channel.send(message);
        } else {
            console.error(`Channel with ID ${channelId} not found.`);
        }
    }
}

