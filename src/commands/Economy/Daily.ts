import { Command } from '@sapphire/framework';
import translations from '../../translations.json';
import ms from '../../utils/ms';

export class DailyCommand extends Command {
	public constructor(context: Command.Context, options: Command.Options) {
		super(context, {
			...options,
			description: 'Type this command daily to get rewarded'
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
		await interaction.deferReply();

		const translation: { [key: string]: Record<string, any> } =
			translations[interaction.locale as keyof typeof translations] || translations['en-US'];

		const user = await this.container.utils.getUserById(interaction.user.id)!;
		const userCooldown = user?.dailyCooldown ?? 0;
		const cooldown = 60000 * 60 * 24;
		const cooldownEndTimestamp = cooldown - (Date.now() - userCooldown);
		if (userCooldown !== null && cooldownEndTimestamp > 0) {
			const pretty = ms(cooldownEndTimestamp, { long: true }, interaction.locale);
			return await interaction.editReply(
				translation.daily.cooldown.replace('{{user}}', `<@${interaction.user.id}>`).replace('{{cooldown}}', pretty)
			);
		}

		const reward = 100;

		await this.container.utils.updateUserById(interaction.user.id, {
			money: user!.money + reward,
			dailyCooldown: Date.now()
		});

		return await interaction.editReply(translation.daily.claimed.replace('{{user}}', `<@${interaction.user.id}>`).replace('{{amount}}', reward));
	}
}
