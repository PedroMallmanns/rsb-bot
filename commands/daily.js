const {
    adicionarSaldo,
    pegarSaldo
} = require('../utils/money');

const {
    salvarDB
} = require('../utils/database');

const RECOMPENSA_DAILY = 7;

module.exports = async (
    message,
    db
) => {

    try {

        if (
            !db.dailyCooldown
        ) {

            db.dailyCooldown = {};
        }

        const ultimoDaily =
            db.dailyCooldown[
                message.author.id
            ];

        const agora =
            Date.now();

        const vinteQuatroHoras =
            24 * 60 * 60 * 1000;

        if (

            ultimoDaily &&

            agora - ultimoDaily <
            vinteQuatroHoras
        ) {

            const restante =
                vinteQuatroHoras -
                (
                    agora -
                    ultimoDaily
                );

            const horas =
                Math.floor(

                    restante /

                    (
                        1000 *
                        60 *
                        60
                    )
                );

            const minutos =
                Math.floor(

                    (
                        restante %

                        (
                            1000 *
                            60 *
                            60
                        )
                    ) /

                    (
                        1000 *
                        60
                    )
                );

            return message.reply(

                `⏰ Você já coletou sua figurinha de hoje.\n\n` +

                `Volte em ${horas}h ${minutos}m.`
            );
        }

        adicionarSaldo(

            db,

            message.author.id,

            RECOMPENSA_DAILY
        );

        db.dailyCooldown[
            message.author.id
        ] = agora;

        salvarDB(db);

        return message.reply(

            `💸 Você coletou suas figurinhas de hoje!\n\n` +

            `💰 +R$${RECOMPENSA_DAILY}\n` +

            `💵 Saldo atual: R$${

                pegarSaldo(
                    db,
                    message.author.id
                )
            }`
        );

    } catch (error) {

        console.error(error);

        return message.reply(
            '❌ Erro ao coletar daily.'
        );
    }
};