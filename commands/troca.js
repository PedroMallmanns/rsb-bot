const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js');

const jogadores =
    require('../data/jogadores');

const {
    salvarDB
} = require('../utils/database');

const trocasAbertas =
    new Map();

function encontrarJogador(nome) {
    const texto =
        nome
            .trim()
            .toLowerCase();

    return jogadores.find(jogador =>
        jogador.nome.toLowerCase() === texto ||
        jogador.id.toLowerCase() === texto
    );
}

function pegarRepetidas(db, userId) {
    if (!db.repetidas) {
        db.repetidas = {};
    }

    if (!db.repetidas[userId]) {
        db.repetidas[userId] = {};
    }

    return db.repetidas[userId];
}

function pegarAlbum(db, userId) {
    if (!db.albuns) {
        db.albuns = {};
    }

    if (!db.albuns[userId]) {
        db.albuns[userId] = [];
    }

    return db.albuns[userId];
}

function temRepetida(db, userId, jogadorId) {
    const reps =
        pegarRepetidas(db, userId);

    return reps[jogadorId] && reps[jogadorId] > 0;
}

function removerRepetida(db, userId, jogadorId) {
    const reps =
        pegarRepetidas(db, userId);

    if (!reps[jogadorId] || reps[jogadorId] <= 0) {
        return false;
    }

    reps[jogadorId] -= 1;

    if (reps[jogadorId] <= 0) {
        delete reps[jogadorId];
    }

    salvarDB(db);

    return true;
}

function colarFigurinha(db, userId, jogador) {
    const album =
        pegarAlbum(db, userId);

    const repetidas =
        pegarRepetidas(db, userId);

    const jaTem =
        album.includes(jogador.id) ||
        album.includes(jogador.nome);

    if (jaTem) {
        repetidas[jogador.id] =
            (repetidas[jogador.id] || 0) + 1;

        salvarDB(db);

        return 'repetida';
    }

    album.push(jogador.id);

    salvarDB(db);

    return 'nova';
}

module.exports = async (message, db) => {
    try {
        const usuarioAlvo =
            message.mentions.users.first();

        if (!usuarioAlvo) {
            return message.reply(
                'Use assim:\n\n' +
                '`!trocar @usuario minha figurinha | figurinha desejada`'
            );
        }

        if (usuarioAlvo.id === message.author.id) {
            return message.reply(
                '❌ Você não pode trocar consigo mesmo.'
            );
        }

        const textoSemComando =
            message.content
                .replace(/^!trocar/i, '')
                .replace(/<@!?\d+>/, '')
                .trim();

        const partes =
            textoSemComando.split('|');

        if (partes.length < 2) {
            return message.reply(
                '❌ Use o símbolo `|` para separar as figurinhas.'
            );
        }

        const nomeOferecido =
            partes[0].trim();

        const nomeDesejado =
            partes[1].trim();

        const jogadorOferecido =
            encontrarJogador(nomeOferecido);

        const jogadorDesejado =
            encontrarJogador(nomeDesejado);

        if (!jogadorOferecido) {
            return message.reply(
                `❌ Não encontrei a figurinha: **${nomeOferecido}**`
            );
        }

        if (!jogadorDesejado) {
            return message.reply(
                `❌ Não encontrei a figurinha: **${nomeDesejado}**`
            );
        }

        if (!temRepetida(db, message.author.id, jogadorOferecido.id)) {
            return message.reply(
                `❌ Você não possui **${jogadorOferecido.nome}** repetida.`
            );
        }

        if (!temRepetida(db, usuarioAlvo.id, jogadorDesejado.id)) {
            return message.reply(
                `❌ ${usuarioAlvo.username} não possui **${jogadorDesejado.nome}** repetida.`
            );
        }

        const tradeId =
            `${Date.now()}-${Math.floor(Math.random() * 999999)}`;

        trocasAbertas.set(tradeId, {
            autorId: message.author.id,
            autorNome: message.author.username,
            alvoId: usuarioAlvo.id,
            alvoNome: usuarioAlvo.username,
            ofereceId: jogadorOferecido.id,
            querId: jogadorDesejado.id
        });

        const botoes =
            new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`troca_aceitar_${tradeId}`)
                        .setLabel('Aceitar')
                        .setEmoji('✅')
                        .setStyle(ButtonStyle.Success),

                    new ButtonBuilder()
                        .setCustomId(`troca_recusar_${tradeId}`)
                        .setLabel('Recusar')
                        .setEmoji('❌')
                        .setStyle(ButtonStyle.Danger)
                );

        return message.reply({
            content:
                `🔁 **PROPOSTA DE TROCA**\n\n` +
                `👤 ${message.author.username} oferece: **${jogadorOferecido.nome}**\n` +
                `🎯 Quer receber: **${jogadorDesejado.nome}**\n\n` +
                `${usuarioAlvo}, você aceita?`,
            components: [botoes]
        });

    } catch (error) {
        console.error(error);

        return message.reply(
            `❌ Erro ao criar troca.\n\`${error.message}\``
        );
    }
};

module.exports.interaction = async (interaction, db) => {
    try {
        await interaction.deferUpdate();

        const aceitar =
            interaction.customId.startsWith('troca_aceitar_');

        const tradeId =
            interaction.customId
                .replace('troca_aceitar_', '')
                .replace('troca_recusar_', '');

        const troca =
            trocasAbertas.get(tradeId);

        if (!troca) {
            return interaction.editReply({
                content: '❌ Essa troca expirou.',
                components: []
            });
        }

        if (interaction.user.id !== troca.alvoId) {
            return interaction.editReply({
                content: '❌ Apenas o usuário marcado pode responder essa troca.',
                components: []
            });
        }

        const jogadorOferecido =
            jogadores.find(j => j.id === troca.ofereceId);

        const jogadorDesejado =
            jogadores.find(j => j.id === troca.querId);

        if (!aceitar) {
            trocasAbertas.delete(tradeId);

            return interaction.editReply({
                content: `❌ ${troca.alvoNome} recusou a troca.`,
                components: []
            });
        }

        if (!temRepetida(db, troca.autorId, jogadorOferecido.id)) {
            trocasAbertas.delete(tradeId);

            return interaction.editReply({
                content: `❌ Troca cancelada. ${troca.autorNome} não possui mais **${jogadorOferecido.nome}** repetida.`,
                components: []
            });
        }

        if (!temRepetida(db, troca.alvoId, jogadorDesejado.id)) {
            trocasAbertas.delete(tradeId);

            return interaction.editReply({
                content: `❌ Troca cancelada. ${troca.alvoNome} não possui mais **${jogadorDesejado.nome}** repetida.`,
                components: []
            });
        }

        removerRepetida(db, troca.autorId, jogadorOferecido.id);
        removerRepetida(db, troca.alvoId, jogadorDesejado.id);

        const statusAutor =
            colarFigurinha(db, troca.autorId, jogadorDesejado);

        const statusAlvo =
            colarFigurinha(db, troca.alvoId, jogadorOferecido);

        trocasAbertas.delete(tradeId);

        return interaction.editReply({
            content:
                `✅ **Troca concluída!**\n\n` +
                `👤 ${troca.autorNome} recebeu **${jogadorDesejado.nome}** ${statusAutor === 'nova' ? '(nova no álbum)' : '(foi para repetidas)'}\n` +
                `👤 ${troca.alvoNome} recebeu **${jogadorOferecido.nome}** ${statusAlvo === 'nova' ? '(nova no álbum)' : '(foi para repetidas)'}`,
            components: []
        });

    } catch (error) {
        console.error(error);

        try {
            return interaction.editReply({
                content: `❌ Erro na troca.\n\`${error.message}\``,
                components: []
            });
        } catch {}
    }
};