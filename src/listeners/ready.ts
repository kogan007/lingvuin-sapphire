import { ApplyOptions } from '@sapphire/decorators';
import { Listener, type Store } from '@sapphire/framework';
import { blue, gray, green, magenta, magentaBright, white, yellow } from 'colorette';
import agenda from '../utils/agenda';
// import { EmbedBuilder } from 'discord.js';
// import { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from '@discordjs/builders';

const dev = process.env.NODE_ENV !== 'production';

@ApplyOptions<Listener.Options>({ once: true })
export class UserEvent extends Listener {
	private readonly style = dev ? yellow : blue;

	public run() {
		this.printBanner();
		this.printStoreDebugInformation();
		this.main();
	}

	private async main() {
		await agenda.start();
		const guild = await this.container.client.guilds.fetch('1042523320752537680');
		this.container.utils.makeBannerImage(guild).then((banner) => guild.setBanner(banner));

		// const infoChannel = await guild.channels.cache.find(c => c.id === "1071770941673197679")
		// if (infoChannel?.isTextBased()) {
		// 	const embed = new EmbedBuilder().setImage("https://i.ibb.co/dGwyZhz/Banner-Not-Full-4.png")
		// 	const actionRow = new ActionRowBuilder<StringSelectMenuBuilder>()

		// 	const selectMenu = new StringSelectMenuBuilder().setCustomId("info").addOptions([
		// 		new StringSelectMenuOptionBuilder().setLabel("Information").setValue("info"),
		// 		new StringSelectMenuOptionBuilder().setLabel("Rules").setValue("rules")
		// 	])

		// 	actionRow.addComponents(selectMenu)
		// 	await infoChannel.send({ embeds: [embed], components: [actionRow] })
		// }
		setInterval(() => {
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
			this.container.recentlyTalked.clear();
			return;
		}, 7_200_000);
		setInterval(async () => {
			const guild = await this.container.client.guilds.fetch('1042523320752537680');
			this.container.utils.makeBannerImage(guild).then((banner) => guild.setBanner(banner));
		}, 60_000);
	}
	private printBanner() {
		const success = green('+');

		const llc = dev ? magentaBright : white;
		const blc = dev ? magenta : blue;

		const line01 = llc('');
		const line02 = llc('');
		const line03 = llc('');

		// Offset Pad
		const pad = ' '.repeat(7);

		console.log(
			String.raw`
${line01} ${pad}${blc('1.0.0')}
${line02} ${pad}[${success}] Gateway
${line03}${dev ? ` ${pad}${blc('<')}${llc('/')}${blc('>')} ${llc('DEVELOPMENT MODE')}` : ''}
		`.trim()
		);
	}

	private printStoreDebugInformation() {
		const { client, logger } = this.container;
		const stores = [...client.stores.values()];
		const last = stores.pop()!;

		for (const store of stores) logger.info(this.styleStore(store, false));
		logger.info(this.styleStore(last, true));
	}

	private styleStore(store: Store<any>, last: boolean) {
		return gray(`${last ? '└─' : '├─'} Loaded ${this.style(store.size.toString().padEnd(3, ' '))} ${store.name}.`);
	}
}

