import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import type { StringSelectMenuInteraction } from 'discord.js';
import * as DJS from 'discord.js';

@ApplyOptions<InteractionHandler.Options>({
    interactionHandlerType: InteractionHandlerTypes.SelectMenu
})
export class MenuHandler extends InteractionHandler {
    public override async run(interaction: StringSelectMenuInteraction) {
        await interaction.message.edit({
            content: ''
        });
        const selection = interaction.values[0];
        const embed = new DJS.EmbedBuilder().setImage("https://cdn-longterm.mee6.xyz/plugins/embeds/images/1042523320752537680/7196b790a33dadbbfe891048b33214c4c5e668428fc60457f3aa12648ad9f049.gif")
        if (selection === "info") {
            embed.setTitle("**Information/Информация/Інформація**").setDescription(
                `Приветствуем всех на **Лингвине**, сервер на котором вы можете\n` +
                `найти откровенно принимающее и поддерживающее\n` +
                `комьюнити. Мы рады помогать всем во всем и вся касательно\n` +
                `изучения языков, а также тут можно встретить новых и\n` +
                `интересных собеседников, насладиться приятным общением с\n` +
                `любителями видеоигр, программирования, искусства и ещё\n` +
                `кучи всего.\n\n` +

                `Вітаю усіх на **Лінгвіні**, сервер на якому ви можете знайти\n` +
                `ком'юниті, яке відверто приймає і підтримає всіх. Ми раді\n` +
                `допомогати всіх у всьому і вся стосовно вивчення мов, а також\n` +
                `тут можна зустріти нових і цікавих співрозмовників,\n` +
                `насолодитися приємним спілкуванням з любителями відеоігор,\n` +
                `програмування, мистецтва і ще купи всього.\n\n` +

                `Welcome everyone to **Lingvuin**, a server on which you can find a\n` +
                `community that is genuinely accepting and supporting. We are\n` +
                `happy to help everyone with everything relating to the study of\n` +
                `languages, and you can also meet new and interesting people, enjoy\n` +
                `conversations with lovers of videogames, programming, art, and\n` +
                `lots more.\n\n` +
                `**Leave us a review/Оставьте нам отзыв/Залиште нам відгук**\n` +
                `[disboard.gg](https://disboard.org/ru/server/1042523320752537680)\n` +
                `[myserver.gg](https://myserver.gg/1042523320752537680)`

            )
            await interaction.reply({ ephemeral: true, embeds: [embed] })
        }
        if (selection === "rules") {
            embed.setTitle("**Rules/Правила**").setDescription(
                `**● 1. Spam**\n` +
                `Никакого спама — реклама других серверов запрещена,\n` +
                `излишний флуд, капс, и прочее.\n` +
                `Жодного спаму - реклама інших серверів заборонена, зайвий\n` +
                `флуд, капс, та інше.\n` +
                `No spam - advertising other servers is not allowed, surplus flood,\n` +
                `caps, etc.\n\n` +
                `**● 2. Adequacy**\n` +
                `Будь адекватным - главное правило, что по сути включает всё.\n` +
                `Нельзя нарушать элементарные нормы общения.\n` +
                `Будь адекватним. Це основне правило, яке стосується майже\n` +
                `всього. Не можна порушувати елементарні норми спілкування.\n` +
                `Be adequate. This is the main rule that covers pretty much\n` +
                `everything. Meet the expectations of normal conversation.\n\n` +
                `**● 3. Respect**\n` +
                `Препятствие нормальному общению, оскорбления.\n` +
                `Перешкоджання нормальному спілкуванню, образи.\n` +
                `Obstruction of normal communication, insults.\n\n` +
                `**● 4. Conflicts**\n` +
                `Разжигание конфликтов (религиозных, национальных, расовых,\n` +
                `межличностных)\n` +
                `Розпалювання конфліктів (релігійних, національних, расових,\n` +
                `міжособистісних)\n` +
                `Inciting conflicts (religious, national, racial, interpersonal)\n\n` +
                `**● 5 Doxxing**\n` +
                `Распространение чужой личной информации без согласия.\n` +
                `Поширення чужої особистої інформації без згоди.\n` +
                `Dissemination of other people's personal information without\n` +
                `consent\n\n` +
                `**● 6. NSFW**\n` +
                `Запрещена жестокость, расчленёнка, фото трупов.\n` +
                `Заборонено жорстоке поводження, розчленування, фото трупів.\n` +
                `Cruelty, dismemberment, photos of corpses are forbidden.\n\n` +
                `**● 7. Nicknames**\n` +
                `Nicknames must be appropriate and not break the above rules.\n` +
                `Никнеймы должны быть адекватными и не нарушать\n` +
                `вышеупомянутые правила.\n` +
                `Нікнейми повині бути адекватними та не порушати вищезгадані\n` +
                `правила\n\n` +
                `**● Примечания/Примітки/Notices**\n` +
                `Повторное нарушение правил карается строже.\n` +
                `Повторне порушення правил карається суворіше.\n` +
                `Repeat violation of the rules is punished harsher\n`
            )
            await interaction.reply({ ephemeral: true, embeds: [embed] })
        }



    }

    public override parse(interaction: StringSelectMenuInteraction) {
        if (!interaction.customId.includes('info')) return this.none();

        return this.some();
    }
}
