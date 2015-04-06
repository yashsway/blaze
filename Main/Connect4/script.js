//Declare all necessary variables & arrays
var columns = [[], [], [], [], [], [], []];
var savedColumns = [[], [], [], [], [], [], []];
var aiBoard = [[],[],[],[],[],[],[]];
var launch = false;
var reset = false;
var saved = false;
var versusMode = "none"; //vs.Human or vs.AI toggle
var redChips = 21;
var blueChips = 21; //42 in total. (7x6 grid)
var currentPlayer = Math.round((Math.random()));
var mode = "play";
//TODO: Ai mode stuff (assign one of the two players to be controlled by AI)
var aiPlayer = Math.round((Math.random()));
aiPlayer = aiPlayer%2;
var aiStatus = [false,"center"]; //Imminent Win & Priority Side
var aiWinningColumn = 0;
var playerStatus = [false,"center"]; //Imminent Win & Priority Side
var aiStance = "neutral";

//TEST: console
function disp(){
    //Set
    for(var i=1;i<=7;i++){
        var order = "";
        if(aiBoard[i-1].length!=0){
            for(var j=0;j<aiBoard[i-1].length;j++){
                order += aiBoard[i-1][j];
            }
        $(".console > ul > li:nth-child(" + i + ")").text("");
        $(".console > ul > li:nth-child(" + i + ")").text(order);
        order = "";
        }
    }
}

//Calculates how far to drop
var dropLength = function (index) {
    //6 Chips + some buffer space - length of the column (# of chips in the argument column).. all * 100. (Each chip is 100x100px)
    return ((6 + 0.20) - columns[index].length) * 100;
};

//Hides both player pointers
function hidePlayerPointers() {
    $(".player-icons.play#p1").hide();
    $(".player-icons.play#p2").hide();
};

//Versus mode front-end handler
function versusModeController(selectionToggle, buddyToggle, aiToggle) {
    if (selectionToggle == "on") {
        $(".vs-selection").slideDown("fast");
        $("#vs-buddy").prop('disabled',false);
        $("#vs-ai").prop('disabled',false);
    } else if (selectionToggle == "off") {
        $(".vs-selection").slideUp("fast");
        $("#vs-buddy").prop('disabled',true);
        $("#vs-ai").prop('disabled',true);
    }
    if (buddyToggle == "on") {
        versusMode = "buddy";
        //TEST: log
        console.log(versusMode);
        //Change the player tags
        $(".player1Tag").text("Bubblegum");
        $(".player2Tag").text("Salmon");
        $(".vs-icon#vs-buddy-icon").show();
    } else if (buddyToggle == "off") {
        $(".vs-icon#vs-buddy-icon").hide();
    }
    if (aiToggle == "on") {
        versusMode = "AI";
        //TEST: log
        console.log(versusMode);
        //Change the player tags] depending on which player the computer now controls
        if (aiPlayer==0) {
            $(".player1Tag").text("AI");
            $(".player2Tag").text("Salmon");
        } else {
            $(".player1Tag").text("Bubblegum");
            $(".player2Tag").text("AI");
        }
        $(".vs-icon#vs-AI-icon").show();
    } else if (aiToggle == "off") {
        $(".vs-icon#vs-AI-icon").hide();
    }
    if (buddyToggle == "off" && aiToggle == "off") {
        versusMode = "none";
    }
}

//Saving & Loading front-end handler
function saveAndLoadController(selectionToggle, saveToggle, loadToggle) {
    if (selectionToggle == "on") {
        $(".save-load-selection").slideDown("fast");
    } else if (selectionToggle == "off") {
        $(".save-load-selection").slideUp("fast");
    }
    if (saveToggle == "on") {
        //Allow the player to save
        $("#save").prop('disabled', false);
    } else if (saveToggle == "off") {
        //Don't allow the player to save
        $("#save").prop('disabled', true);
    }
    if (loadToggle == "on") {
        $("#load").prop('disabled', false);
    } else if (loadToggle == "off") {
        $("#load").prop('disabled', true);
    }
}

//Display the message specified in the argument. Also run an exit animation on it after 5s.
function messageConsole(selector) {
    $(selector).show();
    $(selector).addClass("animated bounceInDown").delay(5000).slideUp();
    //$(selector).delay(5000).slideUp("slow");
}

//Updates the current player arrow icons based on player turn
var updateCurrentPlayer = function () {
    //p contains the next player
    var p = currentPlayer % 2 ? "player2" : "player1";
    if (p == "player1") {
        $(".player-icons.play#p1").show();
        $(".player-icons.play#p2").hide();
    } else if (p = "player2") {
        $(".player-icons.play#p2").show();
        $(".player-icons.play#p1").hide();
    }
};

//Checks if the game has ended in a draw.
var checkForDraw = function () {
    //Traverse through all the 7 columns
    for (var i = 0; i < columns.length; i++)
    //And check if all the columns are NOT full
        if (columns[i].length < 6)
            return;
        //If they are full...display a draw message
        //messageConsole("#draw");
        //TEST: Draw message
    $(".win-overlay").addClass("draw").text("Draw!").show().animate({
        top: 40 + "%"
    }, 800);
    //Hide player pointers..
    hidePlayerPointers();
    //and stop the game
    launch = false;
};

//Function used by winner() to locate the next chip (in any of the 8 directions)
var locate = function (type, x, y) {
    //The following 3 if statements are safeguards to prevent checking outside the gameboard/prevent unecessary execution of the winner function
    if ((x < 0) || (x > 6)) return false;
    if ((y < 0) || (y > 6 - 1)) return false;
    if (columns[x].length < (y + 1)) return false;
    return (columns[x][y] === type);
};

//Checks if the current chip has 3 in a row of the same type next to it.
function winner(type, x, y) {
    if (!locate(type, x, y)) return false;
    var direct = [[1, 0], [1, 1], [0, 1], [1, -1]]; //East,NE,N,SE
    var matches = 0;
    for (var i = 0; i < 4; i++) {
        //Positive side check
        for (var j = 1;; j++)
            if (locate(type, x + j * direct[i][0], y + j * direct[i][1])){
                matches++;
                //TODO: AI mode stuff
                if(versusMode=="AI"){
                    if((i==0) | (i==1) | (i==3)){
                        if(type!=aiPlayer){
                            playerStatus[1] = "left";
                        }else{
                            aiStatus[1] = "left";
                            aiWinningColumn = (x + j * direct[i][0])-1;
                        }
                    }else if(i==2){
                        if(type!=aiPlayer){
                            playerStatus[1] = "center";
                        }else{
                            aiStatus[1] = "center";
                            aiWinningColumn = x;
                        }
                    }
                }
            }else{
                break;
            }
        //Negative side check
        for (var j = 1;; j++)
            if (locate(type, x - j * direct[i][0], y - j * direct[i][1])){
                matches++;
                //TODO: AI mode stuff
                if(versusMode=="AI"){
                    if((i==0) | (i==1) | (i==3)){
                        if(type!=aiPlayer){
                            playerStatus[1] = "right";
                        }else{
                            aiStatus[1] = "right";
                            aiWinningColumn = (x - j * direct[i][0])-1;
                        }
                    }else if(i==2){
                        if(type!=aiPlayer){
                            playerStatus[1] = "center";
                        }else{
                            aiStatus[1] = "center";
                            aiWinningColumn = x;
                        }
                    }
                }
            }else{
                break;
            }
        //TODO: AI mode stuff
        if(versusMode=="AI"){
            if(matches >= 1){
                if(type!=aiPlayer){
                    //TEST: log
                    console.log("IMMINENT WIN FOR PLAYER. DIRECTION: " + playerStatus[1] + " COLUMN: " + x);
                    playerStatus[0] = true;
                    aiStance = "block";
                    console.log("AI STANCE CHANGED to " + aiStance);
                }else{
                    //TEST: log
                    console.log("IMMINENT WIN FOR AI. DIRECTION: " + aiStatus[1] + " COLUMN: " + x);
                    aiStatus[0] = true;
                    aiStance = "win";
                    console.log("AI STANCE CHANGED to " + aiStance);
                }
            }else{
                if(type!=aiPlayer){
                    playerStatus[0] = false;
                    playerStatus[1] = "center";
                }else{
                    aiStatus[0] = false;
                    aiStatus[1] = "center";
                    aiWinningColumn = x;
                }
                //TEST: Primary Stance
                aiStance = "block";
            }
        }
        if (matches >= 3) return true;
        matches = 0;
    }
    return false;
};
//TODO: Helper function for
//Play and Developer Mode button toggle + dev-mode player selector animations + player selector
$(document).ready(function () {
    $("#play-mode").bind("click", function () {
        mode = "play";
        $(".dev-mode").hide();
        $(".mode-icon#play-mode-icon").show();
        $(".mode-icon#dev-mode-icon").hide();
        $("#play-mode").css({
            "opacity": 0.25
        });
        $("#dev-mode").css({
            "opacity": 1
        });
        $("#play-mode").prop('disabled', true);
        $("#dev-mode").prop('disabled', false);
        versusModeController("on", "-", "-");
    });
    $("#dev-mode").bind("click", function () {
        mode = "dev";
        $(".dev-mode").show();
        $(".mode-icon#dev-mode-icon").show();
        $(".mode-icon#play-mode-icon").hide();
        $("#dev-mode").css({
            "opacity": 0.25
        });
        $("#play-mode").css({
            "opacity": 1
        });
        $("#dev-mode").prop('disabled', true);
        $("#play-mode").prop('disabled', false);
        versusModeController("off", "off", "off");
    });
    //TODO: Versus mode controller
    $('#vs-buddy').bind("click", function () {
        versusModeController("off", "on", "off");
    });
    $('#vs-ai').bind("click", function () {
        versusModeController("off", "off", "on");
    });
    //Dev mode selector chips
    $(".playerCircle.p1").hover(function () {
        $(this).fadeTo("fast", 1);
    }, function () {
        $(this).fadeTo("slow", 0.5);
    });
    $(".playerCircle.p2").hover(function () {
        $(this).fadeTo("fast", 1);
    }, function () {
        $(this).fadeTo("slow", 0.5);
    });
});

//Main Controller
$(document).ready(function init() {
    //Hide player pointers
    hidePlayerPointers();
    //Display a welcome message
    messageConsole("#welcome");
    //Stage instance (GLOBAL)
    stage = new createjs.Stage("game-canvas");
    //Make the horizontal lines of the game board
    horizontalLineMaker();
    //When the start button is clicked...
    $("#launch").click(function () {
        //If you're in PLAY mode...
        if (mode == "play" && (versusMode == "buddy" || versusMode == "AI")) {
            //TEST: not supposed to be here (move to draw-message)
            //$(".win-overlay").addClass("draw").text("Draw!").show().animate({top:40+"%"},800);
            updateCurrentPlayer();
            //Disable the start button
            $("#launch").prop('disabled', true);
            //Disable switching to the dev mode
            $("#dev-mode").prop('disabled', true);
            //Allow the player to save
            //$("#save").prop('disabled',false);
            //TEST: save-load
            saveAndLoadController("on", "on", "off");
            //Re-enable AI Mode
            if(!($("#vs-ai").hasClass("animated"))){
                $("#vs-ai").addClass("animated");
            }
            $("#vs-ai").prop("disabled",false);
            //Game has been launched, this variable records it
            launch = true;
            //Display a message
            messageConsole("#inProgress");
            //TODO: ai mode stuff (if the AI is the first player, make a neutral move)
            if(versusMode=="AI"){
                aiStance = "neutral";
                //TEST: log
                //console.log("Current: " + currentPlayer + "/AI IS: " + aiPlayer);
                if(currentPlayer==aiPlayer){
                    ai("play",aiStance);
                }
            }
            aiStance="block"; //PRIMARY stance
            //console.log("AI STANCE CHANGED to " + aiStance);
        //Else, if you're in DEV mode...
        } else if (mode == "dev") {
            //TODO: Launching dev mode
            devModeInitializer();
            //Disable the start button
            $("#launch").prop('disabled', true);
            //Disable switching to the play mode
            $("#play-mode").prop('disabled', true);
        }
    });
});

//Updates the game after every chip play. Also handles win scenario.
var updateGame = function (index) {
    //Calculate how many empty spaces are available in this column
    var colLength = columns[index].length;
    //If the column is full of chips...
    if (colLength >= 6) return false;
    //Else...Push the chip type into the respective column array (0=blue, 1=red)
    var type = currentPlayer % 2;
    //TODO: Following 2 if statements are NEW
    if(versusMode=="buddy"){
        columns[index].push(type);
    }
    if(versusMode=="AI"){
        if(type==aiPlayer){
            columns[index].push(aiPlayer);
            //TODO: Recording the AI's move (MOVED BELOW WINNER CHECK)
            ai("record","AI",index);
        }else{
            columns[index].push(type);
            //TODO: Recoding the player's move (MOVED BELOW WINNER CHECK)
            ai("record","player",index);
        }
    }
    //and increment the current player
    currentPlayer++;
    //Now check if the chip that you just placed is the winning entry...
    if (winner(type, index, colLength)) {
        //If the winner function returned true, one of the players has won. Display the win assets.
        //If blue won...
        if (type == 0) {
            //Display an informative message
            //messageConsole("#player1Win");
            //Show a visual indicator
            $(".player-icons.win#p1").show();
            //Hide the player pointers
            hidePlayerPointers();
            //TEST: Win message
            $(".win-overlay").addClass("p1").text("Blue wins!").show().animate({
                top: 40 + "%"
            }, 800);
            //If red won...
        } else if (type == 1) {
            //Display an informative message
            //messageConsole("#player2Win");
            //Show a visual indicator
            $(".player-icons.win#p2").show();
            //Hide the player pointers
            hidePlayerPointers();
            //TEST: Win message
            $(".win-overlay").addClass("p2").text("Red wins!").show().animate({
                top: 40 + "%"
            }, 800);
        }
        //Game not in play anymore.
        launch = false;
        //Disable saving
        //$("#save").prop('disabled',true);
        //TEST: save-load
        saveAndLoadController("-", "off", "-");
        //TEST: Blur out (causes lag. temporarily disabled)
        //$("#game-panel").addClass("blur");
    }
    //If the game is still going on and the current column is full of chips...
    if (launch && columns[index].length === 6)
        checkForDraw();
    return true;
};

//The following function adds chips to a clicked column (PLAY Mode)(vs. Buddy)
$(document).ready(function chipPlacer() {
    $(".columncontainer").click(function () {
        //TEST: Prevent the player from placing a chip on the AI's turn
        if(versusMode=="AI"){
            if((currentPlayer%2)==aiPlayer){
                return;
            }
        }
        //If game hasn't been launched yet
        if (launch == false) return;
        //If game is NOT in play mode
        if (mode == "dev") return;
        //Store the index of the object that was clicked
        var index = $(this).index();
        //Update the game (Also the point where you cannot enter any more chips when a column is full)
        if (!updateGame(index)) return;
        //set p to be the current player's ID (0=blue,1=red)
        var p = currentPlayer % 2 ? "player1" : "player2";
        //Make a new chip object
        var newChip = "<div class=\"chip " + p + "\"></div>";
        //Add the chip object to the current columncontainer
        $(this).find(".column").prepend(newChip);
        //var t = $(this).children(".chip:first-child").position().top;
        //$(this).children(".chip:first-child").css("top", t);
        //Take that recently added chip object and animate it to drop to the bottom (refer to the dropLength function as well)
        $(this).find(".column").children(".chip:first-child").animate({
            top: (dropLength(index) - 10) + "px",
            opacity: '0.6'
        }, 400);
        //If game has ended.... don't call updateCurrentPlayer();
        if (!launch) return;
        //Update the current player pointers
        updateCurrentPlayer();
        //TODO: AI's move
        if(versusMode=="AI"){
            //TEST: indicate to the player that they cannot place a chip till the AI finishes it's turn
            $(".columncontainer").css("cursor","wait");
            //2 sec delay
            setTimeout(function() { ai("play",aiStance,-1)},1500);
        }
    });
});

//TODO: AI Mode helper function
function priorityGenerator(columnIndex,number){
    //Prevent from placing beyond grid width
    if(columnIndex<0){
        priorityGenerator(columnIndex+1,number);
        return;
    }
    if(columnIndex>6){
        priorityGenerator(columnIndex-1,number);
        return;
    }
    var colLength = aiBoard[columnIndex].length;
    //Prevent from placing beyond grid height
    if(colLength<6){
        var priorityNumber = number;
        //TODO: Absorption during ACTUAL placement
        //console.log(aiBoard[columnIndex][colLength-1]); //TEST: log
        if((typeof aiBoard[columnIndex][colLength-1]) == (typeof 0)){
            var target = aiBoard[columnIndex].pop();
            priorityNumber = target + 1;
        }
        aiBoard[columnIndex].push(priorityNumber);
    }else{
        var choice = Math.floor((Math.random()*2)+1);
        //Recursion
        if(choice==1){
            priorityGenerator(columnIndex-1,number);
            return;
        }else if(choice==2){
            priorityGenerator(columnIndex+1,number);
            return;
        }
    }
}
//TODO: AI Mode
//Versus AI implementation (Play Mode)(vs.AI)
function ai(aiMode,aiStance,columnIndex){
    var p = aiPlayer ? "player2" : "player1";
    if(aiMode=="play"){
        if(aiStance=="neutral"){
            var valid = false;
            //Prevent the AI from going beyond the column height
            while(!valid){
                var playCol = Math.floor((Math.random()*7)+1); //MAIN THEME. Determines which column to play in. (random # b/w 1 and 7)
                if(updateGame(playCol-1)) valid=true;
            }
        }else if(aiStance=="block"){
            //TODO: Block stance
            var biggestPriority = 0;
            var biggestHeight = 0;
            var playCol;
            for(var i=0;i<7;i++){
                if((typeof aiBoard[i][aiBoard[i].length-1]) == (typeof 0)){
                    if(biggestPriority<aiBoard[i][aiBoard[i].length-1]){
                        biggestPriority = aiBoard[i][aiBoard[i].length-1];
                        biggestHeight = aiBoard[i].length;
                        playCol = i+1;
                    }else if(biggestPriority==aiBoard[i][aiBoard[i].length-1]){
                        if(biggestHeight>aiBoard[i].length){
                            playCol = i+1;
                        }else if (biggestHeight<aiBoard[i].length){
                            biggestPriority = aiBoard[i][aiBoard[i].length-1];
                            biggestHeight = aiBoard[i].length;
                            playCol = i+1;
                        }
                    }
                }
            }
            //TEST: log
            //console.log("BIGGEST PRIORITY: " + biggestPriority + ", BIGGEST HEIGHT: " + biggestHeight + ", PLAY COLUMN: " + playCol);
            updateGame(playCol-1);
        }else if(aiStance=="win"){
            //TODO: Win stance
            var lowestPriority = 0;
            for(var i=0;i<7;i++){
                if((typeof aiBoard[i][aiBoard[i].length-1]) == (typeof 0)){
                    if(lowestPriority>aiBoard[i][aiBoard[i].length-1]){
                        lowestPriority = aiBoard[i][aiBoard[i].length-1];
                        playCol = i+1;
                    }
                }
            }
            updateGame(playCol-1);
        }
        //Make a new chip object
        var newChip = "<div class=\"chip " + p + "\"></div>";
        //Add the chip object to a random column
        $(".columncontainer:nth-child(" + playCol + ")").find(".column").prepend(newChip);
        //Take that recently added chip object and animate it to drop to the bottom (refer to the dropLength function as well)
        $(".columncontainer:nth-child(" + playCol + ")").find(".column").children(".chip:first-child").animate({
            top: (dropLength(playCol-1) - 10) + "px",
            opacity: '0.6'
        }, 400);
        //If game has ended.... don't call updateCurrentPlayer();
        if (!launch) return;
        //Update the current player pointers
        updateCurrentPlayer();
        //TEST: Return placing freedom to the player
        $(".columncontainer").css("cursor","pointer");
    }else if(aiMode=="record"){
        if(aiStance=="player"){
            //TODO: Absorption during placement
            if((typeof aiBoard[columnIndex][aiBoard[columnIndex].length-1]) == (typeof 0)){
                var target = aiBoard[columnIndex].pop();
                aiBoard[columnIndex].push("X");
                //TODO: Call the win determination algorithm
                winner((currentPlayer%2),columnIndex,columns[columnIndex].length);
                //TODO: Determining where to push the replaced priority #
                if(aiBoard[columnIndex].length<6){
                    if(playerStatus[0]==true){
                        if(playerStatus[1]=="left"){
                            priorityGenerator(columnIndex-1,target);
                        }else if(playerStatus[1]=="right"){
                            priorityGenerator(columnIndex+1,target);
                        }else if(playerStatus[1]=="center"){
                            //TEST: +1 value is a test
                            priorityGenerator(columnIndex,target+1);
                        }
                    }else{
                        priorityGenerator(columnIndex,target);
                    }
                }
            }else{
                aiBoard[columnIndex].push("X");
            }
            //TODO: Priority Generator call
            priorityGenerator(columnIndex-1,1); //Immediate left
            priorityGenerator(columnIndex,1); //Column of player's recent play
            priorityGenerator(columnIndex+1,1); //Immediate right
            //console.log(aiBoard[columnIndex].length);
            //TEST: Call the console
            //disp();
        }else if(aiStance=="AI"){
            //TODO: Absorption during placement
            if((typeof aiBoard[columnIndex][aiBoard[columnIndex].length-1]) == (typeof 0)){
                var target = aiBoard[columnIndex].pop();
                aiBoard[columnIndex].push("A");
                //TODO: Call the win determination algorithm (to determine aiStatus)
                winner(aiPlayer,columnIndex,columns[columnIndex].length);
                //TODO: Markers for Win Stance
                //TEST: log
                console.log("aiWinningColumn=" + aiWinningColumn);
                if(aiBoard[aiWinningColumn].length<6){
                    if(aiStatus[0]==true){
                        //TEST: log
                        console.log("Woa AI might win! .. okay... next chip should be placed: " + aiStatus[1] + "which is column " + aiWinningColumn);
                        //TODO: Absorption
                        if((typeof aiBoard[aiWinningColumn][aiBoard[aiWinningColumn].length-1]) == (typeof 0)){
                            var target = aiBoard[aiWinningColumn].pop();
                            target += -10;
                            aiBoard[aiWinningColumn].push(target);
                        }
                    }
                }
            }else{
                aiBoard[columnIndex].push("A");
            }
            //TEST: Call the console
            //disp();
        }
    }
};

//The following function programs the reset button to wait for a click event
$(document).ready(function reset() {
    //Now we program the reset button
    $("#reset").click(function () {
        //Fade out all the chips
        $(".chip").fadeOut(function () {
            $(this).remove();
        });
        //Reset the array
        for (var i = 0; i < columns.length; i++) columns[i] = [];
        //Game has been reset. Set the default player to either Red or Blue
        currentPlayer = Math.round((Math.random()));
        //Set the launch key back to false
        launch = false;
        //Enable the start button and the mode buttons
        $("#launch").prop('disabled', false);
        //Imitate a click action on the play button to reset the game made back to PLAY mode (default)
        $("#play-mode").trigger("click");
        //Hide the player pointers
        hidePlayerPointers();
        //Hide the win assets
        $(".win").hide();
        //Disable ONLY the save and not the load button
        //$("#save").prop('disabled',true);
        //TEST: save-load
        saveAndLoadController("-", "off", "-");
        //Display message to user
        messageConsole("#resetMsg");
        //TEST: Remove blur
        $("#game-panel").removeClass("blur");
        //TEST: Remove win messages
        $(".win-overlay").animate({
            top: -30 + "%"
        }, 800).removeClass("p1 p2").text(" ");
        //TODO: versus mode controller reset
        versusModeController("on", "off", "off");
        //TODO: Ai mode asset reset
        for (var i = 0; i < aiBoard.length; i++) aiBoard[i] = [];
        //TODO: status reset
        playerStatus[0] = false;
        playerStatus[1] = "center";
        aiStatus[0] = false;
        aiStatus[1] = "center";
        //TEST: log
        $(".console > ul > *").text("");
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
$(document).ready(function () {
    //When the save button is clicked
    $("#save").click(function () {
        //Deep clone the array storing the positions of the chips
        savedColumns = $.extend(true, [], columns);
        //Allow the player to load
        //$("#load").prop('disabled',false);
        //TEST: save-load
        saveAndLoadController("-", "-", "on");
        //Display a message
        messageConsole("#saved");
    });
    //When load is pressed
    $("#load").click(function () {
        //Reset the board (Trigger the reset button's click)
        $("#reset").trigger("click");
        //Disable AI Mode
        $("#vs-ai").removeClass("animated");
        $("#vs-ai").prop("disabled",true);
        //Disable itself
        //$("#load").prop('disabled',true);
        //TEST: save-load
        saveAndLoadController("off", "-", "off");
        //Display a message
        messageConsole("#loaded");
        //Variables required for the loop
        var col, row;
        for (row = 0; row < 6; row++) {
            for (col = 0; col < 7; col++) {
                //If the current chip in the saved game board is referring to the first player
                if (savedColumns[col][row] == 0) {
                    //Duplicate that in the actual game board register
                    columns[col].push(0);
                    //Make a new chip object
                    var newChip = "<div class=\"chip player1\"></div>";
                    //Add the chip object to the current columncontainer
                    $(".columncontainer#c" + (col + 1)).find(".column").prepend(newChip);
                    //Take that recently added chip object and animate it to drop to the bottom (refer to the dropLength function as well)
                    $(".columncontainer#c" + (col + 1)).find(".column").children(".chip:first-child").animate({
                        top: (dropLength(col) - 10) + "px",
                        opacity: '0.6'
                    }, 400);
                } else if (savedColumns[col][row] == 1) { //If the current chip in the saved game board is referring to the second player
                    //Duplicate that in the actual game board register
                    columns[col].push(1);
                    //Make a new chip object
                    var newChip = "<div class=\"chip player2\"></div>";
                    //Add the chip object to the current columncontainer
                    $(".columncontainer#c" + (col + 1)).find(".column").prepend(newChip);
                    //Take that recently added chip object and animate it to drop to the bottom (refer to the dropLength function as well)
                    $(".columncontainer#c" + (col + 1)).find(".column").children(".chip:first-child").animate({
                        top: (dropLength(col) - 10) + "px",
                        opacity: '0.6'
                    }, 400);
                }
            }
        }
    });
});

//FOLLOWING FUNCTIONS ARE ALL RELATED TO DEV MODE & UNDER CONSTRUCTION

//Fills the prexisting columns from PLAY mode with invisible chips
function devModeInitializer() {
    var col;
    var row;
    var offset = 110;
    for (row = 0; row < 6; row++) {
        for (col = 0; col < 7; col++) {
            //var p="player1";
            //Make a new chip object
            var newChip = "<div class=\"chip dev-mode-chips\"></div>";
            //Add the chip object to the current columncontainer
            $(".columncontainer#c" + (col + 1)).find(".column").prepend(newChip);
            //Take that recently added chip object and animate it to drop to the bottom (refer to the dropLength function as well)
            $(".columncontainer#c" + (col + 1)).find(".column").children(".chip:first-child").animate({
                top: (dropLength(col) - offset) + "px",
                opacity: '0.6'
            }, 400);

        }
        offset = offset + 100;
    }
}

$(document).ready(function colorSelectionListener() {
    $(".columncontainer").on('click', ".chip.dev-mode-chips", function (e) {
        e.stopPropagation();
        $(this).css("opacity", 1);
    });
});
