import { prisma } from './prisma';
import * as DJS from 'discord.js';
import { codeBlock, time } from '@discordjs/builders';
import { Bot } from '../';
import { container } from '@sapphire/framework';
// import canvasgif from 'canvas-gif';
import path from 'node:path';
import Canvas, { createCanvas } from '@napi-rs/canvas';

export class Util {
	bot: Bot;

	constructor(bot: Bot) {
		this.bot = bot;
	}
	async getBirthDayUsers(birthday: string) {
		return await prisma.user.findMany({
			where: {
				birthday: {
					equals: birthday
				}
			}
		});
	}
	// async makeBannerGif(data: DJS.Guild) {
	// 	const memberCount = data.memberCount;
	// 	let channelList: DJS.GuildBasedChannel[] =[]

	// 	for (const channel of data.channels.cache.values()) {
	// 		channelList.push(channel)
	// 	}
	// 	const voiceCount = channelList
	// 		.filter((ch) => ch && ch.type === DJS.ChannelType.GuildVoice)
	// 		.reduce((a, c) => {
	// 			if (!c) return 0;
	// 			if (!c.isVoiceBased()) return 0;
	// 			const memberSize: number = c.members.size;
	// 			return a + memberSize;
	// 		}, 0);

	// 	return await canvasgif(
	// 		path.resolve(__dirname, 'banner.gif'),
	// 		(ctx) => {
	// 			ctx.fillStyle = '#fff';
	// 			ctx.font = '65px "Sans"';
	// 			ctx.fillText(String(voiceCount), 250, 340);
	// 			ctx.fillText(String(memberCount), 250, 460);
	// 		},
	// 		{
	// 			coalesce: true, // whether the gif should be coalesced first, default: false
	// 			delay: 0, // the delay between each frame in ms, default: 0
	// 			repeat: 0, // how many times the GIF should repeat, default: 0 (runs forever)
	// 			algorithm: 'octree', // the algorithm the encoder should use, default: 'neuquant',
	// 			optimiser: true, // whether the encoder should use the in-built optimiser, default: false,
	// 			fps: 20, // the amount of frames to render per second, default: 60
	// 			quality: 40 // the quality of the gif, a value between 1 and 100, default: 100
	// 		}
	// 	);
	// }
	async makeBannerImage(data: DJS.Guild) {
		const memberCount = data.memberCount;
		const channels = await data.channels.fetch();
		const voiceCount = channels
			.filter((ch) => ch && ch.type === DJS.ChannelType.GuildVoice)
			.reduce((a, c) => {
				if (!c) return 0;
				if (!c.isVoiceBased()) return 0;
				const memberSize: number = c.members.size;
				return a + memberSize;
			}, 0);


		// function getLines(ctx: any, text: string, maxWidth: number) {
		// 	var words = text.split(" ");
		// 	var lines = [];
		// 	var currentLine = words[0];

		// 	for (var i = 1; i < words.length; i++) {
		// 		var word = words[i];
		// 		var width = ctx.measureText(currentLine + " " + word).width;
		// 		if (width < maxWidth) {
		// 			currentLine += " " + word;
		// 		} else {
		// 			lines.push(currentLine);
		// 			currentLine = word;
		// 		}
		// 	}
		// 	lines.push(currentLine);
		// 	return lines;
		// }

		const mostActiveId = container.mostActive
		const user = await data.members.fetch(mostActiveId)
		let name = user.displayName?.slice(0, 10) ?? "";
		if (name.length > 9) name = name + "..."

		const avatar = await Canvas.loadImage(user.displayAvatarURL());


		const background = await Canvas.loadImage(path.resolve(__dirname, 'banner-ai5.png'));

		const canvas = createCanvas(background.width, background.height);
		const ctx = canvas.getContext('2d');

		ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

		ctx.save();

		ctx.fillStyle = "#fff";
		ctx.font = "bold 80px Arial";
		ctx.fillText(name, 606, 750);
		ctx.save();

		// console.log(user.presence?.activities)
		// if (user.presence?.status) {
		// 	ctx.fillStyle = "#777777";
		// 	ctx.font = "bold 42px Arial";
		// 	getLines(ctx, user.presence.status, 400).map((line, i) =>
		// 		ctx.fillText(line, 606, 800 + i * 40)
		// 	);
		// 	ctx.save();
		// }


		ctx.fillStyle = "#fff";
		ctx.font = "bold 200px Arial";
		ctx.fillText(String(voiceCount), 1460, 770);
		ctx.save();

		ctx.font = "bold 50px Arial";
		ctx.fillText(String(memberCount), 995, 935);
		ctx.save()

		// ctx.font = "bold 25px Arial";
		// ctx.fillText("7000", 550, 370);
		// ctx.save();

		ctx.beginPath();
		ctx.arc(392, 760, 146, 0, Math.PI * 2, true);
		ctx.closePath();
		ctx.clip();

		ctx.drawImage(avatar, 200, 600, 350, 320);
		ctx.restore();


		return canvas.encode('png');
	}
	async buyItem({
		userId,
		amountToSubtract,
		user,
		item
	}: {
		userId: string;
		amountToSubtract: number;
		user?: { money: number; userId: string; inventory: any[] };
		item: string;
	}) {
		if (user) {
			const result = await prisma.user.updateMany({
				where: {
					userId: user.userId
				},
				data: {
					money: user.money - amountToSubtract,
					inventory: [...user.inventory, item]
				}
			});
			return result;
		} else {
			const userToSubtractFrom = await this.getUserById(userId);
			if (!userToSubtractFrom) throw new Error('No user');
			const result = await prisma.user.updateMany({
				where: {
					userId: userToSubtractFrom.userId
				},
				data: {
					money: userToSubtractFrom.money - amountToSubtract,
					inventory: [...userToSubtractFrom.inventory, item]
				}
			});
			return result;
		}
	}

	async hasEnoughMoneyFor(userId: string, item: { price: number }) {
		const user = await this.getUserById(userId);
		if (!user) {
			throw new Error('Error fetching user');
		}
		return {
			user,
			result: user.money > item.price
		};
	}
	async getUserById(userId: string) {
		const user: any =
			(await prisma.user.findFirst({
				where: { userId }
			})) ?? (await this.addUser(userId));
		user.update = (data: any) => {
			return this.updateUserById(userId, data);
		};
		return user as {
			id: string;
			userId: string;
			dailyCooldown: number | null;
			money: number;
			inventory: string[];
			reputation: string[];
			experience: number;
			messagesSent: number;
			timeInVoice: number;
			isRashist: boolean;
			birthday: string | null;
			partner?: string
			activeBg: string
			update: (data: any) => any;
		};
	}
	async getAllItems() {
		const items = await prisma.item.findMany();

		return items;
	}
	async getItemsByName(itemNames: string[]) {
		const items = await prisma.item.findMany();

		return items.filter((item: any) => itemNames.includes(item.name));
	}
	async getItemByName(name: string) {
		const item = await prisma.item.findFirst({
			where: { name }
		});
		return item;
	}
	async addUser(userId: string, data?: any) {
		const user = await prisma.user.create({
			data: {
				userId,
				money: 0,
				...data
			}
		});
		return user;
	}
	async updateUserById(userId: string, data: any) {
		const user = await this.getUserById(userId);

		if (!user) {
			this.addUser(userId, data);
			return;
		}

		const res = await prisma.user.updateMany({
			where: { userId },
			data
		});
		return res;
	}
	async sendErrorLog(err: unknown, type: 'warning' | 'error'): Promise<void> {
		const error = err as DJS.DiscordAPIError | DJS.HTTPError | Error;

		try {
			if (error.message.includes('Missing Access')) return;
			if (error.message.includes('Unknown Message')) return;
			if (error.stack?.includes('DeprecationWarning: Listening to events on the Db class')) {
				return;
			}

			const channelId = process.env['ERRORLOGS_CHANNEL_ID'] as DJS.Snowflake | undefined;
			if (!channelId) {
				return console.error('ERR_LOG', error.stack || `${error}`);
			}

			const channel = (this.bot.channels.cache.get(channelId) || (await this.bot.channels.fetch(channelId))) as DJS.TextChannel;

			if (!channel || !channel.permissionsFor(this.bot.user!)?.has(DJS.PermissionFlagsBits.SendMessages)) {
				return console.error('ERR_LOG', error.stack || `${error}`);
			}

			const message = {
				author: this.bot.user
			};

			const code = 'code' in error ? error.code : 'N/A';
			const httpStatus = 'status' in error ? error.status : 'N/A';
			const requestBody = 'requestBody' in error ? error.requestBody : { json: {} };

			const name = error.name || 'N/A';
			let stack = error.stack || error;
			let jsonString: string | undefined = '';

			try {
				jsonString = JSON.stringify(requestBody.json, null, 2);
			} catch {
				jsonString = '';
			}

			if (jsonString.length >= 2048) {
				jsonString = jsonString ? `${jsonString.slice(0, 2045)}...` : '';
			}

			if (typeof stack === 'string' && stack.length >= 2048) {
				console.error(stack);
				stack = 'An error occurred but was too long to send to Discord, check your console.';
			}

			const embed = this.baseEmbed(message)

				.addFields(
					{ name: 'Name', value: name, inline: true },
					{
						name: 'Code',
						value: code.toString(),
						inline: true
					},
					{
						name: 'httpStatus',
						value: httpStatus.toString(),
						inline: true
					},
					{ name: 'Timestamp', value: Date.now().toString(), inline: true },
					{ name: 'Request data', value: codeBlock(jsonString.slice(0, 2045)) }
				)
				.setDescription(codeBlock(stack as string))
				.setColor(type === 'error' ? DJS.Colors.Red : DJS.Colors.Orange);

			channel.send({ embeds: [embed] });
		} catch (e) {
			console.error({ error });
			console.error(e);
		}
	}
	async findMember(
		message: Partial<DJS.Message> | DJS.CommandInteraction,
		args: string[],
		options?: { allowAuthor?: boolean; index?: number }
	): Promise<DJS.GuildMember | undefined | null> {
		if (!message.guild) return;
		const index = options?.index ?? 0;

		let member: DJS.GuildMember | null | undefined;
		const arg = (args[index]?.replace?.(/[<@!>]/gi, '') || args[index]) as DJS.Snowflake;

		const mention =
			'mentions' in message // check if the first mention is not the bot prefix
				? message.mentions?.users.first()?.id !== this.bot.user?.id
					? message.mentions?.users.first()
					: message.mentions?.users.first(1)[1]
				: null;

		member =
			message.guild.members.cache.find((m) => m.user.id === mention?.id) ||
			message.guild.members.cache.get(arg) ||
			message.guild.members.cache.find((m) => m.user.id === args[index]) ||
			(message.guild.members.cache.find((m) => m.user.tag === args[index]) as DJS.GuildMember);

		if (!member && arg) {
			const fetched = await message.guild.members.fetch(arg).catch(() => null);

			if (fetched) {
				member = fetched;
			}
		}

		if (!member && options?.allowAuthor) {
			// @ts-expect-error ignore
			member = new DJS.GuildMember(this.bot, message.member!, message.guild);
		}

		return member;
	}

	async findRole(message: DJS.Message, arg: DJS.Snowflake): Promise<DJS.Role | null> {
		if (!message.guild) return null;
		return (
			message.mentions.roles.first() ||
			message.guild.roles.cache.get(arg) ||
			message.guild.roles.cache.find((r) => r.name === arg) ||
			message.guild.roles.cache.find((r) => r.name.startsWith(arg)) ||
			message.guild.roles.fetch(arg)
		);
	}

	async createWebhook(channelId: DJS.Snowflake, oldChannelId: string | null) {
		const channel = this.bot.channels.cache.get(channelId);
		if (!channel) return;
		if (!this.bot.user) return;
		if (!(channel as DJS.TextChannel).permissionsFor(this.bot.user.id)?.has(DJS.PermissionFlagsBits.ManageWebhooks)) {
			return;
		}

		if (oldChannelId) {
			const webhooks = await (channel as DJS.TextChannel).fetchWebhooks();
			await webhooks.find((w) => w.name === `audit-logs-${oldChannelId}`)?.delete();
		}

		await (channel as DJS.TextChannel).createWebhook({
			name: `audit-logs-${channelId}`,
			avatar: this.bot.user.displayAvatarURL({ extension: 'png' })
		});
	}

	async updateMuteChannelPerms(guild: DJS.Guild, memberId: DJS.Snowflake, perms: Partial<DJS.PermissionOverwriteOptions>) {
		guild.channels.cache.forEach((channel) => {
			if (channel instanceof DJS.ThreadChannel) return;

			channel.permissionOverwrites.create(memberId, perms as DJS.PermissionOverwriteOptions).catch((e) => {
				console.error('updateMuteChannelPerms', e);
			});
		});
	}
	errorEmbed(permissions: bigint[], message: DJS.Message | DJS.ChatInputCommandInteraction, lang: Record<string, string>) {
		return this.baseEmbed(message)
			.setTitle('Woah!')
			.setDescription(
				`❌ I need ${permissions
					.map((p) => {
						const perms: string[] = [];
						Object.keys(DJS.PermissionFlagsBits).map((key) => {
							//@ts-ignore
							if (DJS.PermissionFlagsBits[key] === p) {
								perms.push(`\`${lang[key]}\``);
							}
						});

						return perms;
					})
					.join(', ')} permissions!`
			)
			.setColor(DJS.Colors.Orange);
	}

	baseEmbed(message: DJS.Message | DJS.ChatInputCommandInteraction | DJS.SelectMenuInteraction | { author: DJS.User | null }) {
		const user = 'author' in message ? message.author : message.user;

		const avatar = user?.displayAvatarURL();
		const username = user?.username ?? this.bot.user?.username ?? 'Unknown';

		return new DJS.EmbedBuilder().setFooter({ text: username, iconURL: avatar }).setColor('#5865f2').setTimestamp();
	}
	parseMessage(message: string, user: DJS.User, msg?: DJS.Message | { guild: DJS.Guild; author: DJS.User }): string {
		return message
			.split(' ')
			.map((word) => {
				const { username, tag, id, discriminator } = user;
				const createdAt = time(new Date(user.createdAt), 'f');
				word = word
					.replace('{user}', `<@${id}>`)
					.replace('{user.tag}', this.escapeMarkdown(tag))
					.replace('{user.username}', this.escapeMarkdown(username))
					.replace('{user.discriminator}', discriminator)
					.replace('{user.id}', id)
					.replace('{user.createdAt}', createdAt);

				if (msg) {
					if (!msg.guild) return word;

					word.replace('{guild.id}', msg.guild.id)
						.replace('{guild.name}', this.escapeMarkdown(msg.guild.name))
						.replace('{message.author}', `<@${msg.author.id}>`)
						.replace('{message.author.id}', msg.author.id)
						.replace('{message.author.tag}', this.escapeMarkdown(msg.author.tag))
						.replace('{message.author.username}', this.escapeMarkdown(msg.author.username));
				}

				return word;
			})
			.join(' ');
	}

	isBotInSameChannel(message: DJS.Message | DJS.CommandInteraction) {
		// @ts-expect-error ignore
		const member = new DJS.GuildMember(this.bot, message.member!, message.guild!);
		const voiceChannelId = member?.voice.channelId;

		if (!voiceChannelId) return false;
		if (!message.guild?.members.me) return false;

		return message.guild.members.me.voice.channelId === voiceChannelId;
	}

	translate<Str extends string, Values extends Record<string, string | number>>(string: Str, values: Values): string {
		const regex = /\{[a-z0-9_-]\w+\}/gi;
		const keys = string.match(regex) ?? [];

		keys.forEach((key) => {
			const parsedKey = key.replace('{', '').replace('}', '');
			const value = values[parsedKey];
			string = string.replaceAll(key, String(value)) as Str;
		});

		return string;
	}

	hasSendPermissions(resolveable: DJS.Message | DJS.GuildTextBasedChannel) {
		const ch = 'channel' in resolveable ? resolveable.channel : resolveable;
		if (!('permissionsFor' in ch)) return false;
		if (ch instanceof DJS.ThreadChannel || ch instanceof DJS.DMChannel) {
			return true;
		}

		return ch.permissionsFor(this.bot.user!)?.has(DJS.PermissionFlagsBits.SendMessages);
	}

	escapeMarkdown(message: string): string {
		return DJS.escapeMarkdown(message, {
			codeBlock: true,
			spoiler: true,
			inlineCode: true,
			inlineCodeContent: true,
			codeBlockContent: true
		});
	}

	codeContent(string: string, extension = ''): string {
		return `\`\`\`${extension}\n${string}\`\`\``;
	}

	calculateXp(xp: number): number {
		return Math.floor(0.1 * Math.sqrt(xp));
	}

	formatNumber(n: number | string): string {
		return Number.parseFloat(String(n)).toLocaleString('be-BE');
	}

	encode(obj: Record<string, unknown>) {
		let string = '';

		for (const [key, value] of Object.entries(obj)) {
			if (!value) continue;
			string += `&${encodeURIComponent(key)}=${encodeURIComponent(`${value}`)}`;
		}

		return string.substring(1);
	}
}
