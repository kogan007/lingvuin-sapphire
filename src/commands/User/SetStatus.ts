import { Command } from '@sapphire/framework';


export class SetStatusCommand extends Command {
    public constructor(context: Command.Context, options: Command.Options) {
        super(context, {
            ...options,
            description: 'Set your server status'
        });
    }
    public override registerApplicationCommands(registry: Command.Registry) {
        registry.registerChatInputCommand((builder) =>
            builder //
                .setName(this.name)
                .setDescription(this.description)
                .addStringOption(opt => opt.setRequired(true).setDescription("The status you'd like").setName("status"))
        );
    }

    public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
        await interaction.deferReply({ ephemeral: true });
        const status = interaction.options.getString("status", true)
        await this.container.utils.updateUserById(interaction.user.id, {
            status
        })

        return await interaction.editReply(`Your status has been successfully updated`)
    }
}
