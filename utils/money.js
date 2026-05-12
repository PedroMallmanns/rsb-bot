const {
    salvarDB
} = require('./database');

function pegarSaldo(
    db,
    userId
) {

    try {

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

    } catch (error) {

        console.error(
            '❌ Erro ao pegar saldo:',
            error
        );

        return 0;
    }
}

function adicionarSaldo(
    db,
    userId,
    valor
) {

    try {

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

    } catch (error) {

        console.error(
            '❌ Erro ao adicionar saldo:',
            error
        );
    }
}

function removerSaldo(
    db,
    userId,
    valor
) {

    try {

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

    } catch (error) {

        console.error(
            '❌ Erro ao remover saldo:',
            error
        );
    }
}

module.exports = {

    pegarSaldo,

    adicionarSaldo,

    removerSaldo
};