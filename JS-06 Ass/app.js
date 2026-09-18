const secretNumber = Math.floor(Math.random() * 10) + 1;
let attempts = 0;
const maxAttempts = 3;
let guessedCorrectly = false;

while (attempts < maxAttempts && !guessedCorrectly) {
  const userGuess = prompt(`Guess a number between 1 and 10 (Attempt ${attempts + 1} of ${maxAttempts}):`);
  
  if (userGuess === null) {
    alert("Game cancelled.");
    break;
  }
  
  const guess = Number(userGuess);
  
  if (isNaN(guess) || guess < 1 || guess > 10) {
    alert("Please enter a valid number between 1 and 10.");
    continue;
  }
  
  attempts++;
  
  if (guess === secretNumber) {
    alert("You guessed it!");
    guessedCorrectly = true;
  } else if (guess > secretNumber) {
    alert("Too high!");
  } else {
    alert("Too low!");
  }
}

if (!guessedCorrectly && attempts === maxAttempts) {
  alert(`Sorry, you've used all ${maxAttempts} attempts. The correct number was ${secretNumber}.`);
}
