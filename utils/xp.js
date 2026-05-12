const {
    adicionarSaldo
} = require('./money');

const {
    salvarDB
} = require('./database');

const XP_POR_MENSAGEM = 1;
const COOLDOWN_XP = 60 * 1000;
const XP_PARA_RECOMPENSA = 50;
const RECOMPENSA_XP = 7;

function processarXP(message, db) {

    try {

        if (
            message.author.bot
        ) return;

        if (
            message.content.startsWith('!')
        ) return;

        const userId =
            message.author.id;

        const agora =
            Date.now();

        if (!db.xp) db.xp = {};
        if (!db.xpCooldown) db.xpCooldown = {};

        if (!db.xp[userId]) {

            db.xp[userId] = {

                xp: 0,

                ultimaRecompensa: 0
            };
        }

        const ultimoXP =
            db.xpCooldown[userId] || 0;

        if (
            agora - ultimoXP <
            COOLDOWN_XP
        ) {

            return;
        }

        db.xpCooldown[userId] =
            agora;

        db.xp[userId].xp +=
            XP_POR_MENSAGEM;

        const xpAtual =
            db.xp[userId].xp;

        const ultimaRecompensa =
            db.xp[userId].ultimaRecompensa;

        const recompensaAtual =
            Math.floor(
                xpAtual /
                XP_PARA_RECOMPENSA
            );

        if (
            recompensaAtual >
            ultimaRecompensa
        ) {

            db.xp[userId].ultimaRecompensa =
                recompensaAtual;

            adicionarSaldo(
                db,
                userId,
                RECOMPENSA_XP
            );

            message.channel.send(
                `🎉 **${message.author.username}** chegou em **${xpAtual} XP** e ganhou **R$${RECOMPENSA_XP}**!`
            ).catch(console.error);
        }

        salvarDB(db);

    } catch (error) {

        console.error(
            '❌ Erro ao processar XP:',
            error
        );
    }
}

module.exports = {
    processarXP
};