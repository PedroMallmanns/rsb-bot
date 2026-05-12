const {
    gerarPaginaAlbum,
    gerarTextoAlbum,
    criarBotoesAlbum,
    totalPaginasAlbum
} = require('../utils/albumUtils');

const albunsAbertos =
    new Map();

module.exports = async (
    message,
    db
) => {

    try {

        const usuario =
            message.mentions
                .users
                .first()

            || message.author;

        const pagina = 0;

        albunsAbertos.set(

            message.author.id,

            {
                userId:
                    usuario.id,

                username:
                    usuario.username,

                pagina
            }
        );

        const imagemAlbum =
            await gerarPaginaAlbum(

                db,

                usuario.id,

                pagina
            );

        return message.reply({

            content:
                gerarTextoAlbum(

                    db,

                    usuario.id,

                    usuario.username,

                    pagina
                ),

            files: [imagemAlbum],

            components: [

                criarBotoesAlbum(
                    pagina
                )
            ]
        });

    } catch (error) {

        console.error(error);

        return message.reply(
            '❌ Erro ao abrir álbum.'
        );
    }
};

module.exports.interaction =
async (
    interaction,
    db
) => {

    try {

        await interaction.deferUpdate();

        const albumAberto =
            albunsAbertos.get(
                interaction.user.id
            );

        if (!albumAberto) {

    return interaction.update({

        content:
            '❌ Abra o álbum novamente usando `!album`.',

        components: []
    });
}

        if (

            interaction.customId
    .startsWith('album_voltar')
        ) {

            albumAberto.pagina =
                Math.max(

                    0,

                    albumAberto.pagina - 1
                );
        }

        if (

            interaction.customId
    .startsWith('album_avancar')
        ) {

            albumAberto.pagina =
                Math.min(

                    totalPaginasAlbum(db) - 1,

                    albumAberto.pagina + 1
                );
        }

        albunsAbertos.set(

            interaction.user.id,

            albumAberto
        );

        const imagemAlbum =
            await gerarPaginaAlbum(

                db,

                albumAberto.userId,

                albumAberto.pagina
            );

        await interaction.editReply({

            content:
                gerarTextoAlbum(

                    db,

                    albumAberto.userId,

                    albumAberto.username,

                    albumAberto.pagina
                ),

            files: [imagemAlbum],

            components: [

                criarBotoesAlbum(
                    albumAberto.pagina
                )
            ]
        });

    } catch (error) {

        console.error(error);

        try {

            if (
                interaction.deferred ||
                interaction.replied
            ) {

                await interaction.editReply({

                    content:
                        '❌ Erro ao trocar página.',

                    components: [],

                    files: []
                });
            }

        } catch {}
    }
};