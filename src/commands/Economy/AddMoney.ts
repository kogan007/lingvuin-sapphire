import { Command } from '@sapphire/framework';
import * as DJS from 'discord.js';

export class AddMoneyCommand extends Command {
	public constructor(context: Command.Context, options: Command.Options) {
		super(context, {
			...options,
			description: 'Adds money to a user'
		});
	}
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder //
				.setName(this.name)
				.setDescription(this.description)
				.addUserOption((opt) => opt.setName('target').setDescription('The user to add money to').setRequired(true))
				.addIntegerOption((opt) => opt.setName('amount').setDescription('The amount to add').setRequired(true))
				.setDefaultMemberPermissions(DJS.PermissionFlagsBits.ManageGuild)
		);
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const user = interaction.options.get('target');
		const amount = interaction.options.get('amount');
		if (!amount || !Number.isInteger(amount.value) || !user || !user.user) {
			return await interaction.reply('An error occurred');
		}

		const shopUser = await this.container.utils.getUserById(user.user.id);

		await this.container.utils.updateUserById(user.user.id, {
			money: shopUser!.money + (amount.value as number)
		});

		return await interaction.reply(`${amount.value} added to <@${user.user.id}>`);
	}
}
