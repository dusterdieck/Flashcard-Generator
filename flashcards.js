//import all required libraries
let inquirer = require('inquirer'),
	BasicCard = require('./BasicCard'),
	ClozeCard = require('./ClozeCard'),
	fs = require('fs');

//global variables declaration
let questions = [],
	correct = 0,
	incorrect = 0;

//load any saved files
fs.readFile('flashcards.txt', 'utf8', function(err, data){
	if (data == '' || data == null){ //do nothing if no data saved or the file doesn't yet exist
		// console.log('No flashcards currently saved');
	}
	else{ //otherwise, parse the data and save as our questions array
		questions = JSON.parse( data );
	}
});

//run master prompt
start();

// master prompt
function start() {
 	 inquirer.prompt({
	  	name: "userChoice",
	    type: "list",
	    message: "Would you like to create a new flashcard or study?",
	    choices: ["CREATE", "STUDY", 'EXIT']
  }).then(function(answer) {
	    // based on their answer, either call the create or study function, or exit the program.
	    if (answer.userChoice.toUpperCase() === "CREATE") {
	      createFlashcard();
	    }
	    else if (answer.userChoice.toUpperCase() === "STUDY"){ 
	      study( 0 );
	    }
	    else{ //exits
	    	return;
	    }
  });
}

//prompt to choose which type of flashcard to construct
function createFlashcard() {
	inquirer.prompt({
		name: "cardType",
		type: 'list',
		message: 'Would you like to create a basic flashcard or a cloze card?',
		choices:['BASIC', 'CLOZE']
  }).then(function(answer){
  		//based on their answer, construct the appropriate type of card.
		if( answer.cardType == 'BASIC'){
			createBasic();
		}
		else{
			createCloze();
		}
	});
}

//prompt to cycle through all saved questions
function study( i ) {
	if ( questions == ''){ //if nothing currently saved, alert the user
		console.log('\nNo flashcards currently saved\n');
		//return to master prompt
		start()
	}
	else{
		//if the card has a cloze property, set the question to the partial text
		if( questions[i].cloze ){
			var question = questions[i].partial;
		}
		else{ 
			//otherwise, it's a basic card, so use the front value
			var question = questions[i].front; 
		}
		//prompt user to enter an answer
	    inquirer.prompt([{
	        name: "answer",
	        message: question
	    }]).then(function(res) {
	    	//if it's a cloze type, check to see if the answer is correct, and increment counter if so
	    	if( questions[i].cloze ){
	    		if( res.answer.toLowerCase() == questions[i].cloze.toLowerCase() ){
	    			console.log('\nCorrect!');
	    			console.log( questions[i].fullText + '\n');
	    			correct++;
	    		}
	    		else{
	    			//if incorrect, alert the user and increment incorrect counter
	    			console.log('\nIncorrect.');
	    			console.log( questions[i].fullText + '\n');
	    			incorrect++;
	    		}
	    	}
	    	else{
	    		//otherwise, it's a basic type, so check to see if the answer is correct, and increment counter if so
	    		if( res.answer.toLowerCase() == questions[i].back.toLowerCase() ){
	    			console.log('\nCorrect!');
	    			correct++;
	    		}
	    		else{
	    			//if incorrect, alert the user of the correct answer and increment incorrect counter
	    			console.log('\nIncorrect.');
	    			console.log( 'Correct answer is: ' + questions[i].back + '\n');
	    			incorrect++;
	    		}
	    	}

	    	//if next i is less than the questions array length, do it again (Thanks for this, CJ!)
	        if ( ++i < questions.length ) {
	          study(i) 
	     	}
	     	else{
	     		//otherwise, display their number correct and incorrect, and reset counters
	     		console.log('\nNumber correct: ' + correct);
	     		console.log('Number incorrect: ' + incorrect + '\n');
	     		correct = 0;
	     		incorrect = 0;
	     		//return to master prompt
	     		start();

	     	}
	    });
	}
}


//prompt to create a basic flashcard
function createBasic() {
	inquirer.prompt([{
		name: 'front',
		type: 'input',
		message: 'Enter the question for the front of the flashcard:'
	},
	{
		name: 'back',
		type: 'input',
		message: 'Enter the answer for the back of the flashcard:'
  }]).then(function(answer){
		//create and add flashcard to questions array and save file
		addCard( new BasicCard( answer.front, answer.back) );
		// send back to start query
		start();
	});
}

//prompt to create a cloze flashcard
function createCloze() {
	inquirer.prompt([{
		name: 'fullText',
		type: 'input',
		message: 'Enter the full text of the question:'
	},
	{
		name: 'partial',
		type: 'input',
		message: 'Enter the text you would like to obscure:'
  }]).then(function(answer){
  		//create temporary card
  		let tempCard = new ClozeCard( answer.fullText, answer.partial);
  		if( tempCard.invalid ){ //if the partial text is not contained inside the full text, prompt user to enter a valid flashcard
  			console.log('\nThat is not a valid cloze flashcard. Case must be matched exactly. Please re-enter.\n');
  			createCloze();
  		}
  		else{
	  		//add flashcard to questions array and save file
			addCard( tempCard );
			//send back to start query
			start();
		}
	});
}

//function to add card to questions array and save file
function addCard( card ) {
	//adds card to questions array
	questions.push( card );
	// console.log( card.constructor.name );
	//writes the whole questions array to the flashcards.txt
	fs.writeFile('flashcards.txt', JSON.stringify( questions ), 'utf8', function( err ){
		if (err) throw err;
		console.log('\nFlashcard successfully added.\n');
	});
}


