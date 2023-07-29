import { Command } from '@sapphire/framework';
import { EmbedBuilder } from 'discord.js';

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
		);
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		await interaction.deferReply();

		const user = await this.container.utils.getUserById(interaction.user.id);
		const reputation = user.reputation || [];

		const embed = new EmbedBuilder().addFields({
			name: `Reputation`,
			value: reputation.map((user) => `<@${user}>`).join('')
		});

		return await interaction.editReply({
			embeds: [embed]
		});
	}
}
