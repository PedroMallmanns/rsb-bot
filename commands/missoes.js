const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js');

const {
    textoMissoes
} = require('../utils/missoes');

module.exports = async (message, db) => {
    const botoes = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('missoes_resgatar')
            .setLabel('Resgatar recompensas')
            .setEmoji('🎁')
            .setStyle(ButtonStyle.Success)
    );

    return message.reply({
        content: textoMissoes(db, message.author.id, message.author.username),
        components: [botoes]
    });
};