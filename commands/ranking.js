const jogadores = require('../data/jogadores');

module.exports = async (message, db) => {
    try {
        if (!db.albuns) {
            db.albuns = {};
        }

        const ranking = await Promise.all(
            Object.entries(db.albuns).map(async ([userId, album]) => {
                let username = 'Usuário desconhecido';

                try {
                    const membro = await message.guild.members.fetch(userId);
                    username = membro.user.username;
                } catch {
                    try {
                        const user = await message.client.users.fetch(userId);
                        username = user.username;
                    } catch {}
                }

                return {
                    userId,
                    username,
                    total: album.length
                };
            })
        );

        const rankingOrdenado = ranking
            .sort((a, b) => b.total - a.total)
            .slice(0, 10);

        if (rankingOrdenado.length === 0) {
            return message.reply('❌ Ninguém possui figurinhas ainda.');
        }

        let texto = '🏆 **RANKING DE FIGURINHAS RSB**\n\n';

        rankingOrdenado.forEach((jogador, index) => {
            texto +=
                `#${index + 1} ${jogador.username}\n` +
                `🃏 ${jogador.total}/${jogadores.length} figurinhas\n\n`;
        });

        return message.reply(texto);

    } catch (error) {
        console.error(error);
        return message.reply('❌ Erro ao carregar ranking.');
    }
};