import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import type { ButtonInteraction } from 'discord.js';
import * as DJS from 'discord.js';
import type { Util } from '../../utils/Util';

@ApplyOptions<InteractionHandler.Options>({
	interactionHandlerType: InteractionHandlerTypes.Button
})
export class ButtonHandler extends InteractionHandler {
	public async run(interaction: ButtonInteraction) {
		return await balanceFunction(interaction, this.container.utils);
	}

	public override parse(interaction: ButtonInteraction) {
		if (interaction.customId !== 'balance') return this.none();

		return this.some();
	}
}

const balanceFunction = async (interaction: DJS.ButtonInteraction<DJS.CacheType>, utils: Util) => {
	await interaction.deferReply({ ephemeral: true });

	let user = await utils.getUserById(interaction.user.id);
	if (!user) return await interaction.editReply({ content: 'An error occured' });

	return await interaction.editReply({
		content: `<@${user.userId}>'s balance:\n` + `Coins: **${user.money || 0}**.\n`
	});
};
