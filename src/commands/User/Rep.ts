import { Command } from '@sapphire/framework';

export class RepCommand extends Command {
	public constructor(context: Command.Context, options: Command.Options) {
		super(context, {
			...options,
			description: 'Add reputation to a user'
		});
	}
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder //
				.setName(this.name)
				.setDescription(this.description)
				.addUserOption((opt) => opt.setName('user').setDescription('The user to add reputation to').setRequired(true))
		);
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		await interaction.deferReply();
		const sender = interaction.user.id;
		const receiver = interaction.options.getUser('user');

		if (!sender || !receiver) {
			return await interaction.editReply('An error occurred');
		}
		
		const apiReceiver = await this.container.utils.getUserById(receiver.id);
		if (apiReceiver.reputation && apiReceiver.reputation.includes(sender)) {
			return await interaction.editReply(`You have already given <@${receiver.id}> reputation`)
		}
		if (apiReceiver.reputation && receiver.id === sender) {
			return await interaction.editReply(`You cannot give reputation to yourself`)
		}
		await this.container.utils.updateUserById(apiReceiver.userId, {
			reputation: [...apiReceiver.reputation, sender]
		})

		return interaction.editReply(`You gave <@${receiver.id}> +1 reputation`);
	}
}
