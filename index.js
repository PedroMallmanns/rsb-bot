require('dotenv').config();

const {
    Client,
    GatewayIntentBits
} = require('discord.js');

const {
    carregarDB
} = require('./utils/database');

const messageCreate =
    require('./events/messageCreate');

const interactionCreate =
    require('./events/interactionCreate');

const readyEvent =
    require('./events/ready');

const client = new Client({

    intents: [

        GatewayIntentBits.Guilds,

        GatewayIntentBits.GuildMessages,

        GatewayIntentBits.MessageContent
    ]
});

const db =
    carregarDB();

client.once(
    'ready',
    async () => {

        try {

            readyEvent(client);

        } catch (error) {

            console.error(
                '❌ Erro no evento ready:',
                error
            );
        }
    }
);

client.on(
    'messageCreate',
    async (message) => {

        try {

            messageCreate(
                message,
                db
            );

        } catch (error) {

            console.error(
                '❌ Erro no messageCreate:',
                error
            );
        }
    }
);

client.on(
    'interactionCreate',
    async (interaction) => {

        try {

            interactionCreate(
                interaction,
                db
            );

        } catch (error) {

            console.error(
                '❌ Erro no interactionCreate:',
                error
            );
        }
    }
);

client.login(
    process.env.TOKEN
).catch(error => {

    console.error(
        '❌ Erro ao logar no bot:',
        error
    );
});