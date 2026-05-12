module.exports = async (message) => {
    return message.reply(
        '📕 O sistema de álbum está temporariamente desativado para manutenção.'
    );
};

module.exports.interaction = async (interaction) => {
    try {
        if (!interaction.replied && !interaction.deferred) {
            return interaction.reply({
                content: '📕 O sistema de álbum está temporariamente desativado.',
                ephemeral: true
            });
        }

        return interaction.editReply({
            content: '📕 O sistema de álbum está temporariamente desativado.',
            components: [],
            files: []
        });
    } catch (error) {
        console.error(error);
    }
};