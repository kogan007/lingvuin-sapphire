import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import type { ButtonInteraction } from 'discord.js';
import * as DJS from 'discord.js';
import backgrounds from '../../items/backgrounds';

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
        const filteredBackgrounds = backgrounds.filter((background: any) => inventoryItems.filter((i: any) => i.name === background.name).length === 0);

        const select = new DJS.StringSelectMenuBuilder().setCustomId('bgSelect');
        const actions = new DJS.ActionRowBuilder<DJS.StringSelectMenuBuilder>();
        if (filteredBackgrounds.length > 0) {
            select.addOptions(filteredBackgrounds.map(({ name }) => new DJS.StringSelectMenuOptionBuilder().setLabel(name).setValue(name)));
            actions.addComponents(select);
        }

        const components = filteredBackgrounds.length > 0 ? [actions] : [];
        if (!goBack) {
            return await interaction.reply({
                content: 'Backgrounds',
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
        if (!interaction.customId.includes('shopBg')) return this.none();

        return this.some();
    }
}
