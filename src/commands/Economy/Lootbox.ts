import { Command } from '@sapphire/framework';
import translations from '../../translations.json';
import * as DJS from 'discord.js';

export class DailyCommand extends Command {
	public constructor(context: Command.Context, options: Command.Options) {
		super(context, {
			...options,
			description: 'Create a lootbox'
		});
	}

	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder //
				.setName(this.name)
				.setDescription(this.description)
				.addIntegerOption((opt) => opt.setName('min').setRequired(true).setDescription('The min value of the lootbox'))
				.addIntegerOption((opt) => opt.setName('max').setRequired(true).setDescription('The max value of the lootbox'))
				.setDefaultMemberPermissions(
					DJS.PermissionFlagsBits.ManageGuild |
					DJS.PermissionFlagsBits.BanMembers |
					DJS.PermissionFlagsBits.KickMembers
				)
		);
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		await interaction.deferReply();
		const min = interaction.options.get('min')!.value as number;
		const max = interaction.options.get('max')!.value as number;

		if (min > max) {
			return await interaction.editReply('The min is greater than the max. Try again.');
		}

		const actionRow = new DJS.ActionRowBuilder<DJS.ButtonBuilder>();

		const lootButton = new DJS.ButtonBuilder().setCustomId('lootbox').setLabel('Claim Lootbox').setStyle(DJS.ButtonStyle.Success);

		actionRow.addComponents(lootButton);
		const response = await interaction.editReply({
			components: [actionRow]
		});

		return response
			.awaitMessageComponent({
				componentType: DJS.ComponentType.Button,
				time: 3_600_000
			})
			.then(async (lootboxInteraction) => {
				if (lootboxInteraction.customId === 'lootbox') {
					const translation = translations[lootboxInteraction.locale as keyof typeof translations] || translations['en-US'];
					const lootAmount = Math.round(Math.random() * (max - min) + min);
					const updatedActionRow = new DJS.ActionRowBuilder<DJS.ButtonBuilder>();
					lootButton.setDisabled(true);
					lootButton.setLabel('Lootbox Claimed');
					updatedActionRow.addComponents(lootButton);

					const user = await this.container.utils.getUserById(lootboxInteraction.user.id);

					this.container.utils.updateUserById(user!.userId, {
						money: (user!.money ?? 0) + lootAmount
					});
					return await lootboxInteraction.update({
						content: translation.global.lootboxReward
							.replace('{{user}}', `<@${lootboxInteraction.user.id}>`)
							.replace('{{amount}}', String(lootAmount)),
						components: [updatedActionRow]
					});
				} else {
					return null;
				}
			});
	}
}
