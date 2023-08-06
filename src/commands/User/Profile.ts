import { Command } from '@sapphire/framework';
// import { EmbedBuilder } from 'discord.js';
import Canvas, { createCanvas } from '@napi-rs/canvas';
import path from 'node:path';
import * as DJS from 'discord.js';
import ms from 'ms';
import backgrounds from '../../items/backgrounds';

export class ProfileCommand extends Command {
	public constructor(context: Command.Context, options: Command.Options) {
		super(context, {
			...options,
			description: 'Check your profile on the server'
		});
	}
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder //
				.setName(this.name)
				.setDescription(this.description)
				.addUserOption((opt) => opt.setName('user').setDescription('The whose profile you want to view').setRequired(false))
		);
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		await interaction.deferReply();
		const userToView = interaction.options.getUser('user') ?? interaction.user;
		const user = await this.container.utils.getUserById(userToView.id);
		// const reputation = user.reputation || [];

		const level = Math.floor(0.15 * Math.sqrt(user.experience + 1));
		// console.log(userToView.avatarURL())
		// const rank = new canvacord.Rank()
		// 	.setAvatar(userToView.avatarURL() ?? '')
		// 	.setCurrentXP(user.experience ?? 0)
		// 	.setRequiredXP(Math.floor(((level + 1) / 0.15) * ((level + 1) / 0.15)))
		// 	.setProgressBar('#FFFFFF', 'COLOR')
		// 	.setLevel(level)
		// 	.setUsername(userToView.username)
		// 	.setRank((user.reputation || []).length, "REP")

		// const image = await rank.build();
		const lastRep: string[] = user.reputation?.slice(-3)
		const repUsers = (await interaction.guild?.members.fetch({ user: lastRep }))!.map(val => val)
		const partner = user.partner ? await interaction.guild?.members.fetch(user.partner) : undefined
		const selectedBackground = backgrounds.find(bg => bg.name === user.activeBg)
		const image = await createProfile(userToView, {
			level,
			voiceTime: user.timeInVoice,
			messageCount: user.messagesSent,
			balance: user.money,
			reputation: user.reputation,
			repUsers,
			partner,
			selectedBackground,
			currentXp: user.experience,
			requiredXp: Math.floor(((level + 1) / 0.15) * ((level + 1) / 0.15)),
			minXp: Math.floor(((level) / 0.15) * ((level) / 0.15)),
		});
		return await interaction.editReply({
			files: [image]
		});
	}
}

const shortenName = (username: string, amount = 10) => {
	let name = username?.slice(0, amount) ?? '';
	if (name.length > amount - 1) name = name + '...';
	return name
}
const createProfile = async (
	user: DJS.User,
	{
		level,
		voiceTime,
		messageCount,
		balance,
		reputation,
		repUsers,
		partner,
		selectedBackground,
		currentXp,
		requiredXp,
		minXp

	}: {
		level: number; voiceTime: number; messageCount: number; balance: number; reputation: string[], repUsers: DJS.GuildMember[], partner?: DJS.GuildMember, selectedBackground?: {
			name: string,
			image: string
		},
		currentXp: number
		requiredXp: number
		minXp: number
	}
) => {
	const background = await Canvas.loadImage(path.resolve(__dirname, 'profile.png'));

	const avatar = await Canvas.loadImage(user.displayAvatarURL());
	const repAvatars = await Promise.all(repUsers.map(user => Canvas.loadImage(user.displayAvatarURL())))

	let partnerAvatar;
	if (partner) {
		partnerAvatar = await Canvas.loadImage(partner.displayAvatarURL())
	}
	const canvas = createCanvas(background.width, background.height);
	const ctx = canvas.getContext('2d');

	if (selectedBackground) {
		const bg = await Canvas.loadImage(selectedBackground.image)
		ctx.drawImage(bg, 0, 0, canvas.width, canvas.height)
	}
	ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

	ctx.save();


	ctx.fillStyle = '#fff';
	ctx.font = 'bold 67.37px Arial';
	ctx.fillText(shortenName(user.username, 6), 195, 610);
	ctx.save();

	//level
	ctx.font = 'bold 50px Arial';
	ctx.fillText(String(level), 770, 830);
	ctx.save();

	ctx.fillStyle = "#4E6B93";

	const progress = calculateProgress({
		currentXp: currentXp,
		minXp: minXp,
		width: 870,
		requiredXP: requiredXp,
	});
	ctx.roundRect(920, 820, progress, 15, 20);

	ctx.fill();
	ctx.fillStyle = "#fff";


	//stats
	ctx.font = 'bold 42px Arial';
	ctx.fillText(String(ms(voiceTime)), 1700, 170);
	ctx.save();

	ctx.fillText(String(messageCount), 1700, 290);
	ctx.save();

	ctx.fillText(String(balance), 1700, 410);
	ctx.save();

	ctx.fillText(String(reputation.length), 1700, 525);
	ctx.save();

	ctx.beginPath();
	ctx.arc(338, 389, 125, 0, Math.PI * 2, true);
	ctx.closePath();
	ctx.clip();

	ctx.drawImage(avatar, 210, 260, 250, 250);
	ctx.restore();

	//partner
	if (partner) {
		ctx.beginPath();
		ctx.arc(176, 775, 48, 0, Math.PI * 2, true);
		ctx.closePath();
		ctx.clip();
		ctx.drawImage(partnerAvatar!, 125, 715, 100, 110);
		ctx.restore();
	}
	//rep



	if (repAvatars[0]) {
		ctx.beginPath();
		ctx.arc(741.5, 274.5, 36, 0, Math.PI * 2, true);
		ctx.closePath();
		ctx.clip();
		ctx.drawImage(repAvatars[0], 706, 235, 70, 90);
		ctx.restore();
		ctx.fillText(shortenName(repUsers[0].displayName), 814, 280);
	}

	if (repAvatars[1]) {
		ctx.beginPath();
		ctx.arc(741.5, 380.5, 36, 0, Math.PI * 2, true);
		ctx.closePath();
		ctx.clip();

		ctx.drawImage(repAvatars[1], 706, 340, 70, 90);
		ctx.restore();
		ctx.fillText(shortenName(repUsers[1].displayName), 814, 390);
	}

	if (repAvatars[2]) {
		ctx.beginPath();
		ctx.arc(741.5, 486, 36, 0, Math.PI * 2, true);
		ctx.closePath();
		ctx.clip();

		ctx.drawImage(repAvatars[2], 706, 440, 70, 90);
		ctx.restore();
		ctx.fillText(shortenName(repUsers[2].displayName), 814, 500);
	}

	return canvas.encode('png');
};

function calculateProgress({ currentXp, requiredXP, width, minXp }: {
	currentXp: number,
	requiredXP: number,
	width: number,
	minXp: number
}) {
	const cx = currentXp;
	const rx = requiredXP;

	if (rx <= 0) return 1;
	if (cx > rx) return width || 0;

	if (minXp > 0) {
		const mx = minXp;
		if (cx < mx) return 0;

		const nx = cx - mx;
		const nr = rx - mx;
		return (nx * 900) / nr;
	}

	let calcWidth = (cx * 900) / rx;
	if (calcWidth > width) calcWidth = width;
	return calcWidth || 0;
}