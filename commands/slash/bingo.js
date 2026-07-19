const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    PermissionFlagsBits
} = require("discord.js");

// LET OP: Als je bestand 'bingogame.js' met kleine letters heet, verander "BingoGame" hieronder dan naar kleine letters!
const BingoGame = require("../../models/BingoGame");

const {
    generateBingoCard,
    getCardLayout
} = require("../../utils/bingoGenerator");

const config = require("../../config/bingoConfig");

const bingoCommand = {
    data: new SlashCommandBuilder()
        .setName("bingo")
        .setDescription("Bingo game commands")
        .addSubcommand(sub =>
            sub
                .setName("start")
                .setDescription("Start a bingo event")
        )
        .addSubcommand(sub =>
            sub
                .setName("join")
                .setDescription("Join the bingo event")
        )
        .addSubcommand(sub =>
            sub
                .setName("stop")
                .setDescription("Stop the bingo event")
        ),

    async run(client, interaction) {
        const command = interaction.options.getSubcommand();

        // =========================
        // START BINGO
        // =========================
        if(command === "start") {
            if(!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
                return interaction.reply({
                    content: "❌ You cannot start bingo.",
                    ephemeral: true
                });
            }

            const existingGame = await BingoGame.findOne({ active: true });

            if(existingGame) {
                return interaction.reply({
                    content: "❌ A bingo game is already running.",
                    ephemeral: true
                });
            }

            const organizerCard = generateBingoCard();

            const game = await BingoGame.create({
                active: true,
                channelId: interaction.channel.id,
                startedBy: interaction.user.id,
                registrationOpen: true,
                currentNumber: null,
                drawnNumbers: [],
                checkingClaim: false,
                players: [
                    {
                        userId: interaction.user.id,
                        card: organizerCard,
                        marked: []
                    }
                ],
                claims: []
            });

            const embed = new EmbedBuilder()
                .setTitle("🎱 Bingo Registration Open!")
                .setDescription(`A new bingo event has started!\n\nRegistration closes in **30 seconds**.\n\nUse:\n\n\`/bingo join\`\n\nto join the game.\n\nPlayers:\n\n${interaction.user}`)
                .setColor("#3498db");

            await interaction.reply({
                embeds: [embed],
                components: [
                    new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                        .setCustomId("bingo_status")
                        .setLabel("Players: 1")
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(true)
                    )
                ]
            });

            setTimeout(async () => {
                const currentGame = await BingoGame.findOne({ active: true });

                if(!currentGame) return;

                currentGame.registrationOpen = false;
                await currentGame.save();

                const startEmbed = new EmbedBuilder()
                    .setTitle("🎱 Bingo Starting!")
                    .setDescription(`Registration closed.\n\nPlayers:\n\n**${currentGame.players.length}**\n\nThe first number will appear soon.`)
                    .setColor("#00ff00");

                await interaction.editReply({
                    embeds: [startEmbed]
                });

                startDrawing(client, interaction, game._id);
            }, 30000);

            return;
        }

        // =========================
        // JOIN BINGO
        // =========================
        if(command === "join") {
            const game = await BingoGame.findOne({ active: true });

            if(!game) {
                return interaction.reply({
                    content: "❌ There is no active bingo game.",
                    ephemeral: true
                });
            }

            if(!game.registrationOpen) {
                return interaction.reply({
                    content: "❌ Registration is closed.",
                    ephemeral: true
                });
            }

            const alreadyJoined = game.players.find(player => player.userId === interaction.user.id);

            if(alreadyJoined) {
                return interaction.reply({
                    content: "❌ You already joined bingo.",
                    ephemeral: true
                });
            }

            const card = generateBingoCard();

            game.players.push({
                userId: interaction.user.id,
                card,
                marked: []
            });

            await game.save();

            return interaction.reply({
                content: `✅ ${interaction.user} joined bingo!`
            });
        }

        // =========================
        // STOP BINGO
        // =========================
        if(command === "stop") {
            const game = await BingoGame.findOne({ active: true });

            if(!game) {
                return interaction.reply({
                    content: "❌ There is no active bingo game.",
                    ephemeral: true
                });
            }

            if(game.startedBy !== interaction.user.id) {
                return interaction.reply({
                    content: "❌ Only the organizer can stop bingo.",
                    ephemeral: true
                });
            }

            await BingoGame.deleteMany({ active: true });

            return interaction.reply({
                content: "🛑 Bingo stopped."
            });
        }
    }
};

// =================================
// NUMBER DRAW SYSTEM
// =================================
async function startDrawing(client, interaction, gameId) {
    const channel = interaction.channel;
    let bingoMessage = null;

    const interval = setInterval(async () => {
        const game = await BingoGame.findById(gameId);

        if(!game) {
            clearInterval(interval);
            return;
        }
        
        // HIER KUN JE DE REST VAN JE GETALLEN-TREKSYSTEEM LOGICA PLATSEN
        
    }, 5000); // Trekt nu bijvoorbeeld elke 5 seconden een nummer (pas dit aan naar wens)
}

module.exports = bingoCommand;
