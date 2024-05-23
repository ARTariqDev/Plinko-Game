let incrementInterval;
let decrementInterval;
let selectedColor = '';
let earnings = 0;
let multipliers = [
    [18, 3.2, 1.6, 1.3, 1.2, 1.1, 1, 0.5, 1, 1.1, 1.2, 1.3, 1.6, 3.2, 18],
    [55, 12, 5.6, 3.2, 1.6, 1, 0.7, 0.2, 0.7, 1, 1.6, 3.2, 5.6, 12, 55],
    [555, 49, 14, 5.3, 2.1, 0.5, 0.2, 0, 0.2, 0.5, 2.1, 5.3, 14, 49, 555]
];

function plus() {
    let betElement = document.getElementById('bet');
    let betValue = parseInt(betElement.value, 10); // Convert the input value to an integer
    betValue += 1; // Increment the value by 1
    betElement.value = betValue; // Update the input value with the new value
}

function minus() {
    let betElement = document.getElementById('bet');
    let betValue = parseInt(betElement.value, 10); // Convert the input value to an integer
    if (betValue > 0) { // Ensure the value doesn't go below 0
        betValue -= 1; // Decrement the value by 1
        betElement.value = betValue; // Update the input value with the new value
    }
}

function startIncrement() {
    plus(); // Increment immediately on mousedown
    incrementInterval = setInterval(plus, 100); // Continue incrementing every 100ms
}

function stopIncrement() {
    clearInterval(incrementInterval);
}

function startDecrement() {
    minus(); // Decrement immediately on mousedown
    decrementInterval = setInterval(minus, 100); // Continue decrementing every 100ms
}

function selectColor(color) {
    selectedColor = color;
    document.getElementById('result').textContent = `Selected color: ${color}`;
}

function startGame() {
    if (!selectedColor) {
        alert('Please select a color first!');
        return;
    }
    
    let betAmount = parseInt(document.getElementById('bet').value, 10);
    if (betAmount <= 0) {
        alert('Please enter a valid bet amount!');
        return;
    }

    let outcomeSlot = simulatePlinko(15);
    let payout = calculatePayout(outcomeSlot, selectedColor);
    let resultAmount = betAmount * payout;

    // Update earnings
    earnings += resultAmount - betAmount;
    document.getElementById('earnings').textContent = `Earnings: ${earnings}`;
    
    document.getElementById('result').textContent = `Outcome slot: ${outcomeSlot}, Multiplier: ${payout}, Payout: ${resultAmount}`;
}

function simulatePlinko(levels) {
    let position = 0;
    for (let i = 0; i < levels; i++) {
        position += Math.random() < 0.5 ? -1 : 1;
    }
    position = Math.max(0, Math.min(levels - 1, position + Math.floor(levels / 2)));
    return position;
}

function calculatePayout(slot, color) {
    let colorIndex;
    if (color === 'green') {
        colorIndex = 0;
    } else if (color === 'yellow') {
        colorIndex = 1;
    } else if (color === 'red') {
        colorIndex = 2;
    }
    return multipliers[colorIndex][slot];
}
