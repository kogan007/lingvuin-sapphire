import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import type { ButtonInteraction } from 'discord.js';
import * as DJS from 'discord.js';
import colors from '../../items/colors';

@ApplyOptions<InteractionHandler.Options>({
	interactionHandlerType: InteractionHandlerTypes.Button
})
export class ButtonHandler extends InteractionHandler {
	public async run(interaction: ButtonInteraction) {
		const goBack = interaction.customId.split('-').includes('return');
		const user = await this.container.utils.getUserById(interaction.user.id);
		const inventory = user?.inventory ?? [];
		const inventoryItems = await this.container.utils.getItemsByName(inventory);

		if (!inventoryItems) {
			return await interaction.reply({
				content: 'An unexpected error occurred'
			});
		}
		const filteredColors = colors.filter((color: any) => inventoryItems.filter((i) => i.name === color.name).length === 0);

		const select = new DJS.StringSelectMenuBuilder().setCustomId('colorSelect');
		const actions = new DJS.ActionRowBuilder<DJS.StringSelectMenuBuilder>();
		if (filteredColors.length > 0) {
			select.addOptions(filteredColors.map(({ name }) => new DJS.StringSelectMenuOptionBuilder().setLabel(name).setValue(name)));
			actions.addComponents(select);
		}

		const components = filteredColors.length > 0 ? [actions] : [];
		if (!goBack) {
			return await interaction.reply({
				content: 'Colors',
				components,
				ephemeral: true,
				embeds: []
			});
		} else {
			return await interaction.update({
				components,
				embeds: []
			});
		}
	}

	public override parse(interaction: ButtonInteraction) {
		if (!interaction.customId.includes('shopColors')) return this.none();

		return this.some();
	}
}
