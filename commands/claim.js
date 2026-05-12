const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js');

const jogadores = require('../data/jogadores');

const {
    gerarCard
} = require('../utils/canvas');

const {
    pegarSaldo,
    removerSaldo
} = require('../utils/money');

const {
    salvarDB
} = require('../utils/database');

const claimsAbertos = new Map();
const claimsProcessando = new Set();

const PRECO_CLAIM = 7;

function formatarSaldo(valor) {
    return parseFloat(Number(valor).toFixed(2));
}

function pegarAlbum(db, userId) {
    if (!db.albuns) db.albuns = {};
    if (!db.albuns[userId]) db.albuns[userId] = [];
    return db.albuns[userId];
}

function pegarRepetidas(db, userId) {
    if (!db.repetidas) db.repetidas = {};
    if (!db.repetidas[userId]) db.repetidas[userId] = {};
    return db.repetidas[userId];
}

function temFigurinha(album, jogador) {
    return album.includes(jogador.id) || album.includes(jogador.nome);
}

function colarFigurinha(db, userId, jogador) {
    const album = pegarAlbum(db, userId);
    const repetidas = pegarRepetidas(db, userId);

    if (temFigurinha(album, jogador)) {
        repetidas[jogador.id] = (repetidas[jogador.id] || 0) + 1;
        salvarDB(db);
        return 'repetida';
    }

    album.push(jogador.id);
    salvarDB(db);
    return 'nova';
}

function sortear(lista) {
    return lista[Math.floor(Math.random() * lista.length)];
}

function embaralhar(array) {
    return array.sort(() => Math.random() - 0.5);
}

function gerarPacotes() {
    const jogadoresBons = jogadores.filter(j => j.raridade === 'bom');
    const jogadoresComuns = jogadores.filter(j => j.raridade === 'comum');

    const jogadorBom = sortear(jogadoresBons);
    let jogadorComum1 = sortear(jogadoresComuns);
    let jogadorComum2 = sortear(jogadoresComuns);

    while (jogadorComum2.id === jogadorComum1.id) {
        jogadorComum2 = sortear(jogadoresComuns);
    }

    const pacotes = embaralhar([
        { tipo: 'bom', jogador: jogadorBom },
        { tipo: 'comum', jogador: jogadorComum1 },
        { tipo: 'comum', jogador: jogadorComum2 }
    ]);

    return {
        pacote_1: pacotes[0],
        pacote_2: pacotes[1],
        pacote_3: pacotes[2]
    };
}

module.exports = async (message, db) => {
    try {
        const saldo = pegarSaldo(db, message.author.id);

        if (saldo < PRECO_CLAIM) {
            return message.reply(`❌ Você precisa de R$${PRECO_CLAIM} para abrir um pacote.`);
        }

        removerSaldo(db, message.author.id, PRECO_CLAIM);

        const pacotes = gerarPacotes();
        const claimId = `${message.author.id}_${Date.now()}`;

        claimsAbertos.set(claimId, {
            userId: message.author.id,
            pacotes
        });

        const botoes = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`pacote_${claimId}_1`)
                .setLabel('Pacote 1')
                .setEmoji('📦')
                .setStyle(ButtonStyle.Secondary),

            new ButtonBuilder()
                .setCustomId(`pacote_${claimId}_2`)
                .setLabel('Pacote 2')
                .setEmoji('📦')
                .setStyle(ButtonStyle.Secondary),

            new ButtonBuilder()
                .setCustomId(`pacote_${claimId}_3`)
                .setLabel('Pacote 3')
                .setEmoji('📦')
                .setStyle(ButtonStyle.Secondary)
        );

        return message.reply({
            content:
                `💸 Você pagou R$${PRECO_CLAIM}\n` +
                `🔥 Escolha um pacote!\n` +
                `💰 Saldo restante: R$${formatarSaldo(pegarSaldo(db, message.author.id))}`,
            components: [botoes]
        });

    } catch (error) {
        console.error(error);
        return message.reply('❌ Erro ao abrir pacote.');
    }
};

module.exports.interaction = async (interaction, db) => {
    try {
        await interaction.deferUpdate();

        const partes = interaction.customId.split('_');
        const claimId = `${partes[1]}_${partes[2]}`;
        const pacoteId = `pacote_${partes[3]}`;

        if (claimsProcessando.has(claimId)) {
            return interaction.editReply({
                content: '❌ Esse pacote já está sendo aberto.',
                components: []
            });
        }

        claimsProcessando.add(claimId);

        const claim = claimsAbertos.get(claimId);

        if (!claim) {
            claimsProcessando.delete(claimId);

            return interaction.editReply({
                content: '❌ Claim expirado.',
                components: []
            });
        }

        if (interaction.user.id !== claim.userId) {
            claimsProcessando.delete(claimId);

            return interaction.editReply({
                content: '❌ Apenas quem usou o claim pode escolher o pacote.',
                components: []
            });
        }

        const resultado = claim.pacotes[pacoteId];

        if (!resultado) {
            claimsProcessando.delete(claimId);

            return interaction.editReply({
                content: '❌ Pacote inválido.',
                components: []
            });
        }

        claimsAbertos.delete(claimId);

        const statusFigurinha = colarFigurinha(
            db,
            interaction.user.id,
            resultado.jogador
        );

        const card = await gerarCard(resultado.jogador);

        claimsProcessando.delete(claimId);

        const textoTipo =
            resultado.tipo === 'bom'
                ? '🔥 Pacote especial!'
                : '📦 Pacote comum!';

        const textoAlbum =
            statusFigurinha === 'nova'
                ? '📖 Figurinha nova colada no álbum!'
                : '🔁 Figurinha repetida adicionada às repetidas!';

        const mencaoJogador =
    resultado.jogador.discordId
        ? ` (<@${resultado.jogador.discordId}>)`
        : '';

return interaction.editReply({
    content:
        `${textoTipo}\n` +
        `🟢 Você conseguiu **${resultado.jogador.nome}**${mencaoJogador}!\n` +
        `${textoAlbum}`,
    components: [],
    files: [card]
});

    } catch (error) {
        console.error(error);

        try {
            return interaction.editReply({
                content: '❌ Erro ao abrir pacote.',
                components: []
            });
        } catch {}
    }
};