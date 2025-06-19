const ROW_COUNT = 6;
const COL_COUNT = 5;
let currentRow = 0;
let currentCol = 0;
let isEntered = false;
let interval;
let isAnimationDone = true;
let correctLetters = 0;
let enteredWord = "";
let wordToGuess = "";
let isWordGuessed = false;

const firstRow = ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"];
const secondRow = ["A", "S", "D", "F", "G", "H", "J", "K", "L"];
const thirdRow = ["Enter", "Z", "X", "C", "V", "B", "U", "N", "M", "Delete"];
const rowItems = [firstRow, secondRow, thirdRow];

function createMap() {
    const container = document.querySelector('.board-container');

    for(let i = 0; i < ROW_COUNT; i++){
        const rowContainer = document.createElement('div');
        rowContainer.classList.add('row-item');
        rowContainer.id = `row-${i}`;
        for(let j = 0; j < COL_COUNT; j++){
            const fieldItem = document.createElement('div');
            fieldItem.id = `${i},${j}`;
            fieldItem.classList.add('field-item');
            rowContainer.append(fieldItem);
        }
        container.append(rowContainer);
    }
}

async function wordExists(word) {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
    return response.ok;
}

function createKeyboard() {
    const container = document.querySelector('.keyboard-container');
    const ROW_COUNT = 3;

    for(let i = 0; i < ROW_COUNT; i++){
        const rowContainer = document.createElement('div');
        rowContainer.classList.add('row-item');
        const items = rowItems[i];
        for(let j = 0; j < items.length; j++){
            const fieldItem = document.createElement('div');
            fieldItem.classList.add('keyboard-item');
            fieldItem.innerHTML = items[j];
            fieldItem.addEventListener("click", () => {
                if(fieldItem.innerHTML == "Delete"){
                    removeLetter();
                }
                else if(fieldItem.innerHTML == "Enter"){
                    animateLetterBackground();
                }
                else {
                    addLetter(fieldItem.innerHTML);
                }
            });
            rowContainer.append(fieldItem);
        }
        container.append(rowContainer);
    }
}

function processKeypress(key) {
    const keyUppercase = key.toUpperCase();
    const elements = firstRow.concat(secondRow, thirdRow);
    if (elements.includes(keyUppercase) || elements.includes(key)){
        console.log(key)
        if(key == "Enter"){
            if(currentCol == 4){
                isEntered = true;
                isAnimationDone = false;
            }
            animateLetterBackground();
            return;
        }
        addLetter(keyUppercase);
    }
    else {
        return;
    }
}

function countCorrectLetters(word1, word2) {
    let lettersMatched = 0;
    for(let i = 0; i < word1.length; i++){
        if(word1[i] === word2[i]){
            lettersMatched++;
        }
    }
    return lettersMatched;
}

async function addLetter(letterValue) {
    const id = currentRow + "," + currentCol;
    const element = document.getElementById(id);
    if(isAnimationDone){
        element.innerHTML = letterValue;
        element.classList.add('scale-up-center');
        if(currentCol == 4 && isEntered){
            if(await wordExists(enteredWord)){
                // currentRow++;
                // currentCol = 0;
                isEntered = !isEntered;
            }
        }
        else if(currentCol < 4){
            currentCol++;
        }
    }
    element.addEventListener("animationend", () => {
        element.classList.remove('scale-up-center');
        setTimeout(() => {
            isAnimationDone = true;
            let enteredWord = "";
            for (let i = 0; i < COL_COUNT; i++){
                const id = currentRow + "," + i;
                const element = document.getElementById(id);
                enteredWord += element.innerHTML;
            }
            correctLetters = countCorrectLetters(enteredWord.toLowerCase(), wordToGuess);
            if(correctLetters == 5){
                isWordGuessed = true;
                console.log("win")
            }
            correctLetters = 0;
        }, 2000);
    });
}

async function getFiveLetterWords() {
    const text = await fetch("words.txt");
    return text.text();
}

function removeLetter() {
    const id = currentRow + "," + currentCol;
    const element = document.getElementById(id);
    element.innerHTML = "";
    if(currentCol != 0){
        currentCol--;
    }
}

async function animateLetterBackground() {
    enteredWord = "";
    const rowElements = [];
    for (let i = 0; i < COL_COUNT; i++){
        const id = currentRow + "," + i;
        const element = document.getElementById(id);
        enteredWord += element.innerHTML;
        rowElements.push(element);
    }
    if(await wordExists(enteredWord)){
        setTimeout(() => {
            currentCol = 0;
            currentRow++;
        }, 1000);
    }
    else{
        for (let j = 0; j < rowElements.length; j++){
            const rowElement = rowElements[j];
            rowElement.classList.add('wobble-hor-bottom');
            rowElement.addEventListener("animationend", () => {
                rowElement.classList.remove('wobble-hor-bottom');
            });
        }
        return;
    }
    const elements = document.querySelectorAll('#row-' + currentRow)[0].childNodes;
    let i = 0;
    interval = setInterval(() => {
        animateGrid(elements, i);
        i++;
    }, 500);
}

function checkLetter(enteredLetter, indexInWord) {
    if(wordToGuess[indexInWord] == enteredLetter.toLowerCase()){
        return "bg-animate-correct-position";
    }
    else if(wordToGuess[indexInWord] !== enteredLetter.toLowerCase() && wordToGuess.includes(enteredLetter.toLowerCase())){
        return "bg-animate-correct-letter";
    }
    else {
        return "bg-animate-incorrect";
    }
}

function animateGrid(elements, index) {
    if(index < elements.length){
        const cssClass = checkLetter(elements[index].innerHTML, elements[index].id.split(",")[1]);
        elements[index].classList.add(cssClass);
    }
    else {
        clearInterval(interval);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    createMap();
    createKeyboard();
    getFiveLetterWords().then((text) => {
        const lines = text.split("\n");
        const startDate = new Date(2024, 0, 1);
        const today = new Date();
        const diffTime = today.setHours(0,0,0,0) - startDate.setHours(0,0,0,0);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        wordToGuess = lines[diffDays % lines.length].replace("\r", "");
    });
});

document.addEventListener("keydown", (event) => {
    if(isAnimationDone && !isWordGuessed){
        if(event.key === 'Backspace'){
            removeLetter();
        }
        processKeypress(event.key);
    }
});