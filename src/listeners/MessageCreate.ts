import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import { Collection, type Message } from 'discord.js';

const xpCooldown = new Collection<string, number>();

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
		const userMessages = this.container.recentlyTalked.get(message.author.id);
		if (userMessages) {
			this.container.recentlyTalked.set(message.author.id, userMessages + 1);
		} else {
			this.container.recentlyTalked.set(message.author.id, 1);
		}
		const user = await this.container.utils.getUserById(message.author.id);
		if (user) {
			const { levelUp, xpToAdd, cooldown } = calcUserXp(message, user.experience);
			await this.container.utils.updateUserById(message.author.id, {
				money: user.money + 1,
				messagesSent: user.messagesSent + 1,
				experience: cooldown ? user.experience : user.experience + xpToAdd
			});

			if (levelUp) {
				console.log(`${message.author} has leveled up!`);
			}
		}
	}
}

function calcUserXp(message: Message, currentXp: number) {
	const userCooldown = xpCooldown.get(message.author.id);
	const now = Date.now();
	let cooldown = false;
	if (userCooldown) {
		if (now - userCooldown < 1000 * 10) cooldown = true;
		else xpCooldown.set(message.author.id, now);
	} else {
		xpCooldown.set(message.author.id, now);
	}

	const currentLevel = Math.floor(0.15 * Math.sqrt(currentXp + 1));
	const xpToAdd = randomInt(5, 25);
	const nextLevel = Math.floor(0.15 * Math.sqrt(currentXp + xpToAdd + 1));
	const levelUp = nextLevel > currentLevel;

	return {
		levelUp,
		xpToAdd,
		cooldown
	};
}

const randomInt = (min: number, max: number) => min + Math.floor((max - min) * Math.random());
