import './lib/setup';
import { LogLevel, SapphireClient, container } from '@sapphire/framework';
import { GatewayIntentBits, Partials, type ClientOptions, Collection } from 'discord.js';
import { Util } from './utils/Util';

export class Bot extends SapphireClient {
	public constructor(options: ClientOptions) {
		super(options);
		container.utils = new Util(this);
		container.recentlyTalked = new Collection();
	}
}

declare module '@sapphire/pieces' {
	interface Container {
		utils: Util;
		recentlyTalked: Collection<string, number>;
		mostActive: string
	}
}

export const client = new Bot({
	defaultPrefix: '!',
	regexPrefix: /^(hey +)?bot[,! ]/i,
	caseInsensitiveCommands: true,
	logger: {
		level: LogLevel.Debug
	},
	shards: 'auto',
	intents: [
		GatewayIntentBits.DirectMessageReactions,
		GatewayIntentBits.DirectMessages,
		GatewayIntentBits.GuildModeration,
		GatewayIntentBits.GuildEmojisAndStickers,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildVoiceStates,
		GatewayIntentBits.MessageContent
	],
	partials: [Partials.Channel],
	loadMessageCommandListeners: true
});

const main = async () => {
	try {
		client.logger.info('Logging in');
		await client.login();
		client.logger.info('logged in');
	} catch (error) {
		client.logger.fatal(error);
		client.destroy();
		process.exit(1);
	}
};

main();
