import { Command } from '@sapphire/framework';
import { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ComponentType } from 'discord.js';


export class SetBGCommand extends Command {
    public constructor(context: Command.Context, options: Command.Options) {
        super(context, {
            ...options,
            description: 'Set your active profile background'
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
        await interaction.deferReply({ ephemeral: true });
        const user = await this.container.utils.getUserById(interaction.user.id);
        const inventory = user?.inventory ?? [];
        const inventoryItems = await this.container.utils.getItemsByName(inventory);

        const backgrounds = inventoryItems.filter(item => item.type === "background")
        if (!backgrounds.length) {
            return interaction.editReply("You don't own any backgrounds")
        }

        const actionRow = new ActionRowBuilder<StringSelectMenuBuilder>()
        const backgroundSelect = new StringSelectMenuBuilder().setCustomId("setBG")
        backgroundSelect.addOptions(backgrounds.map(bg => new StringSelectMenuOptionBuilder().setLabel(bg.name).setValue(bg.name)))
        actionRow.addComponents(backgroundSelect)

        const response = await interaction.editReply({
            components: [actionRow]
        })

        const collector = response.createMessageComponentCollector({ componentType: ComponentType.StringSelect, filter: (interaction) => interaction.customId === "setBG", time: 3_600_600 })

        collector.on("collect", async (bgInteraction) => {
            await bgInteraction.deferUpdate()
            const selection = bgInteraction.values[0];
            const selected = backgrounds.find(bg => bg.name === selection)
            if (!selected) {
                await bgInteraction.editReply({ content: "An unknown error has occurred", components: [] })
            } else {
                await user.update({ activeBg: selected.name })
                await bgInteraction.editReply({ content: "Your background has been successfully updated", components: [] })
            }

        })
        return collector.on("end", async (_, reason) => {
            if (reason === "time") {
                backgroundSelect.setDisabled()

                await response.edit({ components: [actionRow] })
            }
        })

    }
}
