import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import type { Message } from 'discord.js';

@ApplyOptions<Listener.Options>({})
export class UserEvent extends Listener {
	public constructor(context: Listener.Context, options: Listener.Options) {
		super(context, {
			...options,
			once: false,
			event: 'messageCreate'
		});
	}
	public override async run(message: Message) {
		const user = await this.container.utils.getUserById(message.author.id);
		if (user) {
			await this.container.utils.updateUserById(message.author.id, {
				money: user.money + 1,
				messagesSent: user.messagesSent + 1
			});
		}
	}
}
