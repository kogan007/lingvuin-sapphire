import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import type { ButtonInteraction } from 'discord.js';
import * as DJS from 'discord.js';
import { pagination, ButtonTypes, ButtonStyles } from '../../utils/pagination';

@ApplyOptions<InteractionHandler.Options>({
	interactionHandlerType: InteractionHandlerTypes.Button
})
export class ButtonHandler extends InteractionHandler {
	public async run(interaction: ButtonInteraction) {
		const goBack = interaction.customId.split('-').includes('return');
		const user = await this.container.utils.getUserById(interaction.user.id);
		const inventory = user?.inventory ?? [];
		const inventoryItems = await this.container.utils.getItemsByName(inventory)!;
		const pages = Math.round(inventory.length / 10);

		let actionRows: any = [];
		if (pages > 1) {
			let inventoryEmbeds: any[] = [];
			for (let x of [...Array(pages).keys()]) {
				const inventoryEmbed = createInventory(inventoryItems, x + 1);
				inventoryEmbeds.push(inventoryEmbed);
				const actionRow = createActionRow(inventory, inventoryItems, x + 1);
				actionRows.push(actionRow);
			}

			return await pagination({
				embeds: inventoryEmbeds as unknown as DJS.Embed[],
				interaction: interaction,
				author: interaction.user,
				actionRows,
				goBack,
				buttons: [
					{
						type: ButtonTypes.previous,
						label: `Previous`,
						style: ButtonStyles.Primary
					},
					{
						type: ButtonTypes.next,
						label: `Next`,
						style: ButtonStyles.Success
					}
				]
			});
		}

		const inventoryEmbed = new DJS.EmbedBuilder();
		if (inventory.length > 0) {
			inventoryEmbed.addFields(
				inventoryItems!.map((item) => ({
					name: item.name,
					value: item.name
				}))
			);
		} else {
			inventoryEmbed.setDescription('No items in inventory');
			return await interaction.reply({
				embeds: [inventoryEmbed]
			});
		}

		const actionRow = new DJS.ActionRowBuilder<DJS.StringSelectMenuBuilder>();
		const select = new DJS.StringSelectMenuBuilder().setCustomId('equipItem').addOptions(
			[...inventory].slice(0, 10).map((item) => {
				const itemRelation = inventoryItems!.find((i) => i.name === item)!;
				return new DJS.StringSelectMenuOptionBuilder().setLabel(`Equip ` + itemRelation.name).setValue(itemRelation.name);
			})
		);

		actionRow.addComponents([select]);

		return await interaction.reply({
			embeds: [inventoryEmbed],
			components: [actionRow]
		});
	}

	public override parse(interaction: ButtonInteraction) {
		if (!interaction.customId.includes('inventory')) return this.none();

		return this.some();
	}
}

const createActionRow = (inventory: any, inventoryItems: any, page: any) => {
	const subset = 10;
	const actionRow = new DJS.ActionRowBuilder<DJS.StringSelectMenuBuilder>();
	actionRow.addComponents(
		new DJS.StringSelectMenuBuilder().setCustomId('equipItem').addOptions(
			[...inventory].slice((page - 1) * subset, page * subset).map((item) => {
				const itemRelation = inventoryItems!.find((i: any) => i.name === item)!;
				return new DJS.StringSelectMenuOptionBuilder().setLabel(`Equip ` + itemRelation.name).setValue(itemRelation.name);
			})
		)
	);
	return actionRow;
};
const createInventory = (inventory: any, page: any) => {
	const subset = 10;
	const inventoryValues = inventory.slice((page - 1) * subset, page * subset);
	const inventoryEmbed = new DJS.EmbedBuilder()
		.setTitle('**Inventory**')
		.setThumbnail('https://cdn.discordapp.com/attachments/625125553329930240/1131035190999928862/treasure_1.png');

	inventoryEmbed.addFields(
		inventoryValues.map((item: any) => ({
			name: item.name,
			value: item.name
		}))
	);

	return inventoryEmbed;
};
