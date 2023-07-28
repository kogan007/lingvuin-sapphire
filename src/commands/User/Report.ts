import { Command } from '@sapphire/framework';
import * as DJS from 'discord.js';

export class ReportCommand extends Command {
	public constructor(context: Command.Context, options: Command.Options) {
		super(context, {
			...options,
			description: 'Report a user'
		});
	}
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder //
				.setName(this.name)
				.setDescription(this.description)
				.addUserOption((opt) => opt.setName('user').setDescription('The user to report').setRequired(true))
				.addStringOption((opt) => opt.setName('reason').setDescription('The reason for reporting').setRequired(true))
		);
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		await interaction.deferReply({ ephemeral: true });

		const sender = interaction.user.id;
		const userToReport = interaction.options.getUser('user');
		const reason = interaction.options.getString('reason');
		//@ts-ignore
		const guild = interaction.member!.guild;
		const selectedChannel = guild.channels.cache.get('1042602344606605332');
		await selectedChannel.send({
			embeds: [new DJS.EmbedBuilder().setTitle('Report').setDescription(`User <@${sender}> reported <@${userToReport?.id}> for ${reason}`)]
		});
		return await interaction.editReply('Reported');
	}
}
