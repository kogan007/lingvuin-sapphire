import { Command } from '@sapphire/framework';
import * as DJS from 'discord.js';
import translations from '../../translations.json';

export class ShopCommand extends Command {
	public constructor(context: Command.Context, options: Command.Options) {
		super(context, {
			...options,
			description: 'Opens the Lingvuin shop'
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
		const translation = translations[interaction.locale as keyof typeof translations] || translations['en-US'];
		const topRow = new DJS.ActionRowBuilder<DJS.ButtonBuilder>();
		const bottomRow = new DJS.ActionRowBuilder<DJS.ButtonBuilder>();
		const balanceButton = new DJS.ButtonBuilder()
			.setCustomId('balance')
			.setLabel(translation.shop.balance)
			.setStyle(DJS.ButtonStyle.Secondary)
			.setEmoji('1130150722160304260');
		const iconsButton = new DJS.ButtonBuilder()
			.setCustomId('shopIcons')
			.setLabel(translation.shop.icons)
			.setStyle(DJS.ButtonStyle.Secondary)
			.setEmoji('1130151561729953853');

		const colorsButton = new DJS.ButtonBuilder()
			.setCustomId('shopColors')
			.setLabel(translation.shop.colors)
			.setStyle(DJS.ButtonStyle.Secondary)
			.setEmoji(`1130147955349930106`);

		const coinsButton = new DJS.ButtonBuilder()
			.setCustomId('buyCoins')
			.setLabel(translation.shop.coins)
			.setStyle(DJS.ButtonStyle.Secondary)
			.setEmoji('1129861811638894743');

		topRow.addComponents([balanceButton, iconsButton]);
		bottomRow.addComponents([colorsButton, coinsButton]);

		const image: { [key: string]: string } = {
			ru: 'https://i.ibb.co/tbMZDvp/shop-ru.png',
			'en-US': 'https://i.ibb.co/5xhfj8w/shop-en.png',
			uk: 'https://i.ibb.co/kmG2txH/shop-uk.png'
		};
		return await interaction.reply({
			components: [topRow, bottomRow],
			embeds: [
				new DJS.EmbedBuilder().setImage(image[interaction.locale] ?? image['en-US'])

				// .setImage(
				//   "https://media.discordapp.net/attachments/625125553329930240/1130238851458273402/Untitled-4.png?width=1395&height=276"
				// ),
			]
		});
	}
}
