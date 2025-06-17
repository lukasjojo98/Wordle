const ROW_COUNT = 6;
const COL_COUNT = 5;
let currentRow = 0;
let currentCol = 0;
let isEntered = false;
let interval;
let isAnimationDone = true;
let correctLetters = 0;
const word = "party";

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

function addLetter(letterValue) {
    const id = currentRow + "," + currentCol;
    const element = document.getElementById(id);
    if(isAnimationDone){
        element.innerHTML = letterValue;
        element.classList.add('scale-up-center');
        if(currentCol == 4 && isEntered){
            currentCol = 0;
            currentRow++;
            isEntered = !isEntered;
        }
        else if(currentCol < 4){
            currentCol++;
        }
    }
    element.addEventListener("animationend", () => {
        element.classList.remove('scale-up-center');
        setTimeout(() => {
            isAnimationDone = true;
            if(correctLetters == 5){
                alert("Win!");
            }
            correctLetters = 0;
        }, 3000);
    });
}

function removeLetter() {
    const id = currentRow + "," + currentCol;
    const element = document.getElementById(id);
    element.innerHTML = "";
    if(currentCol != 0){
        currentCol--;
    }
}

function animateLetterBackground() {
    const elements = document.querySelectorAll('#row-' + currentRow)[0].childNodes;
    let i = 0;
    interval = setInterval(() => {
        animateGrid(elements, i);
        i++;
    }, 500);
}

function checkLetter(enteredLetter, indexInWord) {
    if(word[indexInWord] == enteredLetter.toLowerCase()){
        return "bg-animate-correct-position";
    }
    else if(word[indexInWord] !== enteredLetter.toLowerCase() && word.includes(enteredLetter.toLowerCase())){
        return "bg-animate-correct-letter";
    }
    else {
        return "bg-animate-incorrect";
    }
}

function animateGrid(elements, index) {
    if(index < elements.length){
        const cssClass = checkLetter(elements[index].innerHTML, elements[index].id.split(",")[1]);
        if(cssClass == "bg-animate-correct-position"){
            correctLetters++;
        }
        elements[index].classList.add(cssClass);
    }
    else {
        clearInterval(interval);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    createMap();
    createKeyboard();
});

document.addEventListener("keydown", (event) => {
    if(isAnimationDone){
        if(event.key === 'Backspace'){
            removeLetter();
        }
        processKeypress(event.key);
    }
});