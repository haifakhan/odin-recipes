const recipes = {
    alfredo: {
        steps: [
            { type: "progress", duration: 5000, instruction: "Boiling water..." },
            { type: "drag", ingredient: "pasta", target: "pot", instruction: "Drag pasta to pot!" },
            { type: "click", target: "stir", count: 10, instruction: "Quick! Stir 10 times!" },
            { type: "drag", ingredient: "cheese", target: "pot", instruction: "Add Parmesan cheese!" }
        ]
    }
};

let currentStep = 0;
let score = 0;
let timeLeft = 60;
let gameTimer;
let gameEnded = false;

document.getElementById('start-btn').addEventListener('click', startGame);

function startGame() {
    document.getElementById('start-btn').disabled = true;
    document.getElementById('start-btn').classList.remove('cooking-game-button');
    document.getElementById('start-btn').classList.add('disabled-button');
    startTimer();
    loadStep(recipes.alfredo.steps[currentStep]);
}

function startTimer() {
    gameTimer = setInterval(() => {
        timeLeft--;
        document.getElementById('time').textContent = timeLeft;
        
        if(timeLeft <= 0) endGame(false);
    }, 1000);
}

function loadStep(step) {
    const gameArea = document.getElementById('game-area');
    gameArea.innerHTML = '';
    
    // Display instruction
    const instruction = document.createElement('div');
    instruction.className = 'step-instruction';
    instruction.textContent = step.instruction;
    gameArea.appendChild(instruction);

    // Handle different step types
    switch(step.type) {
        case 'progress':
            createProgressBar(step.duration);
            break;
        case 'drag':
            createDragStep(step.ingredient, step.target);
            break;
        case 'click':
            createClickStep(step.target, step.count);
            break;
    }
}

function createProgressBar(duration) {
    const progressContainer = document.createElement('div');
    progressContainer.className = 'progress-bar';
    const progressFill = document.createElement('div');
    progressFill.className = 'progress-fill';
    progressContainer.appendChild(progressFill);
    document.getElementById('game-area').appendChild(progressContainer);

    const startTime = Date.now();
    const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const width = (elapsed / duration) * 100;
        progressFill.style.width = `${width}%`;

        if(elapsed >= duration) {
            clearInterval(interval);
            handleStepCompletion();
        }
    }, 100);
}

function createDragStep(ingredient, target) {
    // Create draggable ingredient
    const ingredientImg = document.createElement('img');
    ingredientImg.src = `../img/${ingredient}.png`;
    ingredientImg.className = 'ingredient';
    ingredientImg.draggable = true;
    ingredientImg.style.left = '100px';
    ingredientImg.addEventListener('dragstart', handleDragStart);

    // Create target area
    const targetArea = document.createElement('div');
    targetArea.className = 'draggable-area';
    targetArea.id = target;
    targetArea.addEventListener('dragover', handleDragOver);
    targetArea.addEventListener('drop', handleDrop);

    document.getElementById('game-area').appendChild(ingredientImg);
    document.getElementById('game-area').appendChild(targetArea);
}

function createClickStep(target, requiredCount) {
    const stirButton = document.createElement('button');
    stirButton.textContent = 'STIR!';
    stirButton.className = 'cooking-game-button moving-button';
    stirButton.style.margin = '20px';
    
    let clickCount = 0;
    stirButton.addEventListener('click', () => {
        clickCount++;
        if(clickCount >= requiredCount) {
            score += 50;
            updateScore();
            handleStepCompletion();
        }
    });

    document.getElementById('game-area').appendChild(stirButton);
    moveButtonRandomly(stirButton);
}

function moveButtonRandomly(button) {
    const gameArea = document.getElementById('game-area');
    setInterval(() => {
        const x = Math.random() * (gameArea.offsetWidth - button.offsetWidth);
        const y = Math.random() * (gameArea.offsetHeight - button.offsetHeight);
        button.style.position = 'absolute';
        button.style.left = `${x}px`;
        button.style.top = `${y}px`;
    }, 1000);
}

function handleStepCompletion() {
    currentStep++;
    score += 100;
    updateScore();

    if(currentStep >= recipes.alfredo.steps.length) {
        endGame(true);
    } else {
        loadStep(recipes.alfredo.steps[currentStep]);
    }
}

function resetGame() {
    currentStep = 0;
    score = 0;
    timeLeft = 60;
    gameEnded = false;
    clearInterval(gameTimer);
    document.getElementById('start-btn').disabled = false;
    document.getElementById('start-btn').classList.remove('disabled-button');
    document.getElementById('start-btn').classList.add('cooking-game-button');
    document.getElementById('restart-btn').style.display = 'none';
    document.getElementById('result-message').textContent = '';
    document.getElementById('score').textContent = '0';
    document.getElementById('time').textContent = '60';
    document.getElementById('game-area').innerHTML = '';
}

function endGame(success) {
    gameEnded = true;
    clearInterval(gameTimer);
    const resultMessage = document.getElementById('result-message');
    
    if(success) {
        resultMessage.textContent = `READY TO EAT! Final Score: ${score}`;
        resultMessage.style.color = 'green';
        const cookedPastaImg = document.createElement('img');
        cookedPastaImg.src = '../img/cooked-pasta.png';
        cookedPastaImg.className = 'cooked-pasta';
        document.getElementById('game-area').appendChild(cookedPastaImg);
    } else {
        resultMessage.textContent = 'TIME\'S UP! Try again!';
        resultMessage.style.color = 'red';
    }

    // Show restart button
    document.getElementById('restart-btn').style.display = 'block';
}

// Add event listener for restart button
document.getElementById('restart-btn').addEventListener('click', () => {
    resetGame();
});

function updateScore() {
    document.getElementById('score').textContent = score;
}

// Drag and Drop handlers
function handleDragStart(e) {
    if (!gameEnded) {
        e.dataTransfer.setData('text/plain', e.target.src);
    }
}

function handleDragOver(e) {
    e.preventDefault();
}

function handleDrop(e) {
    if (!gameEnded) {
        e.preventDefault();
        const ingredientSrc = e.dataTransfer.getData('text/plain');
        if(ingredientSrc.includes('pasta') || ingredientSrc.includes('cheese')) {
            score += 30;
            updateScore();
            handleStepCompletion();
        }
    }
}