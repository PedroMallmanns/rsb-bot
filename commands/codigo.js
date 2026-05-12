const {
    adicionarSaldo
} = require('../utils/money');

const {
    salvarDB
} = require('../utils/database');

function gerarCodigoAleatorio() {

    const chars =
        'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

    let codigo = 'RSB-';

    for (let i = 0; i < 6; i++) {

        codigo += chars[
            Math.floor(
                Math.random() *
                chars.length
            )
        ];
    }

    return codigo;
}

function criarCodigo(
    db,
    valor,
    criadoPor
) {

    let codigo =
        gerarCodigoAleatorio();

    while (
        db.codigos[codigo]
    ) {

        codigo =
            gerarCodigoAleatorio();
    }

    db.codigos[codigo] = {

        valor,

        criadoPor,

        criadoEm:
            Date.now(),

        usado: false,

        usadoPor: null,

        usadoEm: null
    };

    salvarDB(db);

    return codigo;
}

module.exports = async (
    message,
    db
) => {

    try {

        const args =
            message.content
                .trim()
                .split(' ');

        const command =
            args[0]
                .toLowerCase();

        if (
            command ===
            '!gerarcodigo'
        ) {

            if (
                !message.member
                    .permissions
                    .has(
                        'Administrator'
                    )
            ) {

                return message.reply(
                    '❌ Apenas administradores podem gerar códigos.'
                );
            }

            const valor =
                Number(args[1]);

            if (
                !valor ||
                valor <= 0
            ) {

                return message.reply(

                    'Use assim:\n`!gerarcodigo 50`'
                );
            }

            const codigo =
                criarCodigo(

                    db,

                    valor,

                    message.author.id
                );

            return message.reply(

                `🎁 **Código gerado com sucesso!**\n\n` +

                `Código: \`${codigo}\`\n` +

                `Valor: **R$${valor}**\n\n` +

                `Use:\n` +

                `\`!resgatar ${codigo}\``
            );
        }

        if (
            command ===
            '!resgatar'
        ) {

            const codigo =
                args[1]
                    ?.toUpperCase();

            if (!codigo) {

                return message.reply(

                    'Use assim:\n`!resgatar RSB-ABC123`'
                );
            }

            const dadosCodigo =
                db.codigos[codigo];

            if (
                !dadosCodigo
            ) {

                return message.reply(
                    '❌ Código inválido.'
                );
            }

            if (
                dadosCodigo.usado
            ) {

                return message.reply(
                    '❌ Esse código já foi resgatado.'
                );
            }

            dadosCodigo.usado = true;

            dadosCodigo.usadoPor =
                message.author.id;

            dadosCodigo.usadoEm =
                Date.now();

            adicionarSaldo(

                db,

                message.author.id,

                dadosCodigo.valor
            );

            salvarDB(db);

            return message.reply(

                `✅ Código resgatado!\n\n` +

                `💸 Você recebeu R$${dadosCodigo.valor}\n` +

                `💰 Saldo atualizado com sucesso.`
            );
        }

    } catch (error) {

        console.error(error);

        return message.reply(
            '❌ Erro no sistema de códigos.'
        );
    }
};