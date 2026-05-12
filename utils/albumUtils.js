const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    AttachmentBuilder
} = require('discord.js');

const FIGURINHAS_POR_PAGINA = 10;

const fundoAlbumURL =
    './assets/cards/album.png';

const logoRSBURL =
    './assets/cards/rsb.png';

const bandeiras = {

    Brasil:
        'https://i.ibb.co/Kzqcgysj/Flag-of-Brazil-svg.png',

    Argentina:
        'https://i.ibb.co/k28WGXxm/Flag-of-Argentina-svg.png',

    Chile:
        'https://i.ibb.co/zhGxH2zJ/Flag-of-Chile.jpg',

    Uruguai:
        'https://i.ibb.co/8nXSrqdb/Flag-of-Uruguay-svg.png'
};

const jogadores =
    require('../data/jogadores');

function pegarAlbum(db, id) {

    if (!db.albuns[id]) {

        db.albuns[id] = [];
    }

    return db.albuns[id];
}

function temFigurinha(
    album,
    jogador
) {

    return (
        album.includes(jogador.id) ||
        album.includes(jogador.nome)
    );
}

function totalPaginasAlbum() {

    return Math.ceil(
        jogadores.length /
        FIGURINHAS_POR_PAGINA
    );
}

function criarBotoesAlbum(
    paginaAtual
) {

    const totalPaginas =
        totalPaginasAlbum();

    return new ActionRowBuilder()

        .addComponents(

            new ButtonBuilder()

                .setCustomId(
                    'album_voltar'
                )

                .setLabel('Voltar')

                .setEmoji('⬅️')

                .setStyle(
                    ButtonStyle.Secondary
                )

                .setDisabled(
                    paginaAtual === 0
                ),

            new ButtonBuilder()

                .setCustomId(
                    'album_avancar'
                )

                .setLabel('Avançar')

                .setEmoji('➡️')

                .setStyle(
                    ButtonStyle.Secondary
                )

                .setDisabled(
                    paginaAtual ===
                    totalPaginas - 1
                )
        );
}

function gerarTextoAlbum(
    db,
    userId,
    username,
    pagina
) {

    const album =
        pegarAlbum(
            db,
            userId
        );

    const totalPaginas =
        totalPaginasAlbum();

    const totalConquistadas =
        jogadores.filter(

            j =>
                temFigurinha(
                    album,
                    j
                )
        ).length;

    return (

        `📖 **Álbum de Figurinhas RSB**\n` +

        `📄 Página **${pagina + 1}/${totalPaginas}**\n` +

        `👤 Colecionador: **${username}**\n` +

        `🃏 Figurinhas: **${totalConquistadas}/${jogadores.length}**`
    );
}

async function gerarPaginaAlbum(
    db,
    userId,
    pagina
) {

    const album =
        pegarAlbum(
            db,
            userId
        );

    const largura = 1200;
    const altura = 900;

    const canvas =
        createCanvas(
            largura,
            altura
        );

    const ctx =
        canvas.getContext('2d');

    const fundoAlbum =
        await loadImage(
            fundoAlbumURL
        );

    const fundoCard =
        await loadImage(
            './assets/cards/fundo.png'
        );

    const logoRSB =
        await loadImage(
            logoRSBURL
        );

    ctx.drawImage(
        fundoAlbum,
        0,
        0,
        largura,
        altura
    );

    const inicio =
        pagina *
        FIGURINHAS_POR_PAGINA;

    const jogadoresPagina =
        jogadores.slice(
            inicio,
            inicio +
            FIGURINHAS_POR_PAGINA
        );

    const colunas = 5;

    const cardW = 160;
    const cardH = 240;

    const gapX = 45;
    const gapY = 60;

    const inicioX = 100;
    const inicioY = 210;

    for (
        let i = 0;
        i < jogadoresPagina.length;
        i++
    ) {

        const jogador =
            jogadoresPagina[i];

        const linha =
            Math.floor(
                i / colunas
            );

        const coluna =
            i % colunas;

        const x =
            inicioX +
            coluna *
            (cardW + gapX);

        const y =
            inicioY +
            linha *
            (cardH + gapY);

        const possui =
            temFigurinha(
                album,
                jogador
            );

        if (possui) {

            ctx.drawImage(
                fundoCard,
                x,
                y,
                cardW,
                cardH
            );

            ctx.drawImage(
                logoRSB,
                x + 10,
                y + 10,
                22,
                22
            );

            if (
                bandeiras[
                    jogador.nacionalidade
                ]
            ) {

                try {

                    const bandeira =
                        await loadImage(

                            bandeiras[
                                jogador
                                    .nacionalidade
                            ]
                        );

                    ctx.drawImage(

                        bandeira,

                        x + 118,

                        y + 10,

                        28,

                        20
                    );

                } catch {}
            }

            const centroX =
                x + cardW / 2;

            const centroY =
                y + 90;

            const raio = 46;

            const gradiente =
                ctx.createLinearGradient(

                    centroX - raio,

                    centroY - raio,

                    centroX + raio,

                    centroY + raio
                );

            gradiente.addColorStop(
                0,
                '#00F022'
            );

            gradiente.addColorStop(
                1,
                '#04BA1E'
            );

            ctx.beginPath();

            ctx.arc(
                centroX,
                centroY,
                raio,
                0,
                Math.PI * 2
            );

            ctx.fillStyle =
                gradiente;

            ctx.fill();

            ctx.lineWidth = 4;

            ctx.strokeStyle =
                '#000000';

            ctx.stroke();

            ctx.fillStyle =
                '#000000';

            ctx.textAlign =
                'center';

            ctx.textBaseline =
                'middle';

            ctx.font =
                jogador.icone.length <= 2

                    ? 'bold 54px Inter'

                    : 'bold 40px Inter';

            ctx.fillText(

                jogador.icone || '?',

                centroX,

                centroY + 2
            );

            ctx.fillStyle =
                '#000000';

            ctx.beginPath();

            ctx.roundRect(

                x + 16,

                y + 170,

                128,

                36,

                10
            );

            ctx.fill();

            ctx.fillStyle =
                '#ffffff';

            ctx.font =
                jogador.nome.length > 12

                    ? 'bold 13px Inter'

                    : 'bold 17px Inter';

            ctx.fillText(

                jogador.nome,

                x + 80,

                y + 188
            );

        } else {

            ctx.fillStyle =
                'rgba(10,10,10,0.72)';

            ctx.beginPath();

            ctx.roundRect(
                x,
                y,
                cardW,
                cardH,
                16
            );

            ctx.fill();

            ctx.lineWidth = 4;

            ctx.strokeStyle =
                'rgba(255,255,255,0.28)';

            ctx.stroke();

            ctx.fillStyle =
                '#000000';

            ctx.beginPath();

            ctx.arc(
                x + cardW / 2,
                y + 75,
                38,
                0,
                Math.PI * 2
            );

            ctx.fill();

            ctx.fillStyle =
                '#777777';

            ctx.font =
                'bold 52px Inter';

            ctx.textAlign =
                'center';

            ctx.textBaseline =
                'middle';

            ctx.fillText(
                '?',
                x + cardW / 2,
                y + 78
            );

            ctx.fillStyle =
                '#ffffff';

            ctx.font =
                jogador.nome.length > 12

                    ? 'bold 18px Inter'

                    : 'bold 22px Inter';

            ctx.fillText(
                jogador.nome,
                x + cardW / 2,
                y + 155
            );
        }
    }

    return new AttachmentBuilder(
        canvas.toBuffer(),
        {
            name:
                `album-pagina-${pagina + 1}.png`
        }
    );
}

module.exports = {

    gerarPaginaAlbum,

    gerarTextoAlbum,

    criarBotoesAlbum,

    totalPaginasAlbum
};