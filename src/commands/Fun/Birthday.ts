import { Command } from '@sapphire/framework';
import agenda from '../../utils/agenda';

export class UkraineCommand extends Command {
	public constructor(context: Command.Context, options: Command.Options) {
		super(context, {
			...options,
			name: 'birthday',
			description: 'Set your birthday'
		});
	}

	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder //
				.setName(this.name)
				.setDescription(this.description)
				.addIntegerOption((opt) => opt.setName('month').setDescription('The month you were born in').setRequired(true))
				.addIntegerOption((opt) => opt.setName('day').setDescription('The day you were born on').setRequired(true))
		);
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		await interaction.deferReply();
		const month = interaction.options.get('month');
		const day = interaction.options.get('day');

		if (!month || !Number.isInteger(month.value) || !day || !Number.isInteger(day.value)) {
			return await interaction.editReply('An error occurred');
		}

		if ((month.value as number) < 1 || (month.value as number) > 12) {
			return await interaction.editReply('Month must be greater than 0 and less than 13');
		}
		if ((day.value as number) < 1 || (day.value as number) > 31) {
			return await interaction.editReply('Day must be greater than 0 and less than 32');
		}

		const general = interaction.guild?.channels.cache.get('1042523322098913395');
		if (!general || !general.isTextBased()) {
			return await interaction.editReply('An error occurred');
		}
		agenda.define(`birthday-${interaction.user.id}`, async () => {
			await general.send(`Happy Birthday <@${interaction.user.id}>!`);
		});

		await this.container.utils.updateUserById(interaction.user.id, {
			birthday: `${month.value}-${day.value}`
		});
		await agenda.every(`* * ${day.value} ${month.value} *`, `birthday-${interaction.user.id}`);

		return await interaction.editReply({
			content: `<@${interaction.user.id}> your birthday has been successfully set`
		});
	}
}
