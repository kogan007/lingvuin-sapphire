import { Command } from '@sapphire/framework';
import * as DJS from 'discord.js';


export class DivorceCommand extends Command {
    public constructor(context: Command.Context, options: Command.Options) {
        super(context, {
            ...options,
            description: 'Allows you to divorce a user'
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
        // const translation =
        //   translations[interaction.locale] || translations["en-US"];
        const user = await this.container.utils.getUserById(interaction.user.id)
        if (!user.partner) {
            return await interaction.reply("You can't get divorced if you're not married")
        }

        const actionRow = new DJS.ActionRowBuilder<DJS.ButtonBuilder>()

        const acceptButton = new DJS.ButtonBuilder().setCustomId("divorce-accept").setLabel("Divorce").setStyle(DJS.ButtonStyle.Success)
        const denyButton = new DJS.ButtonBuilder().setCustomId("divorce-deny").setLabel("Cancel").setStyle(DJS.ButtonStyle.Danger)

        actionRow.addComponents(acceptButton, denyButton)

        const response = await interaction.reply({
            ephemeral: true,
            components: [actionRow],
            content: `${interaction.user}, are you sure you want to divorce <@${user.partner}>?`,
            allowedMentions: {
                parse: ["users"]
            }
        })

        const collector = await response.createMessageComponentCollector({
            componentType: DJS.ComponentType.Button,
            time: 1000 * 60 * 60,
            filter: (interaction) => interaction.customId.split("-").includes("divorce")
        })

        collector.on("collect", async (divorceInteraction) => {

            const [_, answer] = divorceInteraction.customId.split("-")
            acceptButton.setDisabled(true)
            denyButton.setDisabled(true)
            await response.edit({ components: [actionRow] })
            if (answer === "accept") {
                await this.container.utils.updateUserById(interaction.user.id, {
                    partner: user.partner
                })
                await this.container.utils.updateUserById(user.partner, {
                    partner: interaction.user.id
                })
                await divorceInteraction.reply(`<@${user.partner}>, ${interaction.user} has divorced you.`)
            } else {
                await divorceInteraction.reply({ ephemeral: true, content: `The request for divorce has been cancelled` })
            }

        })
        return collector.on("end", async (_, reason) => {
            if (reason === "time") {
                await response.edit({ components: [] })
            }
        })
    }
}
