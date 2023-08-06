import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import type { StringSelectMenuInteraction } from 'discord.js';
import * as DJS from 'discord.js';
import translations from '../../translations.json';
import backgrounds from '../../items/backgrounds';

@ApplyOptions<InteractionHandler.Options>({
    interactionHandlerType: InteractionHandlerTypes.SelectMenu
})
export class MenuHandler extends InteractionHandler {
    public override async run(interaction: StringSelectMenuInteraction) {
        const translation = translations[interaction.locale as keyof typeof translations] || translations['en-US'];
        await interaction.deferUpdate();
        const selection = interaction.values[0];
        const backgroundChoice = backgrounds.find((background) => background.name === selection);
        if (!backgroundChoice) {
            return await interaction.reply({
                ephemeral: true,
                content: `Background not found`
            });
        }

        const allItems = await this.container.utils.getAllItems();

        if (!allItems) {
            return await interaction.editReply({
                content: 'An unexpected error occurred'
            });
        }

        const item = allItems.find((item: any) => item.name === backgroundChoice.name)!;
        const actionRow = new DJS.ActionRowBuilder<DJS.ButtonBuilder>();

        const buyButton = new DJS.ButtonBuilder()
            .setCustomId(`buy-${item.name}`)
            .setLabel(translation.shop.purchase)
            .setStyle(DJS.ButtonStyle.Secondary);

        const returnButton = new DJS.ButtonBuilder()
            .setCustomId('shopBg-return')
            .setLabel(translation.global.return)
            .setStyle(DJS.ButtonStyle.Danger);
        actionRow.addComponents([buyButton, returnButton]);

        const bgEmbed = new DJS.EmbedBuilder().setTitle(item.name);

        if (item.image) {
            bgEmbed.setImage(item.image);
        }

        const response = await interaction.editReply({
            components: [actionRow],
            embeds: [bgEmbed]
        });

        const collector = response.createMessageComponentCollector({
            componentType: DJS.ComponentType.Button,
            time: 3_600_000
        });

        return collector.on('collect', async (purchaseInteraction) => {
            if (purchaseInteraction.customId === `buy-${item.name}`) {
                await purchaseInteraction.deferUpdate();
                const hasEnoughMoneyFor = await this.container.utils.hasEnoughMoneyFor(purchaseInteraction.user.id, item);
                if (hasEnoughMoneyFor?.result) {
                    const { user } = hasEnoughMoneyFor;
                    await this.container.utils.buyItem({
                        user,
                        userId: user.id,
                        amountToSubtract: item.price,
                        item: item.name
                    });

                    await interaction.editReply({
                        content: 'Item Purchased',
                        components: []
                    });

                } else {
                    await interaction.editReply({
                        content: 'Not enough money',

                        components: []
                    });
                }
            }
        });
    }

    public override parse(interaction: StringSelectMenuInteraction) {
        if (!interaction.customId.includes('bgSelect')) return this.none();

        return this.some();
    }
}
