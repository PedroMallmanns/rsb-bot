const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js');

const perguntas =
    require('../data/perguntasQuiz');

const {
    adicionarSaldo
} = require('../utils/money');

const {
    salvarDB
} = require('../utils/database');

const quizzesAtivos =
    new Map();

const cooldownQuiz =
    new Map();

module.exports = async (
    message,
    db
) => {

    try {

        const agora =
            Date.now();

        const cooldown =
            cooldownQuiz.get(
                message.author.id
            );

        const umMinuto =
            60 * 1000;

        if (

            cooldown &&

            agora - cooldown <
            umMinuto
        ) {

            const restante =
                Math.ceil(

                    (
                        umMinuto -
                        (
                            agora -
                            cooldown
                        )
                    ) / 1000
                );

            return message.reply(

                `⏰ Aguarde ${restante}s para usar o quiz novamente.`
            );
        }

        if (
            !db.quizDaily
        ) {

            db.quizDaily = {};
        }

        if (
            !db.quizDaily[
                message.author.id
            ]
        ) {

            db.quizDaily[
                message.author.id
            ] = {

                quantidade: 0,

                reset:
                    Date.now()
            };
        }

        const dadosQuiz =
            db.quizDaily[
                message.author.id
            ];

        const vinteQuatroHoras =
            24 *
            60 *
            60 *
            1000;

        if (

            agora -
            dadosQuiz.reset >
            vinteQuatroHoras
        ) {

            dadosQuiz.quantidade = 0;

            dadosQuiz.reset =
                agora;
        }

        if (
            dadosQuiz.quantidade >=
            30
        ) {

            return message.reply(

                '❌ Você atingiu o limite diário de 30 quizzes.'
            );
        }

        const pergunta =
            perguntas[
                Math.floor(
                    Math.random() *
                    perguntas.length
                )
            ];

        cooldownQuiz.set(
            message.author.id,
            agora
        );

        dadosQuiz.quantidade += 1;

        salvarDB(db);

        const quizId =
            Date.now().toString();

        const indiceCorreto =
            pergunta.resposta
                .charCodeAt(0) - 65;

        quizzesAtivos.set(
            quizId,
            {
                resposta:
                    indiceCorreto,

                pergunta
            }
        );

        const botoes =
            new ActionRowBuilder();

        pergunta.opcoes.forEach(
            (opcao, index) => {

                const textoLimpo =
                    opcao.replace(
                        /^[A-D]\)\s*/,
                        ''
                    );

                botoes.addComponents(

                    new ButtonBuilder()

                        .setCustomId(
                            `quiz_${quizId}_${index}`
                        )

                        .setLabel(
                            textoLimpo
                        )

                        .setStyle(
                            ButtonStyle.Secondary
                        )
                );
            }
        );

        return message.reply({

            content:

                `## 🧠 QUIZ RSB (Valendo R$1)\n` +

                `${pergunta.pergunta}`,

            components: [botoes]
        });

    } catch (error) {

        console.error(error);

        return message.reply(
            '❌ Erro no quiz.'
        );
    }
};

module.exports.interaction =
async (
    interaction,
    db
) => {

    try {

        if (
            !interaction.customId
                .startsWith('quiz_')
        ) return;

        await interaction.deferUpdate();

        const partes =
            interaction.customId
                .split('_');

        const quizId =
            partes[1];

        const indiceEscolhido =
            Number(partes[2]);

        const quiz =
            quizzesAtivos.get(
                quizId
            );

        if (!quiz) {

            return interaction.editReply({

                content:
                    '❌ Esse quiz expirou.',

                components: []
            });
        }

        const acertou =

            indiceEscolhido ===
            quiz.resposta;

        quizzesAtivos.delete(
            quizId
        );

        if (acertou) {

            adicionarSaldo(

                db,

                interaction.user.id,

                1
            );

            return interaction.editReply({

                content:

                    `✅ **${interaction.user.username}** acertou a resposta e ganhou 💸 **R$ 1**!`,

                components: []
            });
        }

        const respostaCorreta =
            quiz.pergunta.opcoes[
                quiz.resposta
            ].replace(
                /^[A-D]\)\s*/,
                ''
            );

        return interaction.editReply({

            content:

                `❌ **${interaction.user.username}** errou a pergunta. Tente novamente!\n\n` +

                `✅ **Resposta correta:** ${respostaCorreta}`,

            components: []
        });

    } catch (error) {

        console.error(error);

        try {

            await interaction.editReply({

                content:
                    '❌ Erro no quiz.',

                components: []
            });

        } catch {}
    }
};