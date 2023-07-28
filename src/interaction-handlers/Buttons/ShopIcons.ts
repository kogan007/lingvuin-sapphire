import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import type { ButtonInteraction } from 'discord.js';
import * as DJS from 'discord.js';
import translations from '../../translations.json';
import icons from '../../items/icons';

@ApplyOptions<InteractionHandler.Options>({
	interactionHandlerType: InteractionHandlerTypes.Button
})
export class ButtonHandler extends InteractionHandler {
	public async run(interaction: ButtonInteraction) {
		const goBack = interaction.customId.split('-').includes('return');
		const translation = translations[interaction.locale as keyof typeof translations] || translations['en-US'];
		const user = await this.container.utils.getUserById(interaction.user.id);
		const inventory = user?.inventory ?? [];
		const inventoryItems = await this.container.utils.getItemsByName(inventory);

		if (!inventoryItems) {
			return await interaction.reply({
				content: 'An unexpected error occurred'
			});
		}
		const filteredIcons = icons.filter((color) => inventoryItems.filter((i: any) => i.name === color.name).length === 0);

		const select = new DJS.StringSelectMenuBuilder().setCustomId('iconSelect');
		const actions = new DJS.ActionRowBuilder<DJS.StringSelectMenuBuilder>();
		if (filteredIcons.length > 0) {
			select.addOptions(filteredIcons.map(({ name }) => new DJS.StringSelectMenuOptionBuilder().setLabel(name).setValue(name)));
			actions.addComponents(select);
		}

		const components = filteredIcons.length > 0 ? [actions] : [];

		if (!goBack) {
			return await interaction.reply({
				components: components,
				ephemeral: true,
				embeds: [
					new DJS.EmbedBuilder()
						.setTitle(translation.icons.title)
						.setDescription(`Icons\n` + filteredIcons.map(({ name }) => `- ${name}`).join('\n'))
				]
			});
		} else {
			return await interaction.update({
				components: components,
				embeds: [
					new DJS.EmbedBuilder().setTitle(translation.icons.title).setDescription(filteredIcons.map(({ name }) => `- ${name}`).join('\n'))
				]
			});
		}
	}

	public override parse(interaction: ButtonInteraction) {
		if (!interaction.customId.includes('shopIcons')) return this.none();

		return this.some();
	}
}
