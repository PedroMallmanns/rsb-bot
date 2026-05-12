const fs = require('fs');

const DATABASE_PATH =
    './database.json';

function carregarDB() {

    if (
        !fs.existsSync(
            DATABASE_PATH
        )
    ) {

        const databaseInicial = {

            saldos: {},

            dailyCooldown: {},

            albuns: {},

            repetidas: {},

            codigos: {},

            quizDaily: {}
        };

        fs.writeFileSync(

            DATABASE_PATH,

            JSON.stringify(
                databaseInicial,
                null,
                4
            )
        );

        return databaseInicial;
    }

    const db = JSON.parse(

        fs.readFileSync(
            DATABASE_PATH,
            'utf8'
        )
    );

    if (!db.saldos)
        db.saldos = {};

    if (!db.dailyCooldown)
        db.dailyCooldown = {};

    if (!db.albuns)
        db.albuns = {};

    if (!db.repetidas)
        db.repetidas = {};

    if (!db.codigos)
        db.codigos = {};

    if (!db.quizDaily)
        db.quizDaily = {};

    salvarDB(db);

    return db;
}

function salvarDB(db) {

    fs.writeFileSync(

        DATABASE_PATH,

        JSON.stringify(
            db,
            null,
            4
        )
    );
}

module.exports = {

    carregarDB,

    salvarDB
};