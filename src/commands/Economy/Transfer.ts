import { Command } from '@sapphire/framework';
import * as DJS from 'discord.js';

export class AddMoneyCommand extends Command {
	public constructor(context: Command.Context, options: Command.Options) {
		super(context, {
			...options,
			description: 'Transfer money to a user'
		});
	}
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder //
				.setName(this.name)
				.setDescription(this.description)
				.addUserOption((opt) => opt.setName('target').setDescription('The user to transfer money to').setRequired(true))
				.addIntegerOption((opt) => opt.setName('amount').setDescription('The amount to transfer').setRequired(true))
				.setDefaultMemberPermissions(DJS.PermissionFlagsBits.ManageGuild)
		);
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		await interaction.deferReply();
		const user = interaction.options.get('target');
		const amount = interaction.options.get('amount');
		if (!amount || !Number.isInteger(amount.value) || !user || !user.user) {
			return await interaction.reply('An error occurred');
		}

		const shopUser = await this.container.utils.getUserById(interaction.user.id);
		const targetUser = await this.container.utils.getUserById(user.user.id);
		if (shopUser!.money < (amount.value as number)) {
			return await interaction.editReply({
				content: "You don't have enough money"
			});
		}

		await this.container.utils.updateUserById(shopUser!.userId, {
			money: shopUser!.money - (amount.value as number)
		});
		await this.container.utils.updateUserById(targetUser!.userId, {
			money: targetUser!.money + (amount.value as number)
		});

		return await interaction.editReply(`
        <@${interaction.user.id}>, you transferred $${amount.value} to <@${user.user.id}>
    `);
	}
}
