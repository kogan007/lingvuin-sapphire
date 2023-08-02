import { Command } from '@sapphire/framework';
import * as DJS from 'discord.js';


export class RashistCommand extends Command {
    public constructor(context: Command.Context, options: Command.Options) {
        super(context, {
            ...options,
            description: 'Sets active banner user'
        });
    }
    public override registerApplicationCommands(registry: Command.Registry) {
        registry.registerChatInputCommand((builder) =>
            builder //
                .setName(this.name)
                .setDescription(this.description)
                .setDefaultMemberPermissions(
                    DJS.PermissionFlagsBits.ManageGuild
                )
        );
    }

    public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
        await interaction.deferReply();
        const guild = await this.container.client.guilds.fetch('1042523320752537680');

        const mostMessages = this.container.recentlyTalked.reduce((prev, current) => (prev > current ? prev : current), 0);
        let mostActive = '';
        for (let [key, value] of this.container.recentlyTalked.entries()) {
            if (value === mostMessages) {
                mostActive = key;
            }
        }

        if (mostActive) {
            this.container.mostActive = mostActive
        }
        this.container.utils.makeBannerImage(guild).then((banner) => guild.setBanner(banner));
        this.container.recentlyTalked.clear();

        return await interaction.editReply({
            content: `Active banner user has been updated!`
        });
    }
}
