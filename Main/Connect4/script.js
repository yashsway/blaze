//Declare all necessary variables & arrays
var columns = [[], [], [], [], [], [], []];
var inPlay = true;
var start = false;
var reset = false;
var redChips = 21;
var yellowChips = 21; //42 in total. (7x6 grid)
var currentPlayer = 0;
var launch = false;

//Calculates how far to drop
var dropLength = function(index) {
    //6 Chips + some buffer space - length of the column (# of chips in the argument column).. all * 100. (Each chip is 100x100px)
    //window.alert(((6 + 0.20) - columns[index].length) * 100);
    return ((6 + 0.20) - columns[index].length) * 100;
}

//Makes the grid of the Connect 4 game (6 x 7 grid)
function boardMaker() {
    var mod = 0;
    //Horizontal Lines (width: 700px)
    for (i = 0; i < 7; i++) {
        var line = new createjs.Shape();
        line.graphics.beginStroke("red");
        line.graphics.moveTo(200, 100 + mod).lineTo(900, 100 + mod); //moveTo(x,y) -> lineTo(x,y)
        stage.addChild(line);
        mod = mod + 100;
    }
    mod = 0;
    //Vertical Lines (height: 600)
    for (i = 0; i < 8; i++) {
        var line = new createjs.Shape();
        line.graphics.beginStroke("red");
        line.graphics.moveTo(200 + mod, 100).lineTo(200 + mod, 700); //moveTo(x,y) -> lineTo(x,y)
        stage.addChild(line);
        mod = mod + 100;
    }
    //Update the stage with all the lines
    stage.update();
}

var checkForDraw = function() {
    //Traverse through all the 7 columns
    for(var i = 0; i < columns.length; i++)
        //And check if all the columns are NOT full
        if(columns[i].length < maxHeight)
            return;
    //If they are full...
    $(".displaycontainer h2").text("Draw!");
    //Display win assets.
    $(".win").show();
    //Stop game
    inPlay = false;
};

var locate = function(type, x, y) {
    if((x < 0) || (x > 6)) return false;
    if((y < 0) || (y > maxHeight - 1)) return false;
    if(columns[x].length < (y + 1)) return false;
    return (columns[x][y] === type);
};

var winner = function() {
    if(!locate(type, x, y)) return false;
    var direct = [[1,0], [1,1], [0,1], [1,-1]];
    var matches = 0;
    for(var i = 0; i < 4; i++) {
        for(var j = 1; ; j++)
            if(locate(type, x+j*direct[i][0], y+j*direct[i][1]))
                matches++;
            else break;
        for(var j = 1; ; j++)
            if(locate(type, x-j*direct[i][0], y-j*direct[i][1]))
                matches++;
            else break;
        if(matches >= 3) return true;
        matches = 0;
    }
    return false;
};

//Updates the game after every chip play
var updateGame = function(index) {
    //If not playing at this moment, don't do anything in this function
    if(!inPlay) return false;
    //Calculate how many empty spaces are available in this column
    var colLength = columns[index].length;
    //If the column is full of chips...
    if(colLength >= 6) return false;
    //Else...Push the chip type into the respective column array (0=red, 1=yellow)
    var type = currentPlayer % 2;
    columns[index].push(type);
    //and increment the current player
    currentPlayer++;
    var type = currentPlayer % 2;
    /*if(winner(currentPlayer, index, colLength)) {
        //If the winner function returned true, one of the players has won. Display the win assets.
        $(".win").show();
        //Game not in play anymore.
        inPlay = false;
    }
    //If the game is still going on and the current column is full of chips...
    if(inPlay && columns[index].length === maxHeight)
        checkForDraw();*/
    return true;
};

//Updates the current player arrow icons based on player turn
var updateCurrentPlayer = function() {
    var p = currentPlayer%2 ? "player2" : "player1";
    if(p=="player1"){
        $(".current-play#p1").show();
        $(".current-play#p2").hide();
    }else if(p="player2"){
        $(".current-play#p2").show();
        $(".current-play#p1").hide();
    }
    //When the reset button is pressed, set player 1 as the default
    if(reset==true){
        reset = false;
        currentPlayer = 0;
        $(".current-play#p1").show();
        $(".current-play#p2").hide();
    }
};

//Run this function on page load
$(document).ready(function init(){
    //Stage instance (GLOBAL)
    stage = new createjs.Stage("game-canvas");
    //Make the game board
    //boardMaker();
    //FOLLOWING EVENT IS A TEST EVENT
    $("#info-panel #game-tools-panel #launch").click(function() {
        updateCurrentPlayer();
        launch = true;
    });
    $(".columncontainer .buttoncontainer .gamebutton").click(function() {
        //If game hasn't been launched yet
        if(launch==false) return;
        //ANY WINDOW.ALERT's in the following code are TEST LINES
        //window.alert("LOL");
        var index = $(this).parents(".columncontainer").index();
        //window.alert(index);
        if(!updateGame(index)) return;
        start = true;
        var p = currentPlayer%2 ? "player1":"player2";
        var newChip = "<div class=\"chip " + p + "\"></div>";
        $(this).closest(".columncontainer").prepend(newChip);
        var t = $(this).closest(".columncontainer").children(".chip:first-child").position().top;
        $(this).closest(".columncontainer").children(".chip:first-child").css("top", t);
        $(this).closest(".columncontainer").children(".chip:first-child").animate({top:"+="+dropLength(index)+"px",opacity:'0.5'},400);
        //If game has ended.... don't call updateDisplayChip()
        if(!inPlay) return;
        updateCurrentPlayer();
    });
    //Now we program the reset button
    $("#reset").click(function() {
        $(".chip").fadeOut(function() {
            $(this).remove();
        });
        //Reset the array
        for(var i = 0; i < columns.length; i++) columns[i] = [];
        //Hide the win assets
        $(".win").hide();
        inPlay = true;
        start = false;
        reset = true;
        launch = false;
        updateCurrentPlayer();
    });
});
