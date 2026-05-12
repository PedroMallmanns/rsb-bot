const missoes =
    require('../commands/missoes');

const {
    processarXP
} = require('../utils/xp');

const album =
    require('../commands/album');

const daily =
    require('../commands/daily');

const quiz =
    require('../commands/quiz');

const ranking =
    require('../commands/ranking');

const troca =
    require('../commands/troca');

const codigo =
    require('../commands/codigo');

const jogadores =
    require('../data/jogadores');

const {
    pegarSaldo
} = require('../utils/money');

const {
    salvarDB
} = require('../utils/database');

module.exports = async (
    message,
    db
) => {

    if (
    message.author.bot
) return;

processarXP(message, db);

    if (
        message.author.bot
    ) return;

    if (
        !message.content
            .startsWith('!')
    ) return;

    const args =
        message.content
            .trim()
            .split(/ +/);

    const comando =
        args[0]
            .toLowerCase();

    try {

        if (
            comando === '!album'
        ) {

            return album(
                message,
                db
            );
        }

        if (
            comando === '!figurinhas'
        ) {

            const usuario =
                message.mentions
                    .users
                    .first()

                || message.author;

            if (!db.albuns) {
                db.albuns = {};
            }

            const albumUsuario =
                db.albuns[usuario.id] || [];

            if (
                albumUsuario.length === 0
            ) {

                return message.reply(
                    `❌ ${usuario.username} ainda não tem figurinhas no álbum.`
                );
            }

           const repetidasUsuario =
    db.repetidas?.[usuario.id] || {};

const figurinhas =
    jogadores
        .filter(jogador =>

            albumUsuario.includes(jogador.id) ||

            albumUsuario.includes(jogador.nome)
        )

        .map(jogador => {

            const qtdRepetidas =

                repetidasUsuario[jogador.id] ||

                repetidasUsuario[jogador.nome] ||

                0;

            const total =
                1 + qtdRepetidas;

            return total > 1

                ? `• ${jogador.nome} (x${total})`

                : `• ${jogador.nome}`;
        })

        .join('\n');

            return message.reply(

                `🃏 **Figurinhas de ${usuario.username}**\n\n${figurinhas}`
            );
        }

        if (
            comando === '!removerfigurinha'
        ) {

            if (
                !message.member.permissions.has('Administrator')
            ) {

                return message.reply(
                    '❌ Apenas administradores podem remover figurinhas.'
                );
            }

            const alvo =
                args[1];

            if (!alvo) {

                return message.reply(
                    'Use:\n`!removerfigurinha ID figurinha`'
                );
            }

            const usuarioId =
                alvo.replace(
                    /[<@!>]/g,
                    ''
                );

            const nomeFigurinha =
                args
                    .slice(2)
                    .join(' ')
                    .trim()
                    .toLowerCase();

            if (!nomeFigurinha) {

                return message.reply(
                    '❌ Informe o nome da figurinha.'
                );
            }

            const jogador =
                jogadores.find(j =>

                    j.nome
                        .toLowerCase() ===
                    nomeFigurinha ||

                    j.id
                        .toLowerCase() ===
                    nomeFigurinha
                );

            if (!jogador) {

                return message.reply(
                    `❌ Figurinha **${nomeFigurinha}** não encontrada.`
                );
            }

            if (!db.albuns) {
                db.albuns = {};
            }

            if (!db.albuns[usuarioId]) {
                db.albuns[usuarioId] = [];
            }

            const albumUsuario =
                db.albuns[usuarioId];

            const index =
                albumUsuario.findIndex(item =>

                    item === jogador.id ||

                    item === jogador.nome
                );

            if (index === -1) {

                return message.reply(
                    `❌ O usuário não possui a figurinha **${jogador.nome}**.`
                );
            }

            albumUsuario.splice(index, 1);

            if (!db.repetidas) {
                db.repetidas = {};
            }

            if (db.repetidas[usuarioId]) {

                delete db.repetidas[usuarioId][jogador.id];
                delete db.repetidas[usuarioId][jogador.nome];
            }

            salvarDB(db);

            return message.reply(
                `✅ Figurinha **${jogador.nome}** removida do álbum e das repetidas do usuário \`${usuarioId}\`.`
            );
        }

        if (
            comando === '!limparrepetidas'
        ) {

            if (
                !message.member.permissions.has('Administrator')
            ) {

                return message.reply(
                    '❌ Apenas administradores podem limpar repetidas.'
                );
            }

            const alvo =
                args[1];

            if (!alvo) {

                return message.reply(
                    'Use:\n`!limparrepetidas ID`'
                );
            }

            const usuarioId =
                alvo.replace(
                    /[<@!>]/g,
                    ''
                );

            if (!db.repetidas) {
                db.repetidas = {};
            }

            db.repetidas[usuarioId] = {};

            salvarDB(db);

            return message.reply(
                `✅ Todas as repetidas do usuário \`${usuarioId}\` foram apagadas.`
            );
        }

        if (
            comando === '!daily'
        ) {

            return daily(
                message,
                db
            );
        }

        if (
            comando === '!quiz'
        ) {

            return quiz(
                message,
                db
            );
        }

        if (
    comando === '!missoes'
) {

    return missoes(
        message,
        db
    );
}

        if (
            comando === '!ranking'
        ) {

            return ranking(
                message,
                db
            );
        }

        if (
            comando === '!trocar'
        ) {

            return troca(
                message,
                db
            );
        }

        if (

            comando === '!gerarcodigo' ||

            comando === '!resgatar'
        ) {

            return codigo(
                message,
                db
            );
        }

        if (
            comando === '!saldo'
        ) {

            const usuario =
                message.mentions
                    .users
                    .first()

                || message.author;

            const saldo =
                pegarSaldo(
                    db,
                    usuario.id
                );

            return message.reply(

                `💰 Saldo de ${usuario.username}: R$${parseFloat(saldo)}`
            );
        }

        if (
            comando === '!resetarsaldo'
        ) {

            if (
                !message.member.permissions.has('Administrator')
            ) {

                return message.reply(
                    '❌ Apenas administradores podem resetar saldo.'
                );
            }

            const alvo =
                args[1];

            if (!alvo) {

                return message.reply(
                    'Use:\n`!resetarsaldo ID`'
                );
            }

            const usuarioId =
                alvo.replace(
                    /[<@!>]/g,
                    ''
                );

            if (!db.saldos) {
                db.saldos = {};
            }

            db.saldos[usuarioId] = 0;

            salvarDB(db);

            return message.reply(

                `✅ Saldo do usuário \`${usuarioId}\` foi resetado para R$0.`
            );
        }

        if (
            comando === '!repetidas'
        ) {

            const usuario =
                message.mentions
                    .users
                    .first()

                || message.author;

            if (!db.repetidas) {
                db.repetidas = {};
            }

            if (!db.albuns) {
                db.albuns = {};
            }

            const albumUsuario =
                db.albuns[
                    usuario.id
                ] || [];

            const repetidasOriginais =
                db.repetidas[
                    usuario.id
                ] || {};

            const repetidasCorrigidas = {};

            for (
                const [id, qtd]
                of Object.entries(
                    repetidasOriginais
                )
            ) {

                const jogador =
                    jogadores.find(j =>

                        j.id === id ||

                        j.nome === id
                    );

                if (!jogador) {
                    continue;
                }

                const temNoAlbum =
                    albumUsuario.includes(jogador.id) ||

                    albumUsuario.includes(jogador.nome);

                if (
                    temNoAlbum &&
                    qtd > 0
                ) {

                    repetidasCorrigidas[id] = qtd;
                }
            }

            db.repetidas[
                usuario.id
            ] = repetidasCorrigidas;

            salvarDB(db);

            const lista =
                Object.entries(
                    repetidasCorrigidas
                );

            if (
                lista.length === 0
            ) {

                return message.reply(

                    `❌ ${usuario.username} não possui repetidas.`
                );
            }

            const texto =
                lista.map(

                    ([id, qtd]) => {

                        const jogador =
                            jogadores.find(j =>

                                j.id === id ||

                                j.nome === id
                            );

                        return `• ${jogador ? jogador.nome : id} x${qtd}`;
                    }
                )

                .join('\n');

            return message.reply(

                `🔁 Repetidas de ${usuario.username}:\n\n${texto}`
            );
        }

    } catch (error) {

        console.error(error);

        return message.reply(
            '❌ Erro no comando.'
        );
    }
};