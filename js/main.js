'use strict';
const MINE = '💣';
const EMPTY = ' ';
const FLAG = '🚩';
const SMILEY = '🤓';
const SMILEY_DEAD = '☠️';
const SMILEY_HAPPY = '😎';
const LIFE = '❤️';

var gBoard = [];
var gLevel = {
    SIZE: 4,
    MINES: 2
};
var gElSmiley = document.querySelector('.smiley');

var gHintIsOn = false;

var gMines = [];
var gFlagsMarked;
var gInterval;
var gLives = 3;
var gHints = 3;
var gGame = {
    isOn: false,
    shownCount: 0,
    minesMarkedCount: 0
}

// //clear all records on restart
// localStorage.setItem("level4", null);
// localStorage.setItem("level8", null);
// localStorage.setItem("level12", null);

function init() {
    gGame = {
        isOn: false,
        shownCount: 0,
        minesMarkedCount: 0
    }
    gMines = [];
    gFlagsMarked = 0;
    gLives = 3;
    gHints = 3;
    clearInterval(gInterval);
    gBoard = buildBoard();
    // console.log(gBoard);

    renderBoard();
    renderScore();
    renderLives();
    renderFlags();
    renderHints();
    gElSmiley.innerText = SMILEY;
}

function levels(size) {
    // console.log('levels', size);
    switch (size) {
        case 4:
            gLevel = {
                SIZE: 4,
                MINES: 2
            };
            break;
        case 8:
            gLevel = {
                SIZE: 8,
                MINES: 12
            };
            break;
        case 12:
            gLevel = {
                SIZE: 12,
                MINES: 30
            };
            break;
    }
    init();
}

function setMines(firstI, firstJ) {
    while (gMines.length < gLevel.MINES) {
        var i = getRandomIntInclusive(0, gLevel.SIZE - 1);
        var j = getRandomIntInclusive(0, gLevel.SIZE - 1);
        if (firstI == i && firstJ == j) continue;

        if (gBoard[i][j].content === EMPTY) {
            gBoard[i][j].content = MINE;
            gBoard[i][j].isMine = true;
            gMines.push({ i: i, j: j })
        }
    }
    //console.log('set mines', gMines, gBoard);
    // renderCells();
}

function cellClicked(i, j) {
    if (!gGame.isOn && !gGame.shownCount) {
        setMines(i, j);
        gGame.isOn = true;
        boardNegsMinesCount();
        startClock();
    }
    if (!gGame.isOn) return;

    if (gHintIsOn) {
        gHintIsOn = false;
        for (var idx = i - 1; idx <= i + 1; idx++) {
            if (idx < 0 || idx > gLevel.SIZE - 1) continue;
            for (var jIdx = j - 1; jIdx <= j + 1; jIdx++) {
                if (jIdx < 0 || jIdx > gLevel.SIZE - 1) continue;

                if (gBoard[idx][jIdx].isMine) {
                    renderCell(idx, jIdx, gBoard[idx][jIdx].content);
                } else renderCell(idx, jIdx, gBoard[idx][jIdx].minesAroundCount);
            }
        }

        setTimeout(function () {
            for (var idx = i - 1; idx <= i + 1; idx++) {
                if (idx < 0 || idx > gLevel.SIZE - 1) continue;
                for (var jIdx = j - 1; jIdx <= j + 1; jIdx++) {
                    if (jIdx < 0 || jIdx > gLevel.SIZE - 1) continue;

                    if (gBoard[idx][jIdx].isShown) {
                        continue;
                    } else if (gBoard[idx][jIdx].isMarked) {
                        renderCell(idx, jIdx, FLAG);
                    } else renderCell(idx, jIdx, EMPTY);
                }
            }
        }, 1000)
        return;
    }

    if (gBoard[i][j].isMarked) return;

    if (gBoard[i][j].isMine) {
        if (gLives) {
            gLives--;
            var elModal = document.querySelector('.modal');
            elModal.style.display = 'block';
            elModal.innerText = MINE;
            setTimeout(function () {
                elModal.style.display = 'none';
            }, 1000)

            renderLives();
        } else gameOverCheck(i, j, 'mine');
    }

    if (gBoard[i][j].minesAroundCount != 0 && !gHintIsOn) {
        gBoard[i][j].isShown = true;
        renderCell(i, j, gBoard[i][j].minesAroundCount);
        gGame.shownCount++;
    }

    if (gBoard[i][j].minesAroundCount == 0 && !gBoard[i][j].isMine) zero(i, j);

    if (gGame.shownCount == (gLevel.SIZE * gLevel.SIZE - gLevel.MINES)) gameOverCheck(i, j, 'shown');
}

function cellRightClicked(i, j) {
    event.preventDefault();
    if (!gGame.isOn) return;
    if (gBoard[i][j].isMarked) {
        gFlagsMarked--;
        gBoard[i][j].isMarked = false;
        renderCell(i, j, EMPTY);
        renderFlags();

        if (gBoard[i][j].isMine) {
            gGame.minesMarkedCount--;
        }
        return;
    }

    if (gBoard[i][j].isShown) return;

    if (gFlagsMarked == gLevel.MINES) return;

    if (gBoard[i][j].isMine) {
        gGame.minesMarkedCount++;
        if (gGame.minesMarkedCount == gLevel.MINES) gameOverCheck(i, j, 'flags');
    }

    gFlagsMarked++;
    gBoard[i][j].isMarked = true;
    renderCell(i, j, FLAG);
    renderFlags();
}

function gameOverCheck(i, j, reason) {
    if (reason == 'flags') {
        if (gGame.shownCount == (gLevel.SIZE * gLevel.SIZE - gLevel.MINES)) {
            // console.log('WIN!');
            saveScore();
            renderScore();
            gElSmiley.innerText = SMILEY_HAPPY;
        }
    }

    if (reason == 'shown') {
        if (gGame.minesMarkedCount == gLevel.MINES) {
            // console.log('WIN!');
            saveScore();
            renderScore();
            gElSmiley.innerText = SMILEY_HAPPY;
        }
    }

    if (reason == 'mine') {
        // console.log('MINE!');
        gBoard[i][j].isShown = true;
        for (var i = 0; i < gMines.length; i++) {
            renderCell(gMines[i].i, gMines[i].j, MINE);

            if (gBoard[gMines[i].i][gMines[i].j].isMarked) {
                var cellSelector = '.cell' + gMines[i].i + '-' + gMines[i].j;
                document.querySelector(cellSelector).classList.add('mineGreen');
            } else {
                var cellSelector = '.cell' + gMines[i].i + '-' + gMines[i].j;
                document.querySelector(cellSelector).classList.add('mineRed');
            }
        }
        clearInterval(gInterval);
        gGame.isOn = false;
        gElSmiley.innerText = SMILEY_DEAD;
    }
}

function saveScore() {
    clearInterval(gInterval);
    var elClock = document.querySelector('.clock');

    var record = +elClock.innerText;
    switch (gLevel.SIZE) {
        case 4:
            if (record < localStorage.getItem("level4") || localStorage.getItem("level4") === 'null')
                localStorage.setItem("level4", record);
            break;
        case 8:
            if (record < localStorage.getItem("level8") || localStorage.getItem("level8") === 'null')
                localStorage.setItem("level8", record);
            break;
        case 12:
            if (record < localStorage.getItem("level12") || localStorage.getItem("level12") === 'null')
                localStorage.setItem("level12", record);
            break;
    }
}

function hintsClicked() {
    if (!gHints) return;
    if (gHintIsOn) return;

    gHintIsOn = true;
    gHints--;
    renderHints();
}

function cellNegsMineCount(i, j) {
    var minesCount = 0;
    for (var idx = i - 1; idx <= i + 1; idx++) {
        if (idx < 0 || idx > gLevel.SIZE - 1) continue;
        for (var jIdx = j - 1; jIdx <= j + 1; jIdx++) {
            if (jIdx < 0 || jIdx > gLevel.SIZE - 1) continue;
            if (i === idx && j === jIdx) continue;

            if (gBoard[idx][jIdx].isMine) minesCount++;
        }
    }

    if (minesCount === 2) {
        var cellSelector = '.cell' + i + '-' + j;
        document.querySelector(cellSelector).classList.add('green');

    }
    if (minesCount == 3) {
        var cellSelector = '.cell' + i + '-' + j;
        document.querySelector(cellSelector).classList.add('blue');
    }
    if (minesCount > 3) {
        var cellSelector = '.cell' + i + '-' + j;
        document.querySelector(cellSelector).classList.add('red');
    }

    return minesCount;
}

function boardNegsMinesCount() {
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            if (!gBoard[i][j].isMine) gBoard[i][j].minesAroundCount = cellNegsMineCount(i, j);
        }
    }
}

function zero(i, j) {
    gBoard[i][j].isShown = true;
    renderCell(i, j, EMPTY);
    var cellSelector = '.cell' + i + '-' + j;
    document.querySelector(cellSelector).classList.add('zero');

    if (!gHintIsOn) gGame.shownCount++;

    for (var idx = i - 1; idx <= i + 1; idx++) {
        if (idx < 0 || idx > gLevel.SIZE - 1) continue;
        for (var jIdx = j - 1; jIdx <= j + 1; jIdx++) {
            if (jIdx < 0 || jIdx > gLevel.SIZE - 1) continue;
            if (i === idx && j === jIdx) continue;

            if (gBoard[idx][jIdx].minesAroundCount != 0 && !gBoard[idx][jIdx].isShown && !gBoard[idx][jIdx].isMarked) {
                gBoard[idx][jIdx].isShown = true;
                renderCell(idx, jIdx, gBoard[idx][jIdx].minesAroundCount);
                gGame.shownCount++;
            }

            if (gBoard[idx][jIdx].minesAroundCount == 0 && !gBoard[idx][jIdx].isShown && !gBoard[idx][jIdx].isMarked) {
                zero(idx, jIdx);
            }
        }
    }
}

function renderScore() {
    var elScore1 = document.querySelector('.scoreCont .score1');
    if (localStorage.getItem("level4") == 'null') {
        elScore1.innerHTML = `Begginer <br> ${SMILEY_HAPPY}`;
    } else elScore1.innerHTML = `Begginer <br> ${localStorage.getItem("level4")}`;

    var elScore2 = document.querySelector('.scoreCont .score2');
    if (localStorage.getItem("level8") == 'null') {
        elScore2.innerHTML = `Normal <br> ${SMILEY_HAPPY}`;
    } else elScore2.innerHTML = `Normal <br> ${localStorage.getItem("level8")}`;

    var elScore3 = document.querySelector('.scoreCont .score3');
    if (localStorage.getItem("level12") == 'null') {
        elScore3.innerHTML = `Expert <br> ${SMILEY_HAPPY}`;
    } else elScore3.innerHTML = `Expert <br> ${localStorage.getItem("level12")}`;
}

function renderLives() {
    var elLives = document.querySelector('.lives');
    var strHtml = '';
    for (var i = 0; i < gLives; i++) {
        strHtml += '❤️';
    }
    elLives.innerText = strHtml;
}

function renderFlags() {
    var elFlags = document.querySelector('.flags');
    var strHtml = `${MINE} ${gLevel.MINES - gFlagsMarked}`
    elFlags.innerHTML = strHtml;
}

function renderHints() {
    var elHints = document.querySelector('.hints');
    var strHtml = '';
    for (var i = 0; i < gHints; i++) {
        strHtml += '💡';
    }
    elHints.innerText = strHtml;
}