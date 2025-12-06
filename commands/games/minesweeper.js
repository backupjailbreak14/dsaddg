const { EmbedBuilder } = require("discord.js");
const {
    createGame,
    buildBoardComponents,
} = require("../../utils/minesweeper");

module.exports = {
    name: "minesweeper",
    category: "fun",
    description: "Starts an interactive Minesweeper game.",
    usage: "minesweeper [width] [height] [mines]",
    permissions: [],

    run: async (client, message, args) => {
        const width = args[0];
        const height = args[1];
        const mines = args[2];

        const game = createGame(width, height, mines, message.author.id);

        // Make sure the map exists on the client
        if (!client.minesweeperGames) {
            client.minesweeperGames = new Map();
        }

        const embed = new EmbedBuilder()
            .setTitle("💣 Minesweeper")
            .setColor(0x3498db)
            .setDescription(
                `Click the buttons to reveal the tiles.\n` +
                `Board size: **${game.width}×${game.height}**, Mines: **${game.mines}**`
            );

        const components = buildBoardComponents(game);

        const msg = await message.channel.send({
            embeds: [embed],
            components,
        });

        // Store game by message id
        client.minesweeperGames.set(msg.id, game);
    },
};
