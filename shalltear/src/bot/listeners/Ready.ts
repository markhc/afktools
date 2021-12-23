import BotClient from '../BotClient';

export default {
  listen: 'ready',

  execute(client: BotClient) {
    console.log('Logged in!');
  },
};
