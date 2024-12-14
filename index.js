const baseUrl = 'https://pokeapi.co/api/v2/pokemon/'

const startGameEl = document.querySelector('#start-game')
const gameEl = document.querySelector('#game')
const endGameEl = document.querySelector('#end-game')

const levelOptionEl = document.querySelector('#level-option')
const game = document.querySelector('.game-container')
const btnStartGame = document.querySelector('#btn-start-game')

const endTime = document.querySelector('.time-info p')
const endStep = document.querySelector('.step-info p')
const btnRestart = document.querySelector('#btn-restart')
const btnReload = document.querySelector('#btn-reload')

const timeEl = document.querySelector('#time')
const stepEl = document.querySelector('#step')

let level;
let inactiveBoard = false;
let firstCard = null;
let secondCard = null;

let time = 0;
let score = 0;
let step = 0;
let interval;

let sizes = {
    8: {
        row: 4,
        col: 4,
    },
    12: {
        row: 4,
        col: 6,
    },
    16: {
        row: 4,
        col: 8,
    },
};

let cards = [];



//Fetch Pokemon API
async function fetchPokemonByIds(count) {
    const pokemonList = [];
    const maxPokemonId = 151;
    const ids = new Set();
    
    // Get random Ids
    while(ids.size < count) {
        ids.add(Math.ceil(Math.random() * maxPokemonId));
    }
    
    for(const id of ids) {
        const response = await fetch (`${baseUrl}${id}`);;
        const data = await response.json()
        pokemonList.push({
            name: data.name,
            image_url: data.sprites.front_default,
            type: data.types[0]?.type?.name,
        })
    }
    return pokemonList;
}

//Function to shuffle the array
function shuffle(arr) {
    return arr.sort(() => 0.5 - Math.random());
}

//Function to render the cards
async function renderCards(level) {
    // Fetch the pokemon cards based on the level
    const pokemonData = await fetchPokemonByIds(level);
    
    // Duplicate and shuffle cards
    let cards = shuffle([...pokemonData, ...pokemonData]);
    
    //Set the Grid sizes to display the cards
    const size = sizes[level];
    game.style.display = 'grid';
    game.style.gridTemplateColumns = `repeat(${size.col}, 200px)`;
    game.style.gridTemplateRows = `repeat(${size.row}, 250px)`;
    
    // Display cards
    game.innerHTML = '';
    cards.forEach(card => {
        game.innerHTML += `
        <div class="pokemon-card" data-name="${card.name}" onClick="flipCard(this)">
        <div class="front"></div>
        <div class="back">
        <img src="${card.image_url}" alt="${card.name}">
        <h3>${card.name}</h3>
        <p>${card.type}</p>
        </div>
        </div>
        `
    })
}

// Function to flip card
function flipCard(card) {
    if(inactiveBoard || card === firstCard) return;

    card.classList.toggle('flip');

    if(!firstCard) {
        firstCard = card;
        return;
    }

    secondCard = card;
    checkCardMatch();
    updateSteps();
}

//Check card match
function checkCardMatch() {
    let isMatch = firstCard.dataset.name === secondCard.dataset.name;

    isMatch ? disableCards() : unflipCards();
}

//If both card match
function disableCards() {
    firstCard.removeEventListener('click', flipCard);
    secondCard.removeEventListener('click', flipCard);

    resetBoard();

    score++;
    checkWin()
}

//Unflip the unmatched cards
function unflipCards() {
    lockCard = true;
    setTimeout(() => {
        firstCard.classList.remove('flip')
        secondCard.classList.remove('flip')
        resetBoard()
    }, 500);
}

//Reset Board
function resetBoard() {
    inactiveBoard = false;
    firstCard = null;
    secondCard = null;
}


//Check if the game is won
function checkWin() {
    if(score === level) {
        clearInterval(interval);
        setTimeout(() => {
            gameEl.style.display = 'none';
            endGameEl.style.display = 'flex';
            updateEndGame();
        }, 1000)
    }
}
console.log(score)
//Update the time in game control
function updateTimer() {
    time++;
    timeEl.innerText = convertTime(time)
}

//Counting timer and convert to mm:ss
function convertTime(time) {
    const minutes = `0${Math.floor(time / 60)}`.slice(-2);
    const seconds = `0${time % 60}`.slice(-2);
    return `${minutes}:${seconds}`;
}

//Update Steps in game control
function updateSteps() {
    step++;
    stepEl.innerText = `${step} steps`;
}

//Update End Game
function updateEndGame() {
    endTime.innerText = convertTime(time)
    endStep.innerText = `${step} steps`
}

//Start game
btnStartGame.addEventListener('click', async function() {
    level = Number(levelOptionEl.value)
    startGameEl.style.display='none';
    gameEl.style.display ='flex';
    
    await renderCards(level);

    interval = setInterval(updateTimer, 1000)
})

//Restart the Game
btnRestart.addEventListener('click', async () => {
    score = 0;
    time = 0;
    step = 0

    timeEl.innerText = convertTime(time);
    stepEl.innerText = `${step} steps`;

    interval = setInterval(updateTimer,1000);
    
    await renderCards(level)

    endGameEl.style.display = 'none';
    gameEl.style.display = 'flex';
})

// Reload the Page
btnReload.addEventListener('click', () => {
    window.location.reload()
})