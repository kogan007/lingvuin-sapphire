import { Command } from '@sapphire/framework';
import * as DJS from 'discord.js';


export class RashistCommand extends Command {
    public constructor(context: Command.Context, options: Command.Options) {
        super(context, {
            ...options,
            description: 'Allows you to marry a user'
        });
    }
    public override registerApplicationCommands(registry: Command.Registry) {
        registry.registerChatInputCommand((builder) =>
            builder //
                .setName(this.name)
                .setDescription(this.description)
                .addUserOption((opt) => opt.setName('target').setDescription('The user you want to marry').setRequired(true))

        );
    }

    public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
        await interaction.deferReply();
        // const translation =
        //   translations[interaction.locale] || translations["en-US"];
        const user = interaction.options.get('target');

        if (!user || !user.user || !user.member) {
            return await interaction.reply('An error occurred');
        }


        const actionRow = new DJS.ActionRowBuilder<DJS.ButtonBuilder>()

        const acceptButton = new DJS.ButtonBuilder().setCustomId("marriage-accept").setLabel("Accept?").setStyle(DJS.ButtonStyle.Success)
        const denyButton = new DJS.ButtonBuilder().setCustomId("marriage-deny").setLabel("Deny?").setStyle(DJS.ButtonStyle.Danger)

        actionRow.addComponents(acceptButton, denyButton)

        const response = await interaction.editReply({
            components: [actionRow],
            content: `${user.user}, do you accept ${interaction.user} as your partner in marriage?`
        })

        const collector = await response.createMessageComponentCollector({
            componentType: DJS.ComponentType.Button,
            time: 1000 * 60 * 60,
            filter: (interaction) => interaction.customId.split("-").includes("marriage")
        })

        collector.on("collect", async (marriageInteraction) => {
            if (marriageInteraction.user.id !== user.user!.id) {
                await marriageInteraction.reply(`You are not the person that was asked to be married!`)
            } else {
                const [_, response] = marriageInteraction.customId.split("-")
                if (response === "accept") {
                    await marriageInteraction.reply(`${interaction.user} and ${marriageInteraction.user} are now happily married`)
                } else {
                    await marriageInteraction.reply(`Sorry, ${interaction.user}, ${marriageInteraction} doesn't want to marry you`)
                }
            }
        })
        collector.on("end", (_, reason) => {
            if (reason === "time") {
                await response.edit({ components: [] })
            }
        })
    }
}
