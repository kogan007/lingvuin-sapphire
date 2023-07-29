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
				.addUserOption((opt) => opt.setName('user').setDescription('The whose profile you want to view').setRequired(false))
		);
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		await interaction.deferReply();
		const userToView = interaction.options.getUser('user') ?? interaction.user;
		const user = await this.container.utils.getUserById(userToView.id);
		const reputation = user.reputation || [];

		const embed = new EmbedBuilder().setImage(userToView.avatarURL()).setTitle(`${userToView.username}'s Profile`).addFields(
			{
				name: 'Balance',
				value: `$${user.money} Lingvuin Coins`
			}
		);

		if (reputation.length > 0) {
			embed.addFields({
				name: `Social Credits`,
				value: reputation.map((user) => `<@${user}>`).join('\n')
			})
		}

		return await interaction.editReply({
			embeds: [embed]
		});
	}
}
