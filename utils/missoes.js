const {
    salvarDB
} = require('./database');

const {
    adicionarSaldo,
    pegarSaldo
} = require('./money');

const jogadores =
    require('../data/jogadores');

const RECOMPENSA_MISSAO = 7;

const TODAS_MISSOES = [
    {
        id: 'quiz_5',
        nome: 'Acerte 5 quizzes no dia',
        tipo: 'diaria'
    },
    {
        id: 'quiz_10',
        nome: 'Acerte 10 quizzes no dia',
        tipo: 'diaria'
    },
    {
        id: 'album_5',
        nome: 'Tenha 5 figurinhas no álbum',
        tipo: 'progresso'
    },
    {
        id: 'primeira_figurinha',
        nome: 'Conquiste sua primeira figurinha',
        tipo: 'progresso'
    },
    {
        id: 'primeira_troca',
        nome: 'Faça sua primeira troca de figurinhas',
        tipo: 'progresso'
    },
    {
        id: 'saldo_50',
        nome: 'Junte R$50 de saldo',
        tipo: 'progresso'
    },
    {
        id: 'saldo_100',
        nome: 'Junte R$100 de saldo',
        tipo: 'progresso'
    },
    {
        id: 'trocas_5',
        nome: 'Realize 5 trocas com alguém',
        tipo: 'progresso'
    },
    {
        id: 'repetida_1',
        nome: 'Consiga 1 repetida',
        tipo: 'progresso'
    },
    {
        id: 'repetidas_5',
        nome: 'Tenha 5 repetidas',
        tipo: 'progresso'
    }
];

function dataHoje() {
    return new Date().toISOString().slice(0, 10);
}

function embaralhar(array) {
    return [...array].sort(() => Math.random() - 0.5);
}

function garantirMissoes(db) {
    if (!db.missoes) db.missoes = {};
    if (!db.missoesProgresso) db.missoesProgresso = {};
}

function gerarMissoesDoDia(db, userId) {
    garantirMissoes(db);

    const hoje = dataHoje();

    if (
        db.missoes[userId] &&
        db.missoes[userId].data === hoje
    ) {
        return db.missoes[userId];
    }

    const escolhidas =
        embaralhar(TODAS_MISSOES)
            .slice(0, 3)
            .map(missao => ({
                id: missao.id,
                nome: missao.nome,
                resgatada: false
            }));

    db.missoes[userId] = {
        data: hoje,
        missoes: escolhidas
    };

    salvarDB(db);

    return db.missoes[userId];
}

function contarAlbum(db, userId) {
    if (!db.albuns) db.albuns = {};
    return (db.albuns[userId] || []).length;
}

function contarRepetidas(db, userId) {
    if (!db.repetidas) db.repetidas = {};

    const repetidas =
        db.repetidas[userId] || {};

    return Object.values(repetidas)
        .reduce((total, qtd) => total + qtd, 0);
}

function pegarProgresso(db, userId) {
    garantirMissoes(db);

    if (!db.missoesProgresso[userId]) {
        db.missoesProgresso[userId] = {
            quizzesHoje: 0,
            dataQuiz: dataHoje(),
            trocas: 0
        };
    }

    const hoje = dataHoje();

    if (db.missoesProgresso[userId].dataQuiz !== hoje) {
        db.missoesProgresso[userId].quizzesHoje = 0;
        db.missoesProgresso[userId].dataQuiz = hoje;
    }

    return db.missoesProgresso[userId];
}

function registrarQuizCerto(db, userId) {
    const progresso =
        pegarProgresso(db, userId);

    progresso.quizzesHoje += 1;

    salvarDB(db);
}

function registrarTroca(db, userId) {
    const progresso =
        pegarProgresso(db, userId);

    progresso.trocas += 1;

    salvarDB(db);
}

function missaoCompleta(db, userId, missaoId) {
    const progresso =
        pegarProgresso(db, userId);

    const albumTotal =
        contarAlbum(db, userId);

    const repetidasTotal =
        contarRepetidas(db, userId);

    const saldo =
        pegarSaldo(db, userId);

    if (missaoId === 'quiz_5') {
        return progresso.quizzesHoje >= 5;
    }

    if (missaoId === 'quiz_10') {
        return progresso.quizzesHoje >= 10;
    }

    if (missaoId === 'album_5') {
        return albumTotal >= 5;
    }

    if (missaoId === 'primeira_figurinha') {
        return albumTotal >= 1;
    }

    if (missaoId === 'primeira_troca') {
        return progresso.trocas >= 1;
    }

    if (missaoId === 'saldo_50') {
        return saldo >= 50;
    }

    if (missaoId === 'saldo_100') {
        return saldo >= 100;
    }

    if (missaoId === 'trocas_5') {
        return progresso.trocas >= 5;
    }

    if (missaoId === 'repetida_1') {
        return repetidasTotal >= 1;
    }

    if (missaoId === 'repetidas_5') {
        return repetidasTotal >= 5;
    }

    return false;
}

function textoMissoes(db, userId, username) {
    const dados =
        gerarMissoesDoDia(db, userId);

    const linhas =
        dados.missoes.map((missao, index) => {
            const completa =
                missaoCompleta(db, userId, missao.id);

            const status =
                missao.resgatada
                    ? '✅ Resgatada'
                    : completa
                        ? '🎁 Completa'
                        : '⏳ Em andamento';

            return `${index + 1}. ${missao.nome}\n${status}`;
        });

    return (
        `📋 **Missões diárias de ${username}**\n\n` +
        linhas.join('\n\n') +
        `\n\n💰 Cada missão completa vale **R$${RECOMPENSA_MISSAO}**.`
    );
}

function resgatarMissoes(db, userId) {
    const dados =
        gerarMissoesDoDia(db, userId);

    let totalResgatado = 0;

    for (const missao of dados.missoes) {
        if (
            !missao.resgatada &&
            missaoCompleta(db, userId, missao.id)
        ) {
            missao.resgatada = true;
            totalResgatado += RECOMPENSA_MISSAO;
        }
    }

    if (totalResgatado > 0) {
        adicionarSaldo(db, userId, totalResgatado);
    }

    salvarDB(db);

    return totalResgatado;
}

module.exports = {
    gerarMissoesDoDia,
    textoMissoes,
    resgatarMissoes,
    registrarQuizCerto,
    registrarTroca
};