module.exports = async (
    client
) => {

    console.log(
        `🤖 ${client.user.tag} online.`
    );

    client.user.setPresence({

        activities: [

            {
                name:
                    'RSB Figurinhas',
                type: 3
            }
        ],

        status: 'online'
    });
};