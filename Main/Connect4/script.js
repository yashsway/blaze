//Declare all necessary variables & arrays
var columns = [[], [], [], [], [], [], []];
var launch = false;
var reset = false;
var redChips = 21;
var yellowChips = 21; //42 in total. (7x6 grid)
var currentPlayer = 0;

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
        if(columns[i].length < 6)
            return;
    //If they are full...
    //$(".displaycontainer h2").text("Draw!");
    //Display win assets.
    //$(".win").show();
    window.alert("DRAW");
    //Stop game
    launch = false;
};

//Function used by winner() to locate the next chip (in any of the 8 directions)
var locate = function(type, x, y) {
    //The following 3 if statements are safeguards to prevent checking outside the gameboard/prevent unecessary execution of the winner function
    if((x < 0) || (x > 6)) return false;
    if((y < 0) || (y > 6 - 1)) return false;
    //window.alert(columns[x].length + " "+(y + 1));
    if(columns[x].length < (y + 1)) return false;
    return (columns[x][y] === type);
};

function winner(type,x,y) {
    //window.alert(!locate(type, x, y));
    if(!locate(type, x, y)) return false;
    var direct = [[1,0], [1,1], [0,1], [1,-1]];
    var matches = 0;
    for(var i = 0; i < 4; i++) {
        //Positive side check
        for(var j = 1; ; j++)
            if(locate(type, x+j*direct[i][0], y+j*direct[i][1]))
                matches++;
            else break;
        //Negative side check
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
    //If NOT playing at this moment, don't do anything in this function
    //if(!inPlay) return false;
    //Calculate how many empty spaces are available in this column
    var colLength = columns[index].length;
    //window.alert(colLength);
    //If the column is full of chips...
    if(colLength >= 6) return false;
    //Else...Push the chip type into the respective column array (0=red, 1=yellow)
    var type = currentPlayer % 2;
    columns[index].push(type);
    //and increment the current player
    currentPlayer++;
    if(winner(type, index, colLength)) {
        //If the winner function returned true, one of the players has won. Display the win assets.
        if(type==0){
            messageConsole("#player1Win");
            $(".win.icon#p1").show();
            $(".current-play#p1").hide();
        }else if(type==1){
            messageConsole("#player2Win");
            $(".win.icon#p2").show();
            $(".current-play#p2").hide();
        }
        //Game not in play anymore.
        launch = false;
    }
    //If the game is still going on and the current column is full of chips...
    if(launch && columns[index].length === 6)
        checkForDraw();
    return true;
};

//Updates the current player arrow icons based on player turn
var updateCurrentPlayer = function() {
    //p contains the next player
    var p = currentPlayer%2 ? "player2" : "player1";
    if(p=="player1"){
        $(".current-play#p1").show();
        $(".current-play#p2").hide();
    }else if(p="player2"){
        $(".current-play#p2").show();
        $(".current-play#p1").hide();
    }
};

//Hides all pointer/win assets
function hidePointers(){
    //Hide the current player indicators
    $(".current-play#p1").hide();
    $(".current-play#p2").hide();
    //Hide the win assets
    $(".win").hide();
}

function messageConsole(selector){
    $(selector).show();
    $(selector).delay(5000).slideUp("slow");
}

//Run this function on page load
$(document).ready(function init(){
    messageConsole("#welcome");
    //Stage instance (GLOBAL)
    stage = new createjs.Stage("game-canvas");
    //Make the game board
    //boardMaker();
    //FOLLOWING EVENT IS A TEST EVENT
    $("#info-panel #game-tools-panel #launch").click(function() {
        updateCurrentPlayer();
        $("#launch").prop('disabled',true);
        launch = true;
        $("#inProgress").show();
        messageConsole("#inProgress");
    });
    $(".columncontainer").click(function() {
        //If game hasn't been launched yet
        if(launch==false) return;
        var index = $(this).index();
        //Update the game (Also the point where game doesn't execute when not in play)
        if(!updateGame(index)) return;
        //set p to be the current player's ID (0=red,1=yellow)
        var p = currentPlayer%2 ? "player1":"player2";
        //Make a new chip object
        var newChip = "<div class=\"chip " + p + "\"></div>";
        //Add the chip to the current columncontainer
        $(this).prepend(newChip);
        var t = $(this).children(".chip:first-child").position().top;
        $(this).children(".chip:first-child").css("top", t);
        $(this).children(".chip:first-child").animate({top:"+="+dropLength(index)+"px",opacity:'0.5'},400);
        //If game has ended.... don't call updateDisplayChip()
        if(!launch) return;
        //Update the current player pointers
        updateCurrentPlayer();
    });
    //Now we program the reset button
    $("#reset").click(function() {
        //Fade out all the chips
        $(".chip").fadeOut(function() {
            $(this).remove();
        });
        //Reset the array
        for(var i = 0; i < columns.length; i++) columns[i] = [];
        //Game has been reset. Set the default player back to red.
        currentPlayer = 0;
        //Set the launch key back to false
        launch = false;
        //Enable the start button
        $("#launch").prop('disabled',false);
        //Hide all indicators
        hidePointers();
    });
});
