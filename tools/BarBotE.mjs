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

    matchesChannelId = '1429525987485286593'

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
            if (message.author.bot) return

            if (message.channelId !== this.matchesChannelId) return

            // Respond to a specific message 
            if (message.content.toLowerCase() === 'bar') {

                message.reply('BUTIA! 💜 🖤')

                this.postNextMatch(message.channelId)
            } 
        });
    }

    async postNextMatch(channelId) {
        const actualChannelId = (channelId != null) ? channelId : this.matchesChannelId;
        const channel = this.client.channels.cache.get(actualChannelId)
        if (channel) {
            const nextGame = await getNextMatch()
            channel.send(
                
`💜 *ΕΠΟΜΕΝΟΣ ΑΓΩΝΑΣ* 🖤
        
📅 ${nextGame.date}
        
🏀 ${nextGame.place}
        
📍 ${nextGame.placeLink}

▶️ ${this.linkText[Math.floor(Math.random()*this.linkText.length)]}:
TBA`
            )

        } else {
            console.error(`Channel with ID ${channelId} not found.`);
        }
    }
}