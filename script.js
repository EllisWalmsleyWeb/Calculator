// Calculator state variables
let displayValue = "0"; // Current value in the display
let firstOperand = null; // First number in calculation
let currentOperator = null; // Current operator (+, -, *, /)
let waitingForSecondOperand = false; // Flag for after operator press
let equationDisplay = ""; // Shows the full equation
let resultDisplayed = false; // Flag to indicate if a result was just displayed

/**
 * Updates the calculator display with current values
 */
function updateDisplay() {
  document.querySelector("#value-text").textContent = displayValue;
  document.querySelector("#equation-text").textContent = equationDisplay;
}

/**
 * Handles digit input (0-9)
 * @param {string} digit - The digit that was pressed
 * Enforces maximum display length and provides visual feedback when limit is reached
 * May call updateDisplay() directly when starting a new calculation
 */
function inputDigit(digit) {
  // Define a reasonable maximum length for user input
  const MAX_DISPLAY_LENGTH = 15;

  // Start a new calculation if a result was just displayed
  if (resultDisplayed) {
    displayValue = digit;
    equationDisplay = digit;
    firstOperand = null;
    currentOperator = null;
    resultDisplayed = false;
    updateDisplay();
    return;
  }

  // Check if we're at the maximum display length and we're not waiting for second operand
  if (displayValue.length >= MAX_DISPLAY_LENGTH && !waitingForSecondOperand) {
    // Optional: Provide visual feedback that limit is reached
    flashDisplay();
    return; // Ignore additional input
  }

  if (waitingForSecondOperand) {
    displayValue = digit;
    waitingForSecondOperand = false;
    equationDisplay += digit;
  } else {
    displayValue = displayValue === "0" ? digit : displayValue + digit;

    if (firstOperand === null) {
      equationDisplay = displayValue;
    } else if (currentOperator) {
      if (equationDisplay.endsWith(" ")) {
        equationDisplay += digit;
      } else {
        const parts = equationDisplay.split(" ");
        if (parts.length === 3) {
          equationDisplay = `${parts[0]} ${parts[1]} ${displayValue}`;
        }
      }
    }
  }
}

/**
 * Provides visual feedback when display limit is reached
 * Temporarily adds a 'flash' class to the display element
 */
function flashDisplay() {
  const display = document.querySelector("#value-text");
  display.classList.add("flash");
  setTimeout(() => {
    display.classList.remove("flash");
  }, 200);
}

/**
 * Handles decimal point input
 * @param {string} dot - The decimal point character
 */
function inputDecimal(dot) {
  // Start a new calculation if a result was just displayed
  if (resultDisplayed) {
    displayValue = "0.";
    equationDisplay = "0.";
    firstOperand = null;
    currentOperator = null;
    resultDisplayed = false;
    return;
  }

  if (waitingForSecondOperand) {
    displayValue = "0.";
    equationDisplay += "0.";
    waitingForSecondOperand = false;
    return;
  }

  if (!displayValue.includes(dot)) {
    displayValue += dot;

    if (firstOperand === null) {
      equationDisplay = displayValue;
    } else if (currentOperator) {
      const parts = equationDisplay.split(" ");
      if (parts.length === 3) {
        equationDisplay = `${parts[0]} ${parts[1]} ${displayValue}`;
      } else {
        equationDisplay += dot;
      }
    }
  }
}

/**
 * Handles operator input (+, -, *, /)
 * @param {string} nextOperator - The operator that was pressed
 */
function handleOperator(nextOperator) {
  const inputValue = parseFloat(displayValue);

  // Reset result displayed flag when an operator is pressed
  resultDisplayed = false;

  if (currentOperator && waitingForSecondOperand) {
    currentOperator = nextOperator;
    const operatorSymbol = getOperatorSymbol(nextOperator);
    const parts = equationDisplay.split(" ");
    equationDisplay = `${parts[0]} ${operatorSymbol} `;
    return;
  }

  if (firstOperand === null) {
    firstOperand = inputValue;
    const operatorSymbol = getOperatorSymbol(nextOperator);
    equationDisplay = `${displayValue} ${operatorSymbol} `;
  } else if (currentOperator) {
    const result = operate(currentOperator, firstOperand, inputValue);
    // Round result to avoid display overflow
    displayValue = formatResult(result);
    firstOperand = parseFloat(displayValue);

    const operatorSymbol = getOperatorSymbol(nextOperator);
    equationDisplay = `${displayValue} ${operatorSymbol} `;
  }

  waitingForSecondOperand = true;
  currentOperator = nextOperator;
}

/**
 * Formats the result to avoid display overflow
 * @param {number|string} result - The calculation result
 * @returns {string} The formatted result
 * Uses MAX_DISPLAY_LENGTH to determine when to switch to scientific notation
 * For decimal numbers, dynamically calculates available space for decimal places
 */
function formatResult(result) {
  if (typeof result === "string") {
    return result; // Return error messages as-is
  }

  // Define maximum display length
  const MAX_DISPLAY_LENGTH = 15;

  // Convert to string to check length
  let resultString = result.toString();

  // If the number exceeds display capacity
  if (resultString.length > MAX_DISPLAY_LENGTH) {
    // For very large or small numbers, use scientific notation
    return result.toExponential(MAX_DISPLAY_LENGTH - 7); // Allow space for e+XX notation
  }

  // For decimals, limit to a reasonable number of decimal places
  if (resultString.includes(".")) {
    // Determine available space for decimals
    const integerPart = Math.floor(Math.abs(result)).toString().length;
    // Account for negative sign if present
    const signPart = result < 0 ? 1 : 0;
    // Account for decimal point
    const decimalPointLength = 1;
    // Calculate max decimal places that can fit
    const maxDecimalPlaces = MAX_DISPLAY_LENGTH - integerPart - signPart - decimalPointLength;

    return String(parseFloat(Number(result).toFixed(Math.max(0, maxDecimalPlaces))));
  }

  return resultString;
}

/**
 * Converts internal operator to display symbol
 * @param {string} operator - The operator to convert
 * @returns {string} The display-friendly operator symbol
 */
function getOperatorSymbol(operator) {
  const symbolMap = {
    "*": "×",
    "/": "÷",
  };
  return symbolMap[operator] || operator;
}

/**
 * Resets the calculator to initial state
 */
function resetCalculator() {
  displayValue = "0";
  firstOperand = null;
  currentOperator = null;
  waitingForSecondOperand = false;
  equationDisplay = "";
  resultDisplayed = false;
}

/**
 * Handles backspace button press
 */
function handleBackspace() {
  if (waitingForSecondOperand || resultDisplayed) {
    return;
  }

  if (displayValue.length > 1) {
    displayValue = displayValue.slice(0, -1);

    if (firstOperand === null) {
      equationDisplay = displayValue;
    } else if (currentOperator) {
      const parts = equationDisplay.split(" ");
      if (parts.length === 3) {
        parts[2] = displayValue;
        equationDisplay = parts.join(" ");
      }
    }
  } else {
    displayValue = "0";

    if (firstOperand === null) {
      equationDisplay = "";
    } else if (currentOperator) {
      const parts = equationDisplay.split(" ");
      if (parts.length === 3) {
        parts[2] = "0";
        equationDisplay = parts.join(" ");
      }
    }
  }
}

/**
 * Handles percentage button press
 */
function handlePercent() {
  if (displayValue === "0" || displayValue === "") return;

  const currentValue = parseFloat(displayValue);
  let percentValue;

  if (firstOperand !== null && currentOperator) {
    switch (currentOperator) {
      case "+":
      case "-":
        // For addition/subtraction: calculate percentage of first operand
        percentValue = (firstOperand * currentValue) / 100;
        break;
      default:
        // For multiplication/division: just convert to decimal
        percentValue = currentValue / 100;
    }

    displayValue = String(percentValue);

    const parts = equationDisplay.split(" ");
    if (parts.length === 3) {
      parts[2] = displayValue;
      equationDisplay = parts.join(" ");
    }
  } else {
    // Simple percent conversion when no operation is in progress
    percentValue = currentValue / 100;
    displayValue = String(percentValue);
    equationDisplay = displayValue;
  }
}

/**
 * Performs calculation based on the specified operator
 * @param {string} operatorSymbol - The operator to use for calculation
 * @param {number} a - First operand
 * @param {number} b - Second operand
 * @returns {number|string} The result of the calculation or error message
 */
function operate(operatorSymbol, a, b) {
  const operations = {
    "+": (x, y) => x + y,
    "-": (x, y) => x - y,
    "*": (x, y) => x * y,
    "×": (x, y) => x * y,
    "/": (x, y) => (y === 0 ? "Error: Division by zero" : x / y),
    "÷": (x, y) => (y === 0 ? "Error: Division by zero" : x / y),
  };

  return operations[operatorSymbol] ? operations[operatorSymbol](a, b) : b;
}

// Initialize calculator when DOM is fully loaded
document.addEventListener("DOMContentLoaded", function () {
  // Connect UI elements
  const numberButtons = document.querySelectorAll(".number");
  const operatorButtons = document.querySelectorAll(".operator");
  const equalsButton = document.querySelector("#equals");
  const clearButton = document.querySelector("#clear");
  const backspaceButton = document.querySelector("#backspace");
  const decimalButton = document.querySelector("#decimal");
  const percentButton = document.querySelector("#percent");

  // Set up event listeners
  numberButtons.forEach((button) => {
    button.addEventListener("click", () => {
      inputDigit(button.textContent);
      updateDisplay();
    });
  });

  decimalButton.addEventListener("click", () => {
    inputDecimal(".");
    updateDisplay();
  });

  operatorButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // Handle percent button separately
      if (button.id === "percent") return;

      const operatorMap = {
        "×": "*",
        "÷": "/",
      };
      const operatorSymbol = operatorMap[button.textContent] || button.textContent;
      handleOperator(operatorSymbol);
      updateDisplay();
    });
  });

  equalsButton.addEventListener("click", () => {
    if (!currentOperator || waitingForSecondOperand) return;

    const inputValue = parseFloat(displayValue);
    const result = operate(currentOperator, firstOperand, inputValue);
    const fullEquation = equationDisplay + " = ";

    // Format result to avoid display overflow
    displayValue = formatResult(result);
    firstOperand = parseFloat(displayValue);
    currentOperator = null;
    waitingForSecondOperand = false;
    resultDisplayed = true; // Set flag to indicate result was displayed
    equationDisplay = fullEquation;

    updateDisplay();
  });

  clearButton.addEventListener("click", () => {
    resetCalculator();
    updateDisplay();
  });

  backspaceButton.addEventListener("click", () => {
    handleBackspace();
    updateDisplay();
  });

  percentButton.addEventListener("click", () => {
    handlePercent();
    updateDisplay();
  });

  // Initialize the display
  updateDisplay();
});
