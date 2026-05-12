const troca =
    require('../commands/troca');

const quiz =
    require('../commands/quiz');

module.exports = async (
    interaction,
    db
) => {

    try {

        if (
            !interaction.isButton()
        ) return;

        if (

            interaction.customId
                .startsWith('troca_')
        ) {

            return troca.interaction(
                interaction,
                db
            );
        }

        if (

            interaction.customId
                .startsWith('quiz_')
        ) {

            return quiz.interaction(
                interaction,
                db
            );
        }

    } catch (error) {

        console.error(error);
    }
};