import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import type { StringSelectMenuInteraction } from 'discord.js';
import * as DJS from 'discord.js';
// import translations from '../../translations.json';
import colors from '../../items/colors';
import icons from '../../items/icons';

@ApplyOptions<InteractionHandler.Options>({
	interactionHandlerType: InteractionHandlerTypes.SelectMenu
})
export class MenuHandler extends InteractionHandler {
	public override async run(interaction: StringSelectMenuInteraction) {
		// const translation = translations[interaction.locale as keyof typeof translations] || translations['en-US'];
		const user = await this.container.utils.getUserById(interaction.user.id);
		const inventory = user?.inventory ?? [];
		const inventoryItems = await this.container.utils.getItemsByName(inventory);
		if (!inventoryItems) {
			return await interaction.reply({
				content: 'An unexpected error occurred'
			});
		}

		const selection = interaction.values[0];
		const item = inventoryItems.find((item: any) => item.name === selection)!;
		const member = interaction.member;
		const type = item.type;
		const rolesToRemove = type === 'icon' ? icons : colors;
		//@ts-ignore
		await member.roles.remove(rolesToRemove.map(({ role }) => role));
		//@ts-ignore
		await member.roles.add(item.role);

		const equippedRow = new DJS.ActionRowBuilder<DJS.ButtonBuilder>();

		const backButton = new DJS.ButtonBuilder().setCustomId('inventory-return').setLabel('Go back').setStyle(DJS.ButtonStyle.Danger);

		equippedRow.addComponents(backButton);
		return await interaction.update({
			content: 'Item equipped',
			components: [equippedRow],
			embeds: []
		});
	}

	public override parse(interaction: StringSelectMenuInteraction) {
		if (!interaction.customId.includes('equipItem')) return this.none();

		return this.some();
	}
}
