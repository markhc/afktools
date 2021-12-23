import { Channel, Message, NewsChannel, TextChannel } from 'discord.js';
import Errors from './Errors';

export async function channelDeleteRecentMessages(
  channel: Channel,
  count: number
): Promise<number> {
  if (channel instanceof TextChannel || channel instanceof NewsChannel) {
    const result = await channel.bulkDelete(count);

    return result.size;
  } else {
    throw Errors.INVALID_CHANNEL_TYPE;
  }
}
