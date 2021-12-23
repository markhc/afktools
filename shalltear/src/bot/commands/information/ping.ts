import { Message } from 'discord.js';
import { ICommand, CommandData } from '../../ICommand';
import { produceCommands } from '../../services/DiscordUtils';

export default produceCommands('Information')({
  name: 'ping',
  description: 'Displays gateway latency.',
  guildOnly: false,
  cooldown: 5,
  usage: '',

  execute({ message }: { message: Message }) {
    message.reply(`Latency: ${message.client.ws.ping}`);
  },
});
