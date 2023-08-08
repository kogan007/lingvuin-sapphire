import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import { type VoiceState, type GuildMember, } from 'discord.js';

const users = new Map();

// const hub = "1137371497258823690"

@ApplyOptions<Listener.Options>({})
export class UserEvent extends Listener {
	public constructor(context: Listener.Context, options: Listener.Options) {
		super(context, {
			...options,
			once: false,
			event: 'voiceStateUpdate'
		});
	}
	public override async run(oldState: VoiceState, newState: VoiceState) {
		const member = oldState.member || newState.member;
		if (!member) return;
		await calculateReward(newState, oldState, member, this.container.utils)
		// if (newState.channel && newState.channelId === hub) {
		// 	const position = newState.channel.position
		// 	const guild = newState.guild
		// 	const channel = await guild.channels.create({
		// 		type: ChannelType.GuildVoice,
		// 		name: `${member.displayName} Voice`,
		// 		position: position + 1,
		// 		parent: "1042602407844130928",
		// 		permissionOverwrites: [
		// 			{
		// 				id: member.id,
		// 				allow: ["Connect", "ViewChannel", "DeafenMembers"]
		// 			}
		// 		]
		// 	})
		// 	await member.voice.setChannel(channel.id)
		// 	const channelEmbed = new EmbedBuilder().setDescription(`Welcome to your voice channel`)
		// 	const actionRow = new ActionRowBuilder<ButtonBuilder>()
		// 	const increaseLimit = new ButtonBuilder().setCustomId("voice-limit").setLabel("Change Limit").setStyle(ButtonStyle.Primary)
		// 	actionRow.addComponents(increaseLimit)
		// 	await channel.send({
		// 		embeds: [channelEmbed],
		// 		components: [actionRow]
		// 	})
		// }

	}
}



async function calculateReward(newState: VoiceState, oldState: VoiceState, member: GuildMember, utils: any) {
	if (!newState.channel && oldState.channel) {
		// User left the voice channel
		const joinedTimestamp = users.get(member.user.id); // Get the saved timestamp of when the user joined the voice channel
		if (!joinedTimestamp) return; // In case the bot restarted and the user left the voice channel after the restart (the Map will reset after a restart)
		const totalTime = new Date().getTime() - joinedTimestamp; // The total time the user has been i the voice channel in ms

		const seconds = totalTime / 1000;
		const minutes = seconds / 60;
		const user = await utils.getUserById(member.user.id);

		if (minutes > 1) {
			const totalCoinsToGive = 5 * minutes;
			const balance = user!.money ?? 0;
			await utils.updateUserById(member.user.id, {
				money: balance + Math.round(totalCoinsToGive),
				timeInVoice: user.timeInVoice + totalTime
			});
		} else {
			await utils.updateUserById(member.user.id, {
				timeInVoice: user.timeInVoice + totalTime
			});
		}
		users.delete(member.user.id);
	} else if (!oldState.channel && newState.channel) {
		// User joined the voice channel
		users.set(member.user.id, new Date().getTime()); // Save the timestamp of when the user joined the voice channel
	}
}