import vm from 'vm';
import { CommandData } from '../../ICommand';
import { removeCommandInvocation } from '../../services/DiscordUtils';
import { produceCommands } from '../../services/DiscordUtils';

import Discord from 'discord.js';

export default produceCommands('Owner')({
  name: 'eval',
  description: 'Evaluates arbitrary code.',
  guildOnly: false,
  cooldown: 5,
  usage: '<code>',
  permissions: 'BOT_OWNER',

  execute({ client, message, args }: CommandData) {
    if (args.length == 0) {
      return message.reply(`Invalid number of arguments. Expected 1, found 0.`);
    }
    const code = removeCommandInvocation(client, this, message);
    const sandbox = {
      console,
      context: { message, guild: message.guild, client },
    };
    const context = vm.createContext(sandbox);
    const options = {
      timeout: 3000, // 3s
    };

    try {
      const result = vm.runInContext(code, context, options);
      if (result !== undefined) message.channel.send(result);
    } catch (error: any) {
      message.reply(error.message);
    }
  },
});
