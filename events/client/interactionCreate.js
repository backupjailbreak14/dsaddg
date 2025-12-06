const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

module.exports = async (client, interaction) => {
    if (!interaction.isButton()) return;

    const customId = interaction.customId;

    // -------------------------
    //  ROCK PAPER SCISSORS
    // -------------------------
    if (customId.startsWith("rps_")) {

        const game = client.rpsGames?.get(interaction.message.id);

        if (!game) {
            return interaction.reply({
                content: "This RPS game no longer exists.",
                ephemeral: true
            });
        }

        // -------------------------
        //   ACCEPT / DECLINE
        // -------------------------
        if (game.stage === "pending") {
            if (interaction.user.id !== game.opponent) {
                return interaction.reply({
                    content: "Only the challenged user can respond.",
                    ephemeral: true
                });
            }

            if (customId === "rps_accept") {

                game.stage = "playing";

                const chooseRow = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId("rps_rock").setLabel("🪨 Rock").setStyle(ButtonStyle.Primary),
                    new ButtonBuilder().setCustomId("rps_paper").setLabel("📄 Paper").setStyle(ButtonStyle.Primary),
                    new ButtonBuilder().setCustomId("rps_scissors").setLabel("✂️ Scissors").setStyle(ButtonStyle.Primary)
                );

                const embed = new EmbedBuilder()
                    .setTitle("Rock Paper Scissors")
                    .setDescription(
                        `Both players must now choose.\n\n` +
                        `**<@${game.challenger}>** vs **<@${game.opponent}>**`
                    )
                    .setColor("Blue");

                return interaction.update({
                    embeds: [embed],
                    components: [chooseRow]
                });
            }

            if (customId === "rps_decline") {

                game.stage = "declined";

                const embed = new EmbedBuilder()
                    .setTitle("Rock Paper Scissors")
                    .setDescription("❌ Challenge declined.")
                    .setColor("Red");

                client.rpsGames.delete(interaction.message.id);

                return interaction.update({
                    embeds: [embed],
                    components: []
                });
            }
        }

        // -------------------------
        //   PLAYER CHOICE
        // -------------------------
        if (game.stage === "playing") {

            if (![game.challenger, game.opponent].includes(interaction.user.id)) {
                return interaction.reply({
                    content: "You are not a player in this game.",
                    ephemeral: true
                });
            }

            const choice = customId.replace("rps_", "");

            game.choices[interaction.user.id] = choice;

            // If both played → evaluate game
            if (Object.keys(game.choices).length === 2) {

                const c1 = game.choices[game.challenger];
                const c2 = game.choices[game.opponent];

                const resolve = (p1, p2) => {
                    if (p1 === p2) return "tie";

                    if (
                        (p1 === "rock" && p2 === "scissors") ||
                        (p1 === "paper" && p2 === "rock") ||
                        (p1 === "scissors" && p2 === "paper")
                    ) return "challenger";

                    return "opponent";
                };

                const result = resolve(c1, c2);

                const winner =
                    result === "tie"
                        ? "It's a tie!"
                        : result === "challenger"
                            ? `<@${game.challenger}> wins!`
                            : `<@${game.opponent}> wins!`;

                const embed = new EmbedBuilder()
                    .setTitle("Rock Paper Scissors — Result")
                    .setColor("Green")
                    .setDescription(
                        `**<@${game.challenger}>** chose **${c1}**\n` +
                        `**<@${game.opponent}>** chose **${c2}**\n\n` +
                        `🎉 ${winner}`
                    );

                client.rpsGames.delete(interaction.message.id);

                return interaction.update({
                    embeds: [embed],
                    components: []
                });
            }

            return interaction.reply({
                content: "Your choice has been locked in!",
                ephemeral: true
            });
        }
    }

    // ===========================================
    //                MINESWEEPER
    // ===========================================

    if (!customId.startsWith("ms_")) return;

    if (!client.minesweeperGames) {
        return interaction.reply({
            content: "This game has expired.",
            ephemeral: true,
        });
    }

    const messageId = interaction.message.id;
    const game = client.minesweeperGames.get(messageId);

    if (!game) {
        return interaction.reply({
            content: "This game has expired.",
            ephemeral: true,
        });
    }

    if (interaction.user.id !== game.ownerId) {
        return interaction.reply({
            content: "This is not your game.",
            ephemeral: true,
        });
    }

    if (game.gameOver) {
        return interaction.reply({
            content: "The game is already over.",
            ephemeral: true,
        });
    }

    const [_, xStr, yStr] = customId.split("_");
    const x = parseInt(xStr);
    const y = parseInt(yStr);

    const {
        revealCell,
        checkWin,
        buildBoardComponents,
        revealAll
    } = require("../../utils/minesweeper");

    revealCell(game, x, y);

    const clicked = game.state[y][x];
    let description = "";

    if (clicked.value === "M") {
        game.gameOver = true;
        revealAll(game);
        description = "💥 You clicked on a mine. **Game over!**";
    } else if (checkWin(game)) {
        game.gameOver = true;
        revealAll(game);
        description = "✅ You revealed all safe tiles. **You win!**";
    } else {
        description =
            `Click the buttons to reveal the tiles.\n` +
            `Board size: **${game.width}×${game.height}**, Mines: **${game.mines}**`;
    }

    const embed = new EmbedBuilder()
        .setTitle("💣 Minesweeper")
        .setDescription(description)
        .setColor(0x3498db);

    const components = buildBoardComponents(game);

    await interaction.update({
        embeds: [embed],
        components,
    });

    if (game.gameOver) {
        client.minesweeperGames.delete(messageId);
    }
};
