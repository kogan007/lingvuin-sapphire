import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import type { GuildMember } from 'discord.js';

const rashistRole = '1063233240804098099';

@ApplyOptions<Listener.Options>({})
export class UserEvent extends Listener {
	public constructor(context: Listener.Context, options: Listener.Options) {
		super(context, {
			...options,
			once: false,
			event: 'guildMemberAdd'
		});
	}
	public override async run(member: GuildMember) {
		const apiMember = await this.container.utils.getUserById(member.id);
		if (apiMember?.isRashist) {
			await member.roles.set([rashistRole]);
		}
	}
}
