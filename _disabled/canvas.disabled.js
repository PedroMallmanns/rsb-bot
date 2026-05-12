const {
    createCanvas,
    loadImage,
    registerFont
} = require('canvas');

const {
    AttachmentBuilder
} = require('discord.js');

const bandeiras =
    require('../data/bandeiras');

const config =
    require('../data/config');

registerFont(
    './assets/fonts/Inter_18pt-Bold.ttf',
    {
        family: 'Inter'
    }
);

async function gerarCard(
    jogador
) {

    const canvas =
        createCanvas(
            600,
            900
        );

    const ctx =
        canvas.getContext('2d');

    const fundo =
        await loadImage(
            './assets/cards/fundo.png'
        );

    const logoRSB =
        await loadImage(
            config.LOGO_RSB
        );

    ctx.drawImage(
        fundo,
        0,
        0,
        600,
        900
    );

    ctx.drawImage(
        logoRSB,
        45,
        35,
        80,
        80
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
                485,
                40,
                60,
                42
            );

        } catch {}
    }

    const centroX = 300;
    const centroY = 430;
    const raio = 175;

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

    ctx.lineWidth = 10;

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

            ? 'bold 210px Inter'

            : 'bold 155px Inter';

    ctx.fillText(

        jogador.icone || '?',

        centroX,

        centroY + 10
    );

    const barraX = 70;
    const barraY = 655;

    const barraLargura = 460;
    const barraAltura = 70;

    ctx.fillStyle =
        '#000000';

    ctx.beginPath();

    ctx.roundRect(

        barraX,

        barraY,

        barraLargura,

        barraAltura,

        25
    );

    ctx.fill();

    ctx.fillStyle =
        '#ffffff';

    ctx.font =
        jogador.nome.length > 12

            ? 'bold 34px Inter'

            : 'bold 42px Inter';

    ctx.fillText(

        jogador.nome,

        300,

        barraY + barraAltura / 2
    );

    return new AttachmentBuilder(
        canvas.toBuffer(),
        {
            name: 'card.png'
        }
    );
}

module.exports = {

    gerarCard
};