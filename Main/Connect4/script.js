//Declare all necessary variables & arrays
var columns = [[], [], [], [], [], [], []];
var savedColumns = [[], [], [], [], [], [], []];
var launch = false;
var reset = false;
var saved = false;
var redChips = 21;
var blueChips = 21; //42 in total. (7x6 grid)
var currentPlayer = Math.round((Math.random()));
var mode = "play";

//Calculates how far to drop
var dropLength = function(index) {
    //6 Chips + some buffer space - length of the column (# of chips in the argument column).. all * 100. (Each chip is 100x100px)
    return ((6 + 0.20) - columns[index].length) * 100;
};

//Hides both player pointers
function hidePlayerPointers(){
    $(".player-icons.play#p1").hide();
    $(".player-icons.play#p2").hide();
};

//Display the message specified in the argument. Also run an exit animation on it after 5s.
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
    if(columns[x].length < (y + 1)) return false;
    return (columns[x][y] === type);
};

//Checks if the current chip has 3 in a row of the same type next to it.
function winner(type,x,y) {
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
        //devModeInitializer();
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
$(document).ready(function init(){
    //Hide player pointers
    hidePlayerPointers();
    //Display a welcome message
    messageConsole("#welcome");
    //Stage instance (GLOBAL)
    stage = new createjs.Stage("game-canvas");
    //Make the game board
    horizontalLineMaker();
    //When the start button is clicked...
    $("#launch").click(function() {
        //If you're in PLAY mode...
        if(mode=="play"){
            updateCurrentPlayer();
            //Disable the start button
            $("#launch").prop('disabled',true);
            //Disable switching to the dev mode
            $("#dev-mode").prop('disabled',true);
            //Allow the player to save
            $("#save").prop('disabled',false);
            //Game has been launched, this variable records it
            launch = true;
            //Display a message
            messageConsole("#inProgress");
        //Else, if you're in DEV mode...
        }else{
            devModeInitializer();
            //Disable the start button
            $("#launch").prop('disabled',true);
            //Disable switching to the play mode
            $("#play-mode").prop('disabled',true);
        }
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
            //messageConsole("#player1Win");
            //Show a visual indicator
            $(".player-icons.win#p1").show();
            //Hide the player pointers
            hidePlayerPointers();
            //TEST: Win message
            $(".win-overlay").addClass("p1").text("Blue wins!").show().animate({top:40+"%"},800);
        //If red won...
        }else if(type==1){
            //Display an informative message
            //messageConsole("#player2Win");
            //Show a visual indicator
            $(".player-icons.win#p2").show();
            //Hide the player pointers
            hidePlayerPointers();
            //TEST: Win message
            $(".win-overlay").addClass("p2").text("Red wins!").show().animate({top:40+"%"},800);
        }
        //Game not in play anymore.
        launch = false;
        //Disable saving
        $("#save").prop('disabled',true);
        //TEST: Blur out
        $("#game-panel").addClass("blur");
    }
    //If the game is still going on and the current column is full of chips...
    if(launch && columns[index].length === 6)
        checkForDraw();
    return true;
};

//The following function adds chips to a clicked column (PLAY Mode)(Main)
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
        $(this).find(".column").prepend(newChip);
        //var t = $(this).children(".chip:first-child").position().top;
        //$(this).children(".chip:first-child").css("top", t);
        //Take that recently added chip object and animate it to drop to the bottom (refer to the dropLength function as well)
        $(this).find(".column").children(".chip:first-child").animate({top:(dropLength(index)-10)+"px",opacity:'0.6'},400);
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
        //Enable the start button and the mode buttons
        $("#launch").prop('disabled',false);
        //Imitate a click action on the play button to reset the game made back to PLAY mode (default)
        $("#play-mode").trigger("click");
        //Hide the player pointers
        hidePlayerPointers();
        //Hide the win assets
        $(".win").hide();
        //Disable ONLY the save and not the load button
        $("#save").prop('disabled',true);
        //Display message to user
        messageConsole("#resetMsg");
        //TEST: Remove blur
        $("#game-panel").removeClass("blur");
        //TEST: Remove win messages
        $(".win-overlay").animate({top:-30+"%"},800).removeClass("p1 p2").text(" ");
    });
});

//Following function makes the horizontal lines to make the game board look like a grid in PLAY mode (Uses Easel.js library)
function horizontalLineMaker() {
    var mod = 0;
    //Horizontal Lines (width: 900px)
    for (i = 0; i < 5; i++) {
        var line = new createjs.Shape();
        line.graphics.beginStroke("#724EB1");
        line.graphics.moveTo(0, 100 + mod).lineTo(900, 100 + mod); //moveTo(x,y) -> lineTo(x,y)
        stage.addChild(line);
        mod = mod + 100;
    }
    //Update the stage with all the lines
    stage.update();
}

//Saving and loading implementation
$(document).ready(function(){
    //When the save button is clicked
    $("#save").click(function(){
        //Deep clone the array storing the positions of the chips
        savedColumns = $.extend(true,[],columns);
        //Allow the player to load
        $("#load").prop('disabled',false);
        //Display a message
        messageConsole("#saved");
    });
    //When load is pressed
    $("#load").click(function() {
        //Reset the board (Trigger the reset button's click)
        $("#reset").trigger("click");
        //Disable itself
        $("#load").prop('disabled',true);
        //Display a message
        messageConsole("#loaded");
        //Variables required for the loop
        var col, row;
        for(row=0;row<6;row++){
            for(col=0;col<7;col++){
                //If the current chip in the saved game board is referring to the first player
                if(savedColumns[col][row]==0){
                    //Duplicate that in the actual game board register
                    columns[col].push(0);
                    //Make a new chip object
                    var newChip = "<div class=\"chip player1\"></div>";
                    //Add the chip object to the current columncontainer
                    $(".columncontainer#c" + (col+1)).find(".column").prepend(newChip);
                    //Take that recently added chip object and animate it to drop to the bottom (refer to the dropLength function as well)
                    $(".columncontainer#c" + (col+1)).find(".column").children(".chip:first-child").animate({top:(dropLength(col)-10)+"px",opacity:'0.6'},400);
                }else if(savedColumns[col][row]==1){ //If the current chip in the saved game board is referring to the second player
                    //Duplicate that in the actual game board register
                    columns[col].push(1);
                    //Make a new chip object
                    var newChip = "<div class=\"chip player2\"></div>";
                    //Add the chip object to the current columncontainer
                    $(".columncontainer#c" + (col+1)).find(".column").prepend(newChip);
                    //Take that recently added chip object and animate it to drop to the bottom (refer to the dropLength function as well)
                    $(".columncontainer#c" + (col+1)).find(".column").children(".chip:first-child").animate({top:(dropLength(col)-10)+"px",opacity:'0.6'},400);
                }
            }
        }
    });
});

//FOLLOWING FUNCTIONS ARE ALL RELATED TO DEV MODE & UNDER CONSTRUCTION

//Fills the prexisting columns from PLAY mode with invisible chips
function devModeInitializer(){
    var col;
    var row;
    var offset = 110;
    for(row = 0; row < 6;row++){
        for(col = 0; col < 7;col++){
            //var p="player1";
            //Make a new chip object
            var newChip = "<div class=\"chip dev-mode-chips\"></div>";
            //Add the chip object to the current columncontainer
            $(".columncontainer#c" + (col+1)).find(".column").prepend(newChip);
            //Take that recently added chip object and animate it to drop to the bottom (refer to the dropLength function as well)
            $(".columncontainer#c" + (col+1)).find(".column").children(".chip:first-child").animate({top:(dropLength(col)-offset)+"px",opacity:'0.6'},400);

        }
        offset = offset+100;
    }
}

//TODO: Make each chip clickable
$(document).ready(function colorSelectionListener(){
    $(".columncontainer").on('click', ".chip.dev-mode-chips", function(e) {
        e.stopPropagation();
        $(this).css("opacity",1);
    });
});



