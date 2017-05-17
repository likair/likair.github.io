var SIZE = 3; 
var tiles;
var time;
var score = 0;
var gameState = 0;
var jsTimer;
var frontImg = "0.jpg";
var reverseImg = "1.jpg";


function checkResult() {
    for (i = 0; i < SIZE; i++) {
        for (j = 0; j < SIZE; j++) {
            if (tiles[i][j] != 1) {
                return false;
            }
        }
    }
    return true;
}

function changeTiles(i, j) {
    toggleImg(i, j);                        // the middle
    if (j > 0) toggleImg(i, j - 1);         // the left
    if (j < SIZE - 1) toggleImg(i, j + 1);  // the right
    if (i > 0) toggleImg(i - 1, j);         // the up
    if (i < SIZE - 1) toggleImg(i + 1, j);  // the down

    if (checkResult() == true) {
        score = Math.round(1 / time * 3600);

        gameState = 0;
        clearInterval(jsTimer);
        document.getElementById("score").innerHTML = score;
        alert("Congratulations! You finished the challenge in " + time + "s, and your score is " + score + "!");
    }
}

function startGame() {
    gameState = 1;
    time = 0;
    score = 0;
    document.getElementById("score").innerHTML = 0;
    startTimer();
    window.clearInterval(jsTimer);
    jsTimer = self.setInterval(startTimer, 1000);
}

function toggleImg(i, j) {
    if (gameState == 0) {
        startGame();
    }

    var img = document.getElementById("img" + i + j);
    if (tiles[i][j] == 1) {
        img.setAttribute("src", frontImg);
        tiles[i][j] = 0;
    } else {
        img.setAttribute("src", reverseImg);
        tiles[i][j] = 1;
    }
}

function drawTiles() {
    var board = document.getElementById("board");
    board.innerHTML = "";

    tiles = new Array(SIZE);
    var i, j;
    for (i = 0; i < SIZE; i++) {
        tiles[i] = new Array(SIZE);  // second dimension
    }
    for (i = 0; i < SIZE; i++) {
        for (j = 0; j < SIZE; j++) {
            tiles[i][j] = Math.round(Math.random());    // generating random boxes
        }
    }
    for (i = 0; i < SIZE; i ++) {
        for (j = 0; j < SIZE; j ++) {
            var img = document.createElement("img");

            if (tiles[i][j] == 1) {
                img.setAttribute("src", reverseImg);
            } else {
                img.setAttribute("src", frontImg);
            }

            img.setAttribute("id", "img" + i + j);
            img.setAttribute("width", 100);
            img.setAttribute("height", 100);
            img.setAttribute("onClick", "javascript:changeTiles(" + i + "," + j + ");");

            board.appendChild(img);
        }
        var br = document.createElement("br");
        board.appendChild(br);
    }
 
}

function startTimer() {
    time = time + 1;
    var timer = document.getElementById("timer");
    timer.innerHTML = time;
}

/* Interation with server */

// submits the score.
$("#submit_score").click(function () {
    var msg = {
        "messageType": "SCORE",
        "score": score
    };
    window.parent.postMessage(msg, "*");
});

// Sends this game's state to the service.
$("#save").click(function () {
    var msg = {
        "messageType": "SAVE",
        "gameState": {
            "tiles": tiles,
            "time": time
        }
    };
    window.parent.postMessage(msg, "*");
});

// Sends a request to the service for a state to be sent, if there is one.
$("#load").click(function () {
    var msg = {
        "messageType": "LOAD_REQUEST",
    };
    window.parent.postMessage(msg, "*");
});

// Listen incoming messages, if the messageType is LOAD then the game state will be loaded.
// Note that no checking is done, whether the gameState in the incoming message contains
// correct information. Also handles any errors that the service wants to send (displays them as an alert).
window.addEventListener("message", function (evt) {
    if (evt.data.messageType === "LOAD") {
        tiles = evt.data.gameState.tiles;
        time = evt.data.gameState.time;
    } else if (evt.data.messageType === "ERROR") {
        alert(evt.data.info);
    }
});