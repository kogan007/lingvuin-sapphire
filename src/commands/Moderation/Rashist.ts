import { Command } from '@sapphire/framework';
import * as DJS from 'discord.js';

const rashistRole = '1063233240804098099';

export class RashistCommand extends Command {
	public constructor(context: Command.Context, options: Command.Options) {
		super(context, {
			...options,
			description: 'Gives a user rashist'
		});
	}
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder //
				.setName(this.name)
				.setDescription(this.description)
				.addUserOption((opt) => opt.setName('target').setDescription('The user to set as rashist').setRequired(true))
				.setDefaultMemberPermissions(
					DJS.PermissionFlagsBits.ManageGuild |
					DJS.PermissionFlagsBits.BanMembers |
					DJS.PermissionFlagsBits.KickMembers
				)
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

		const member = user.member;
		//@ts-ignore
		await member.roles.set([rashistRole]);
		await this.container.utils.updateUserById(user.user.id, {
			isRashist: true
		});

		return await interaction.editReply({
			content: `<@${user.user.id}> був відправлений у ГУЛАГ!`
		});
	}
}
