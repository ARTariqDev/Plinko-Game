// Declare global variables
let selectedColor = '';
let earnings = 3000;

document.addEventListener("DOMContentLoaded", function () {
    // Get the input element and buttons
    const betInput = document.getElementById('bet');
    const plusButton = document.getElementById('plus');
    const minusButton = document.getElementById('minus');

    // Define the plus and minus functions
    function plus() {
        let currentBet = parseInt(betInput.value, 10);
        if (isNaN(currentBet)) {
            currentBet = 0;
        }
        currentBet++;
        betInput.value = currentBet;
    }

    function minus() {
        let currentBet = parseInt(betInput.value, 10);
        if (isNaN(currentBet)) {
            currentBet = 0;
        }
        if (currentBet > 0) {
            currentBet--;
        }
        betInput.value = currentBet;
    }

    // Attach event listeners to buttons
    plusButton.addEventListener('click', plus);
    minusButton.addEventListener('click', minus);
});

// Multiplier table for colors
const multipliers = {
    green: [18, 3.2, 1.6, 1.3, 1.2, 1.1, 1, 0.5, 1, 1.1, 1.2, 1.3, 1.6, 3.2, 18],
    yellow: [55, 12, 5.6, 3.2, 1.6, 1, 0.7, 0.2, 0.7, 1, 1.6, 3.2, 5.6, 12, 55],
    red: [353, 49, 14, 5.3, 2.1, 0.5, 0.2, 0, 0.2, 0.5, 2.1, 5.3, 14, 49, 353]
};

// Matter.js setup
const Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Bodies = Matter.Bodies,
    Composite = Matter.Composite,
    Events = Matter.Events;

const engine = Engine.create();
const render = Render.create({
    element: document.getElementById('plinkoCanvas'),
    engine: engine,
    options: {
        width: 400,
        height: 600,
        wireframes: false,
        background: '#57c4e5' // Match the aesthetic background
    }
});

Render.run(render);
const runner = Runner.create();
Runner.run(runner, engine);

// Set up Plinko board
function setupPlinkoBoard() {
    const ROWS = 12;
    const COLS = 15;
    const PEG_RADIUS = 10;
    const SLOT_WIDTH = 40;
    const ROW_HEIGHT = 40;

    // Ground
    const ground = Bodies.rectangle(200, 590, 400, 20, { isStatic: true });
    Composite.add(engine.world, ground);

    // Left and right boundary walls
    const wallOptions = { isStatic: true, render: { fillStyle: '#888' } };
    const leftWall = Bodies.rectangle(-10, 300, 20, 600, wallOptions);
    const rightWall = Bodies.rectangle(410, 300, 20, 600, wallOptions);
    Composite.add(engine.world, [leftWall, rightWall]);

    // Add pegs
    for (let row = 0; row < ROWS - 3; row++) { // Leave space for the multiplier rows
        for (let col = row % 2; col < COLS; col += 2) {
            const x = col * (400 / COLS) + (400 / COLS / 2);
            const y = row * (600 / ROWS) + (600 / ROWS / 2);
            const peg = Bodies.circle(x, y, PEG_RADIUS, { isStatic: true, render: { fillStyle: '#fff' } });
            Composite.add(engine.world, peg);
        }
    }

    // Add multiplier rows
    const colors = ['green', 'yellow', 'red'];
    for (let row = 0; row < 3; row++) {
        const y = 600 - (ROW_HEIGHT * (3 - row)); // Bottom 3 rows
        const color = colors[row];
        const rowMultipliers = multipliers[color];

        for (let col = 0; col < COLS; col++) {
            const x = col * SLOT_WIDTH + SLOT_WIDTH / 2;

            // Create visual-only slots
            const slot = Bodies.rectangle(x, y, SLOT_WIDTH, 10, {
                isStatic: true,
                isSensor: true, // Does not block balls
                render: { fillStyle: 'transparent' },
                label: `${color}-slot`,
                index: col
            });
            Composite.add(engine.world, slot);

            // Display multiplier labels
            const label = document.createElement('div');
            label.textContent = `${rowMultipliers[col]}`;
            label.style.position = 'absolute';
            label.style.left = `${x - SLOT_WIDTH / 2}px`;
            label.style.bottom = `${600 - y - 20}px`;
            label.style.width = `${SLOT_WIDTH}px`;
            label.style.textAlign = 'center';
            label.style.color = 'black';
            label.style.backgroundColor = color;
            label.style.border = 'solid black 0.1em'
            label.style.fontWeight = 'bold';
            label.style.fontSize = '12px';
            document.getElementById('plinkoCanvas').appendChild(label);
        }
    }
}
setupPlinkoBoard();

// Function to handle color selection
function selectColor(color) {
    selectedColor = color;
    document.getElementById('result').textContent = `Selected color: ${color}`;
}

// Function to start the game
function startGame() {
    const betAmount = parseInt(document.getElementById('bet').value, 10);
    if (!selectedColor || betAmount <= 0) {
        alert('Please select a color and enter a valid bet!');
        return;
    }

    dropBall(betAmount);
}

// Function to drop a ball
function dropBall(betAmount) {
    const randomX = Math.random() * 300 + 50; // Random x position within canvas width
    const ball = Bodies.circle(randomX, 50, 10, { 
        restitution: 0.5, 
        render: { fillStyle: selectedColor },
        label: 'Ball' // Adding a label for identification
    });

    Composite.add(engine.world, ball);

    // Listen for collisions with slots
    const collisionHandler = (event) => {
        event.pairs.forEach(pair => {
            const { bodyA, bodyB } = pair;
            const ballBody = bodyA.label === 'Ball' ? bodyA : bodyB.label === 'Ball' ? bodyB : null;
            const slotBody = bodyA.label.includes('-slot') ? bodyA : bodyB.label.includes('-slot') ? bodyB : null;

            if (ballBody && slotBody && slotBody.label.includes(selectedColor)) {
                const slotIndex = slotBody.index; // Custom property to track the slot index
                const payout = multipliers[selectedColor][slotIndex];
                const winnings = betAmount * payout;
                earnings += winnings;

                document.getElementById('earnings-value').textContent = earnings;
                document.getElementById('result').textContent = `Slot ${slotIndex + 1} | Multiplier: ${payout} | Winnings: $${winnings}`;

                // Remove the ball after collision
                Composite.remove(engine.world, ballBody);

                // Remove this collision listener to avoid redundant checks
                Events.off(engine, 'collisionStart', collisionHandler);
            }
        });
    };

    Events.on(engine, 'collisionStart', collisionHandler);

    // Automatically remove the ball after it falls out of bounds
    setTimeout(() => {
        if (ball && Composite.allBodies(engine.world).includes(ball)) {
            Composite.remove(engine.world, ball);
        }
    }, 5000); // 5 seconds to clear the ball in case it doesn't hit a slot

    // Function to make the ball bounce off walls
    const wallBounceHandler = () => {
        const ballVelocity = ball.velocity;

        // Check for ball touching left or right wall
        if (ball.position.x <= 10 || ball.position.x >= 390) {
            // Reverse the x-velocity (bounce effect)
            Matter.Body.setVelocity(ball, {
                x: -ballVelocity.x,
                y: ballVelocity.y
            });
        }
    };

    // Continuously check for wall collisions and make the ball bounce
    setInterval(wallBounceHandler, 100);
}
