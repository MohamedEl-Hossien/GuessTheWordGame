//Settings of Game-Title
let gameName = "Guess The Word";
document.title = gameName;
document.querySelector("h1").innerHTML = gameName;
document.querySelector(
  "footer"
).innerHTML = `${gameName} Game Created by Mohamed Elhossien - 2024 `;

//Settings of Game-Inputs
let numberOfTries = 7;
let numberOfLetters = 6;
let currentTry = 1;
let numberOfHints = 2;

//Manage Words
let wordToGuess = "";
async function getRandomWord() {
  try {
    // Create a wildcard query (e.g., "???") for the specified length
    const wildcardQuery = "?".repeat(numberOfLetters);

    // API endpoint with the wildcard query
    const apiUrl = `https://api.datamuse.com/words?sp=${wildcardQuery}&max=1000`;

    // Fetch the words from the API
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Parse the JSON response
    const data = await response.json();

    // If no words are returned, throw an error
    if (data.length === 0) {
      throw new Error("No words found");
    }

    // Select a random word from the list of returned words
    const randomIndex = Math.floor(Math.random() * data.length);
    wordToGuess = data[randomIndex].word;
    return wordToGuess;
  } catch (error) {
    console.error("Error fetching random word:", error);
  }
}

/*const words = [
  "Create",
  "Update",
  "Delete",
  "Master",
  "Branch",
  "Mainly",
  "Elzero",
  "School",
];*/
//Get Random Word
//wordToGuess = words[Math.floor(Math.random() * words.length)].toLowerCase();*/

// Select Message And Hinted Area
let messageArea = document.querySelector(".message");
let hintArea = document.querySelector(".hint span");
// Show Number Of Hints
hintArea.innerHTML = `${numberOfHints} `;
// Save Index Of Hinted Inputs
let hintedIndexed = [];

// Select Check button
const guessButton = document.querySelector(".check");
// Select Hint Button
const hintButton = document.querySelector(".hint");
// Call handleGuesses Func When Click on Check Button
guessButton.addEventListener("click", handleGuesses);
// Call handleHint Func When Click on Hint Button
hintButton.addEventListener("click", handleHint);

function generateInputs() {
  let inputsContainer = document.querySelector(".inputs");
  // Create Main Try Div
  for (let i = 1; i <= numberOfTries; i++) {
    let tryDiv = document.createElement("div");
    tryDiv.classList.add(`try-${i}`);
    tryDiv.innerHTML = `<span>Try ${i}</span>`;
    if (i != currentTry) {
      tryDiv.classList.add("disabled-inputs");
    }
    // Create Inputes
    for (let j = 1; j <= numberOfLetters; j++) {
      let input = document.createElement("input");
      input.type = "text";
      input.id = `guess-${i}-letter-${j}`;
      input.setAttribute("maxlength", "1");
      tryDiv.appendChild(input);
    }

    inputsContainer.appendChild(tryDiv);
  }
  // Focus on first input
  inputsContainer.children[0].children[1].focus();
  // disable all tries except first try
  const inputsInDisabledInputs = document.querySelectorAll(
    ".disabled-inputs input"
  );
  inputsInDisabledInputs.forEach((input) => (input.disabled = "true"));
  // Making all letters in upper case
  // Auto focus on next input
  const inputs = document.querySelectorAll("input");
  inputs.forEach((input, index) => {
    input.addEventListener("input", function () {
      this.value = this.value.toUpperCase();
      const nextInput = inputs[index + 1];
      if (nextInput) {
        nextInput.focus();
      }
    });
  });
  // Allow to move in inputs using arrows
  inputs.forEach((input, index) => {
    input.addEventListener("keydown", function (event) {
      //go to input to right
      if (event.key === "ArrowRight") {
        if (index < inputs.length) inputs[index + 1].focus();
      }
      //go to input to left
      if (event.key === "ArrowLeft") {
        if (index > 0) inputs[index - 1].focus();
      }
    });
  });
}

function handleGuesses() {
  messageArea.innerHTML = "";
  let successGuess = true;
  // Check If Any Letter Is Empty
  for (let i = 1; i <= numberOfLetters; i++) {
    const inputField = document.querySelector(
      `#guess-${currentTry}-letter-${i}`
    );
    if (inputField.value === "") {
      messageArea.innerHTML = `Letters Can't Be Empty!!`;
      return;
    }
  }
  // Check For Each Letter Is Correct or Not
  for (let i = 1; i <= numberOfLetters; i++) {
    const inputField = document.querySelector(
      `#guess-${currentTry}-letter-${i}`
    );
    // Game Logic
    const letter = inputField.value.toLowerCase();
    const actualLetter = wordToGuess[i - 1];
    if (letter === actualLetter) {
      // Letter Is Correct And In Place
      inputField.classList.add("yes-in-place");
    } else if (wordToGuess.includes(letter)) {
      // Letter Is Correct And Not In Place
      inputField.classList.add("not-in-place");
      successGuess = false;
    } else {
      // Letter Is wrong
      inputField.classList.add("no");
      successGuess = false;
    }
  }

  // Check If User Win Or Lose
  if (successGuess) {
    messageArea.innerHTML = `You Win, The Word Is <span>${wordToGuess}`;

    // Add Disabled to All inputs
    const inputsInDisabledInputs = document.querySelectorAll("input");
    inputsInDisabledInputs.forEach((input) => (input.disabled = "true"));

    // Disable Guess Button
    guessButton.disabled = true;
    hintButton.disabled = true;
  } else {
    if (currentTry < numberOfTries) {
      // Disable Inputs Of Current Try
      const inputsCurrentInputField = document.querySelectorAll(
        `.try-${currentTry} input`
      );
      inputsCurrentInputField.forEach((input) => (input.disabled = "true"));

      currentTry++;

      // Remove Disabled-Inputs Class For Next Try
      const NextInputField = document.querySelector(`.try-${currentTry}`);
      NextInputField.classList.remove("disabled-inputs");

      // Enable Inputs For Next Try
      const inputsNextInputField = document.querySelectorAll(
        `.try-${currentTry} input`
      );
      inputsNextInputField.forEach((input) => (input.disabled = false));

      // Focus On First Input In Next Try
      NextInputField.children[1].focus();
    } else {
      // Disable Inputs Of Last Try
      const inputsLastInputField = document.querySelectorAll(
        `.try-${currentTry} > input`
      );
      inputsLastInputField.forEach((input) => (input.disabled = false));

      // Disable Guess Button
      guessButton.disabled = true;
      hintButton.disabled = true;
      messageArea.innerHTML = `You Lose, The Word Is <span>${wordToGuess}`;
    }
  }
}

function handleHint() {
  let currentTryInput = document.querySelectorAll(`.try-${currentTry} input`);
  if (numberOfHints > 0) {
    let emptyInputs = Array.from(currentTryInput).filter(
      (input) => input.value === ""
    );
    if (emptyInputs.length > 0) {
      indexOfEmptyInput = Math.floor(Math.random() * emptyInputs.length);
      let indexOfHintedLetter = Array.from(currentTryInput).indexOf(
        emptyInputs[indexOfEmptyInput]
      );
      if (hintedIndexed.indexOf(indexOfHintedLetter) === -1) {
        hintedIndexed.push(indexOfHintedLetter);
        numberOfHints--;
        hintArea.innerHTML = `${numberOfHints} `;
      }
      currentTryInput[indexOfHintedLetter].value =
        wordToGuess[indexOfHintedLetter].toUpperCase();
      //acurrentTryInput[indexOfHintedLetter].disabled = true;
      currentTryInput[indexOfHintedLetter].classList.add("yes-in-place");
      emptyInputs[0].focus();
    }
  }
  if (numberOfHints === 0) {
    hintButton.disabled = true;
  }
}

function handleBackspaceAndEnter(event) {
  if (event.key === "Backspace") {
    let inputs = document.querySelectorAll(`.try-${currentTry} input`);
    let currentIndex = Array.from(inputs).indexOf(document.activeElement);
    if (currentIndex >= 0) {
      let currentInput = inputs[currentIndex];
      if (currentIndex === 0) {
        currentInput.value = "";
      } else {
        let prevInput = inputs[currentIndex - 1];
        if (document.activeElement.value !== "") {
          currentInput.value = "";
        } else {
          prevInput.value = "";
          prevInput.focus();
        }
      }
    }
  } else if (event.key === "Enter") {
    if (guessButton.disabled === false) handleGuesses();
  }
}

// Call handleBackspaceAndEnter Func When Click on Keyboard Keys
document.addEventListener("keydown", handleBackspaceAndEnter);

// Auto Call generateInputs Func onload
window.onload = function () {
  // Call the function to get a random word
  getRandomWord();
  generateInputs();
};
