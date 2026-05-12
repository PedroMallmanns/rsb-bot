const fs = require('fs');

const DATABASE_PATH =
    './database.json';

function carregarDB() {

    try {

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

    } catch (error) {

        console.error(
            '❌ Erro ao carregar database:',
            error
        );

        return {

            saldos: {},

            dailyCooldown: {},

            albuns: {},

            repetidas: {},

            codigos: {},

            quizDaily: {}
        };
    }
}

function salvarDB(db) {

    try {

        fs.writeFileSync(

            DATABASE_PATH,

            JSON.stringify(
                db,
                null,
                4
            )
        );

    } catch (error) {

        console.error(
            '❌ Erro ao salvar database:',
            error
        );
    }
}

module.exports = {

    carregarDB,

    salvarDB
};