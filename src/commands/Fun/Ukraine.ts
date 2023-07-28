import { Command } from '@sapphire/framework';
import * as DJS from 'discord.js';

export class UkraineCommand extends Command {
	public constructor(context: Command.Context, options: Command.Options) {
		super(context, {
			...options,
			name: 'ukraine',
			description: 'На Украине'
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
		if (
			//@ts-ignore
			!interaction.member.roles.cache.has('1129114509823455343') &&
			//@ts-ignore
			!interaction.member?.permissions.has(DJS.PermissionFlagsBits.ManageGuild)
		) {
			return await interaction.editReply({
				content: 'You do not have permission to use this command'
			});
		}

		return await interaction.editReply({
			allowedMentions: {
				roles: ['1129114509823455343'],
				repliedUser: true
			},
			content: `<@&1129114509823455343>`,
			embeds: [
				new DJS.EmbedBuilder()
					.setImage(
						'https://media.tenor.com/HVap2Xe0gXsAAAAd/%D0%B4%D0%B0%D1%83%D0%BD%D1%8B-%D0%BE%D0%B1%D1%89%D0%B8%D0%B9%D1%81%D0%B1%D0%BE%D1%80.gif'
					)
					.setDescription(`# ДАУНЫ ОБЩИЙ СБОР`)
			]
		});
	}
}
