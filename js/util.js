'use strict';

function buildBoard() {
    var board = [];
    for (var i = 0; i < gLevel.SIZE; i++) {
        board[i] = [];
        for (var j = 0; j < gLevel.SIZE; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false,
                content: EMPTY
            };
        }
    }
    return board;
}

function renderBoard() {
    var strHTML = '';
    for (var i = 0; i < gLevel.SIZE; i++) {
        strHTML += '<tr>';
        for (var j = 0; j < gLevel.SIZE; j++) {
            var className = 'cell cell' + i + '-' + j;
            strHTML += `<td class="${className}" onclick="cellClicked(${i},${j})" oncontextmenu="cellRightClicked(${i},${j})"></td>`
        }
        strHTML += '</tr>';
    }

    var elTbody = document.querySelector('tbody');
    elTbody.innerHTML = strHTML;
}

function renderCell(i, j, inner) {
    var cellSelector = '.cell' + i + '-' + j;
    var elCell = document.querySelector(cellSelector);
    elCell.innerText = inner;
}

//just for debugging
function renderCells() {
    var inner;
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            inner = (gBoard[i][j].content==MINE)? gBoard[i][j].content: gBoard[i][j].minesAroundCount;
            renderCell(i, j, inner);
        }
    }
}

function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function startClock(){
    var elClock = document.querySelector('.clock');
    var startTime = Date.now();
    gInterval = setInterval(function(){
        var diff = (Date.now() - startTime);
        var str = Math.floor(diff / 1000) +'.'+ Math.floor((diff /100))%10
        elClock.innerText = str;
    },100)
}