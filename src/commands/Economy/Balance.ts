import { Command } from '@sapphire/framework';

export class BalanceCommand extends Command {
	public constructor(context: Command.Context, options: Command.Options) {
		super(context, {
			...options,
			description: 'Check your balance of Lingvuin Coins'
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
		const shopUser = await this.container.utils.getUserById(interaction.user.id);

		return await interaction.editReply(`<@${shopUser!.userId}>'s balance:\n` + `Coins: **${shopUser?.money || 0}**.\n`);
	}
}
