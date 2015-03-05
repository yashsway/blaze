//Declare all necessary variables & arrays
//"columns" is a 2-dimensional array that is used to represent the game boards as in where each chip has been placed into which cell.
var columns = [[], [], [], [], [], [], []];
//“launch” is a boolean value that represents whether the game is engaged or not.  When the start button is clicked by the mouse, the “launch” value changes to reflect if the game is in progress.  When a game is completed, the “launch” value changes again to reflect that the game is not in progress.
var launch = false;
//“reset” is a boolean value that represents when the reset button has been clicked.
var reset = false;
//“redChips” and “blueChips” each represent the total possible number of red and blue chips that can be placed on a board legally...42 in total. (7x6 grid)
var redChips = 21;
var blueChips = 21;
//“currentPlayer” represents intially which player starts the game off by way of being randomly selected by the program.  Throughout the code, it takes the form of whichever player’s turn it is, based on alternating turn-based operations.  
var currentPlayer = Math.round((Math.random()));
//"play" represents that the player mode has been enabled
var mode = "play";

//calculates how far a chip will drop when a certain column has been clicked based on the number of chips already placed in that column. 
var dropLength = function(index) {
    //6 Chips + some buffer space - length of the column (# of chips in the argument column).. all * 100. (Each chip is 100x100px)
    return ((6 + 0.20) - columns[index].length) * 100;
}

//Hides both player pointers
function hidePlayerPointers(){
    $(".player-icons.play#p1").hide();
    $(".player-icons.play#p2").hide();
};

//Display the message specified in the argument in the sidebar. Also run an exit animation on it after 5s.
function messageConsole(selector){
    $(selector).show();
    $(selector).delay(5000).slideUp("slow");
}

//Updates the current player arrow icons based on player turn
var updateCurrentPlayer = function() {
    //p contains the next player
    var p = currentPlayer%2 ? "player2" : "player1";
    if(p=="player1"){
        $(".player-icons.play#p1").show();
        $(".player-icons.play#p2").hide();
    }else if(p="player2"){
        $(".player-icons.play#p2").show();
        $(".player-icons.play#p1").hide();
    }
};

//Checks if the game has ended in a draw.
var checkForDraw = function() {
    //Traverse through all the 7 columns
    for(var i = 0; i < columns.length; i++)
        //And check if all the columns are NOT full
        if(columns[i].length < 6)
            return;
    //If they are full...display a draw message
    messageConsole("#draw");
    //Hide player pointers..
    hidePlayerPointers();
    //and stop the game
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

//Checks if the current chip has 3 in a row of the same type next to it.
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
//Play and Developer Mode button toggle + player selector animations + player selector
$(document).ready(function(){
    $("#play-mode").bind("click", function() {
        mode = "play";
        $(".dev-mode").hide();
        $(".mode-icon#play-mode-icon").show();
        $(".mode-icon#dev-mode-icon").hide();
        $("#play-mode").css({"opacity":0.25});
        $("#dev-mode").css({"opacity":1});
        $("#play-mode").prop('disabled',true);
        $("#dev-mode").prop('disabled',false);
    });
    $("#dev-mode").bind("click", function() {
        mode = "dev";
        $(".dev-mode").show();
        $(".mode-icon#dev-mode-icon").show();
        $(".mode-icon#play-mode-icon").hide();
        $("#dev-mode").css({"opacity":0.25});
        $("#play-mode").css({"opacity":1});
        $("#dev-mode").prop('disabled',true);
        $("#play-mode").prop('disabled',false);
    });
    $(".playerCircle.p1").hover(function() {
        $(this).fadeTo("fast",1);
    },function() {
            $(this).fadeTo("slow",0.5);
    });
    $(".playerCircle.p2").hover(function() {
        $(this).fadeTo("fast",1);
    },function() {
            $(this).fadeTo("slow",0.5);
    });
});

//Main Function
//creates the display for the game to take place, prints messages to the screen for the user, prints the initial graphics of the game, and implements the click event listener and action.
$(document).ready(function init(){
    //Hide player pointers
    hidePlayerPointers();
    //Display a welcome message
    messageConsole("#welcome");
    //Stage instance (GLOBAL)
    stage = new createjs.Stage("game-canvas");
    //Make the game board
    horizontalLineMaker();
    //boardMaker();
    //When the start button is clicked...
    $("#launch").click(function() {
        updateCurrentPlayer();
        $("#launch").prop('disabled',true);
        launch = true;
        messageConsole("#inProgress");
    });
});

//Updates the game after every chip play
var updateGame = function(index) {
    //Calculate how many empty spaces are available in this column
    var colLength = columns[index].length;
    //If the column is full of chips...
    if(colLength >= 6) return false;
    //Else...Push the chip type into the respective column array (0=blue, 1=red)
    var type = currentPlayer % 2;
    columns[index].push(type);
    //and increment the current player
    currentPlayer++;
    //Now check if the chip that you just placed is the winning entry...
    if(winner(type, index, colLength)) {
        //If the winner function returned true, one of the players has won. Display the win assets.
        //If blue won...
        if(type==0){
            //Display an informative message
            messageConsole("#player1Win");
            //Show a visual indicator
            $(".player-icons.win#p1").show();
            //Hide the player pointers
            hidePlayerPointers();
        //If red won...
        }else if(type==1){
            //Display an informative message
            messageConsole("#player2Win");
            //Show a visual indicator
            $(".player-icons.win#p2").show();
            //Hide the player pointers
            hidePlayerPointers();
        }
        //Game not in play anymore.
        launch = false;
    }
    //If the game is still going on and the current column is full of chips...
    if(launch && columns[index].length === 6)
        checkForDraw();
    return true;
};

//The following function adds chips to a clicked column (PLAY Mode)
$(document).ready(function chipPlacer(){
    $(".columncontainer").click(function() {
        //If game hasn't been launched yet
        if(launch==false) return;
        //If game is NOT in play mode
        if(mode=="dev") return;
        //Store the index of the object that was clicked
        var index = $(this).index();
        //Update the game (Also the point where you cannot enter any more chips when a column is full)
        if(!updateGame(index)) return;
        //set p to be the current player's ID (0=blue,1=red)
        var p = currentPlayer%2 ? "player1":"player2";
        //Make a new chip object
        var newChip = "<div class=\"chip " + p + "\"></div>";
        //Add the chip object to the current columncontainer
        $(this).prepend(newChip);
        //var t = $(this).children(".chip:first-child").position().top;
        //$(this).children(".chip:first-child").css("top", t);
        //Take that recently added chip object and animate it to drop to the bottom (refer to the dropLength function as well)
        $(this).children(".chip:first-child").animate({top:"+="+dropLength(index)+"px",opacity:'0.6'},400);
        //If game has ended.... don't call updateDisplayChip()
        if(!launch) return;
        //Update the current player pointers
        updateCurrentPlayer();
    });
});

//The following function programs the reset button to wait for a click event
$(document).ready(function reset(){
    //Now we program the reset button
    $("#reset").click(function() {
        //Fade out all the chips
        $(".chip").fadeOut(function() {
            $(this).remove();
        });
        //Reset the array
        for(var i = 0; i < columns.length; i++) columns[i] = [];
        //Game has been reset. Set the default player to either Red or Blue
        currentPlayer = Math.round((Math.random()));
        //Set the launch key back to false
        launch = false;
        //Enable the start button
        $("#launch").prop('disabled',false);
        //Hide the player pointers
        hidePlayerPointers();
        //Hide the win assets
        $(".win").hide();
        //Display message to user
        messageConsole("#resetMsg");
    });
});

//displays horizontal lines onto the columns to form cells
function horizontalLineMaker() {
    var mod = 0;
    //Horizontal Lines (width: 700px)
    for (i = 0; i < 5; i++) {
        var line = new createjs.Shape();
        line.graphics.beginStroke("#724EB1");
        line.graphics.moveTo(0, 100 + mod).lineTo(900, 100 + mod); //moveTo(x,y) -> lineTo(x,y)
        stage.addChild(line);
        mod = mod + 100;
    }
    stage.update();
}

//Makes the grid of the Connect 4 game (6 x 7 grid)
/*function boardMaker() {
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
}*/
