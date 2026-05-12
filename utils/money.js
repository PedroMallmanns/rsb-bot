const {
    salvarDB
} = require('./database');

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

module.exports = {

    pegarSaldo,

    adicionarSaldo,

    removerSaldo
};