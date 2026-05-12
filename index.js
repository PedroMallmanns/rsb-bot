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

        readyEvent(client);
    }
);

client.on(
    'messageCreate',
    async (message) => {

        messageCreate(
            message,
            db
        );
    }
);

client.on(
    'interactionCreate',
    async (interaction) => {

        interactionCreate(
            interaction,
            db
        );
    }
);

client.login(
    process.env.TOKEN
);