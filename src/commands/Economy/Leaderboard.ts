import { Command } from '@sapphire/framework';
import { pagination, ButtonTypes, ButtonStyles } from '../../utils/pagination';
import { prisma } from '../../utils/prisma';
import * as DJS from 'discord.js';

export class LeaderboardCommand extends Command {
	public constructor(context: Command.Context, options: Command.Options) {
		super(context, {
			...options,
			description: 'Open the leaderboard for the server'
		});
	}

	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder //
				.setName(this.name)
				.setDescription(this.description)
		);
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		await interaction.deferReply();

		const leaderboard = (
			await prisma.user.findMany({
				where: {
					money: {
						gt: 0
					}
				}
			})
		).sort((a, b) => b.money - a.money);

		const amountOfEmbeds = Math.round(leaderboard.length / 10);
		let leaderboards: DJS.EmbedBuilder[] = [];
		for (let x of [...Array(amountOfEmbeds).keys()]) {
			const leaderboardEmbed = await createLeaderboard(leaderboard, x + 1);
			leaderboards.push(leaderboardEmbed);
		}

		return await pagination({
			embeds: leaderboards as unknown as DJS.Embed[],
			interaction: interaction,
			author: interaction.user,
			buttons: [
				{
					type: ButtonTypes.previous,
					label: `Previous`,
					style: ButtonStyles.Primary
				},
				{
					type: ButtonTypes.next,
					label: `Next`,
					style: ButtonStyles.Success
				}
			]
		});
	}
}

const createLeaderboard = async (leaderboard: any, page = 1) => {
	const subset = 10;
	const leaderboardValues = leaderboard.slice((page - 1) * subset, page * subset);
	const leaderboardEmbed = new DJS.EmbedBuilder()
		.setTitle('**Leaderboard**')
		.setDescription(leaderboardValues.map((user: any) => `<@${user.userId}> - $${user.money}\n\n`).join(''));

	return leaderboardEmbed;
};
