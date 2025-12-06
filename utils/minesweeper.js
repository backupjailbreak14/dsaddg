const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

// Create the internal game object (board + state)
function createGame(rawWidth, rawHeight, rawMines, ownerId) {
    let width = parseInt(rawWidth);
    let height = parseInt(rawHeight);
    let mines = parseInt(rawMines);

    if (isNaN(width)) width = 5;
    if (isNaN(height)) height = 5;

    // Discord limit: max 5 rows × 5 buttons
    width = Math.min(Math.max(width, 2), 5);
    height = Math.min(Math.max(height, 2), 5);

    const totalCells = width * height;

    if (isNaN(mines)) mines = Math.floor(totalCells / 5); // ~20% mines
    if (mines < 1) mines = 1;
    if (mines >= totalCells) mines = totalCells - 1;

    // create empty board
    const board = Array.from({ length: height }, () =>
        Array.from({ length: width }, () => 0)
    );

    // place mines
    let placed = 0;
    while (placed < mines) {
        const pos = Math.floor(Math.random() * totalCells);
        const x = pos % width;
        const y = Math.floor(pos / width);

        if (board[y][x] === "M") continue;
        board[y][x] = "M";
        placed++;
    }

    const directions = [
        [-1, -1], [0, -1], [1, -1],
        [-1,  0],          [1,  0],
        [-1,  1], [0,  1], [1,  1],
    ];

    // calculate numbers around mines
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (board[y][x] === "M") continue;

            let count = 0;
            for (const [dx, dy] of directions) {
                const nx = x + dx;
                const ny = y + dy;
                if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
                if (board[ny][nx] === "M") count++;
            }
            board[y][x] = count;
        }
    }

    // visible state for each cell
    const state = Array.from({ length: height }, (_, y) =>
        Array.from({ length: width }, (_, x) => ({
            revealed: false,
            value: board[y][x],
        }))
    );

    return {
        width,
        height,
        mines,
        board,
        state,
        ownerId,
        gameOver: false,
        createdAt: Date.now(),
    };
}

// Flood reveal for empty cells (value 0)
function revealCell(game, x, y) {
    if (x < 0 || y < 0 || x >= game.width || y >= game.height) return;

    const cell = game.state[y][x];
    if (cell.revealed) return;

    cell.revealed = true;

    // if it's a mine we stop here, gameOver gets handled outside
    if (cell.value === "M") {
        return;
    }

    // if it's empty, reveal neighbours
    if (cell.value === 0) {
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue;
                revealCell(game, x + dx, y + dy);
            }
        }
    }
}

// Check win state: all non-mine cells revealed
function checkWin(game) {
    for (let y = 0; y < game.height; y++) {
        for (let x = 0; x < game.width; x++) {
            const cell = game.state[y][x];
            if (cell.value !== "M" && !cell.revealed) {
                return false;
            }
        }
    }
    return true;
}

// Build Discord button grid from game state
function buildBoardComponents(game) {
    const rows = [];

    for (let y = 0; y < game.height; y++) {
        const row = new ActionRowBuilder();

        for (let x = 0; x < game.width; x++) {
            const cell = game.state[y][x];

            let label;
            let style = ButtonStyle.Secondary;
            let disabled = false;

            if (!cell.revealed) {
                label = "⬜"; // hidden cell (must NOT be empty)
            } else {
                disabled = true;

                if (cell.value === "M") {
                    label = "💣";
                    style = ButtonStyle.Danger;
                } else if (cell.value === 0) {
                    label = "⬛"; // empty cell, NOT blank
                    style = ButtonStyle.Secondary;
                } else {
                    label = String(cell.value);
                    style = ButtonStyle.Primary;
                }
            }

            row.addComponents(
                new ButtonBuilder()
                    .setCustomId(`ms_${x}_${y}`)
                    .setLabel(label)
                    .setStyle(style)
                    .setDisabled(disabled)
            );
        }

        rows.push(row);
    }

    return rows;
}

// Reveal all cells (used on game over)
function revealAll(game) {
    for (let y = 0; y < game.height; y++) {
        for (let x = 0; x < game.width; x++) {
            game.state[y][x].revealed = true;
        }
    }
}

module.exports = {
    createGame,
    revealCell,
    checkWin,
    buildBoardComponents,
    revealAll,
};
