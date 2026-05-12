const fs = require('fs');

function salvarDB(db) {

    fs.writeFileSync(

        './database.json',

        JSON.stringify(
            db,
            null,
            4
        )
    );
}

function pegarSaldo(
    db,
    userId
) {

    if (
        !db.saldos
    ) {

        db.saldos = {};
    }

    if (
        !db.saldos[userId]
    ) {

        db.saldos[userId] = 0;
    }

    salvarDB(db);

    return db.saldos[userId];
}

function adicionarSaldo(
    db,
    userId,
    valor
) {

    if (
        !db.saldos
    ) {

        db.saldos = {};
    }

    if (
        !db.saldos[userId]
    ) {

        db.saldos[userId] = 0;
    }

    db.saldos[userId] += valor;

    salvarDB(db);
}

function removerSaldo(
    db,
    userId,
    valor
) {

    if (
        !db.saldos
    ) {

        db.saldos = {};
    }

    if (
        !db.saldos[userId]
    ) {

        db.saldos[userId] = 0;
    }

    db.saldos[userId] -= valor;

    if (
        db.saldos[userId] < 0
    ) {

        db.saldos[userId] = 0;
    }

    salvarDB(db);
}

function pegarAlbum(
    db,
    userId
) {

    if (
        !db.albuns
    ) {

        db.albuns = {};
    }

    if (
        !db.albuns[userId]
    ) {

        db.albuns[userId] = [];
    }

    salvarDB(db);

    return db.albuns[userId];
}

function pegarRepetidas(
    db,
    userId
) {

    if (
        !db.repetidas
    ) {

        db.repetidas = {};
    }

    if (
        !db.repetidas[userId]
    ) {

        db.repetidas[userId] = {};
    }

    salvarDB(db);

    return db.repetidas[userId];
}

function temFigurinha(
    album,
    jogador
) {

    return (

        album.includes(
            jogador.id
        ) ||

        album.includes(
            jogador.nome
        )
    );
}

function colarFigurinha(
    db,
    userId,
    jogador
) {

    const album =
        pegarAlbum(
            db,
            userId
        );

    const repetidas =
        pegarRepetidas(
            db,
            userId
        );

    if (
        temFigurinha(
            album,
            jogador
        )
    ) {

        repetidas[
            jogador.id
        ] =

            (
                repetidas[
                    jogador.id
                ] || 0
            ) + 1;

        salvarDB(db);

        return 'repetida';
    }

    album.push(
        jogador.id
    );

    salvarDB(db);

    return 'nova';
}

function removerRepetida(
    db,
    userId,
    jogadorId
) {

    const repetidas =
        pegarRepetidas(
            db,
            userId
        );

    if (

        !repetidas[
            jogadorId
        ] ||

        repetidas[
            jogadorId
        ] <= 0
    ) {

        return false;
    }

    repetidas[
        jogadorId
    ] -= 1;

    if (

        repetidas[
            jogadorId
        ] <= 0
    ) {

        delete repetidas[
            jogadorId
        ];
    }

    salvarDB(db);

    return true;
}

module.exports = {

    salvarDB,

    pegarSaldo,

    adicionarSaldo,

    removerSaldo,

    pegarAlbum,

    pegarRepetidas,

    colarFigurinha,

    removerRepetida
};