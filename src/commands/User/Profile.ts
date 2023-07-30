import { Command } from '@sapphire/framework';
import { EmbedBuilder } from 'discord.js';
import canvacord from 'canvacord';

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
		const reputation = user.reputation || [];

		const level = Math.floor(0.15 * Math.sqrt(user.experience + 1));
		const rank = new canvacord.Rank()
			.setAvatar(userToView.avatarURL() ?? '')
			.setCurrentXP(user.experience ?? 0)
			.setRequiredXP(Math.floor((level / 0.15) * (level / 0.15)))
			.setProgressBar('#FFFFFF', 'COLOR')
			.setUsername(userToView.username);

		const image = await rank.build();

		return await interaction.editReply({
			files: [image]
		});
	}
}
