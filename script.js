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
    updateDisplay();
    return;
  }

  if (waitingForSecondOperand) {
    displayValue = "0.";
    waitingForSecondOperand = false;

    // Fix: Update equation display properly when entering decimal after operator
    const parts = equationDisplay.split(" ");
    if (parts.length >= 2) {
      equationDisplay = `${parts[0]} ${parts[1]} 0.`;
    } else {
      equationDisplay += "0.";
    }

    updateDisplay();
    return;
  }

  // Only add decimal if it doesn't already exist
  if (!displayValue.includes(dot)) {
    displayValue += dot;

    if (firstOperand === null) {
      equationDisplay = displayValue;
    } else if (currentOperator) {
      const parts = equationDisplay.split(" ");
      if (parts.length === 3) {
        // Make sure the displayValue is properly reflected in equation
        equationDisplay = `${parts[0]} ${parts[1]} ${displayValue}`;
      } else if (parts.length === 2) {
        // When equation has operator but no second operand yet
        equationDisplay += displayValue;
      }
    }
  }

  updateDisplay();
}

/**
 * Handles operator input (+, -, *, /)
 * @param {string} nextOperator - The operator that was pressed
 */
function handleOperator(nextOperator) {
  // Ensure displayValue is a valid number
  const inputValue = parseFloat(displayValue);

  // Reset result displayed flag when an operator is pressed
  resultDisplayed = false;

  // If we already have an operator and are waiting for second operand
  if (currentOperator && waitingForSecondOperand) {
    currentOperator = nextOperator;
    const operatorSymbol = getOperatorSymbol(nextOperator);
    const parts = equationDisplay.split(" ");

    // Make sure we're keeping the first part of the equation
    if (parts.length >= 1) {
      equationDisplay = `${parts[0]} ${operatorSymbol} `;
    }
    updateDisplay();
    return;
  }

  // First operator in the calculation
  if (firstOperand === null) {
    firstOperand = inputValue; // Convert to number
    const operatorSymbol = getOperatorSymbol(nextOperator);
    equationDisplay = `${displayValue} ${operatorSymbol} `;
  }
  // We already have a first operand and operator, now process them
  else if (currentOperator) {
    // Calculate with current values before setting new operator
    const result = operate(currentOperator, firstOperand, inputValue);

    // Handle error strings from operate function
    if (typeof result === "string") {
      displayValue = result;
      equationDisplay += " = " + result;
      currentOperator = null;
      waitingForSecondOperand = false;
      resultDisplayed = true;
      updateDisplay();
      return;
    }

    // Round result to avoid display overflow
    displayValue = formatResult(result);
    firstOperand = parseFloat(displayValue); // Convert to number explicitly

    // Update equation display with new operator
    const operatorSymbol = getOperatorSymbol(nextOperator);
    equationDisplay = `${displayValue} ${operatorSymbol} `;
  }

  waitingForSecondOperand = true;
  currentOperator = nextOperator;
  updateDisplay();
}

/**
 * Formats the result to avoid display overflow
 * @param {number|string} result - The calculation result
 * @returns {string} The formatted result
 */
function formatResult(result) {
  if (typeof result === "string") {
    return result; // Return error messages as-is
  }

  // Define maximum display length
  const MAX_DISPLAY_LENGTH = 15;

  // Handle floating point precision issues
  // For example, 0.1 + 0.2 = 0.30000000000000004
  // Round to 12 decimal places to eliminate most floating point errors
  result = parseFloat(result.toFixed(12));

  // Convert to string to check length
  let resultString = result.toString();

  // If the number exceeds display capacity
  if (resultString.length > MAX_DISPLAY_LENGTH) {
    // For very large or small numbers, use scientific notation
    return result.toExponential(MAX_DISPLAY_LENGTH - 7); // Allow space for e+XX notation
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
  // Ensure we're working with numbers
  a = parseFloat(a);
  b = parseFloat(b);

  // Check for NaN values
  if (isNaN(a) || isNaN(b)) {
    return "Error: Invalid input";
  }

  const operations = {
    "+": (x, y) => x + y,
    "-": (x, y) => x - y,
    "*": (x, y) => x * y,
    "×": (x, y) => x * y,
    x: (x, y) => x * y,
    "/": (x, y) => (y === 0 ? "Error: Division by zero" : x / y),
    "÷": (x, y) => (y === 0 ? "Error: Division by zero" : x / y),
  };

  // Make sure we have a valid operation
  if (!operations[operatorSymbol]) {
    return "Error: Invalid operator";
  }

  return operations[operatorSymbol](a, b);
}

/**
 * Handles equals button press
 */
function handleEquals() {
  // Don't do anything if we don't have the needed data
  if (!currentOperator || waitingForSecondOperand) return;

  const inputValue = parseFloat(displayValue);

  // Store the full equation before showing the result
  const fullEquation = `${equationDisplay} = `;

  // Calculate the result
  const result = operate(currentOperator, firstOperand, inputValue);

  // Handle error strings from operate function
  if (typeof result === "string") {
    displayValue = result;
    equationDisplay = fullEquation + result;
    currentOperator = null;
    waitingForSecondOperand = false;
    resultDisplayed = true;
    updateDisplay();
    return;
  }

  // Format result to avoid display overflow
  displayValue = formatResult(result);

  // Store the result in case we need it for further operations
  firstOperand = parseFloat(displayValue);

  // Reset state
  currentOperator = null;
  waitingForSecondOperand = false;
  resultDisplayed = true;

  // Show the full equation with result
  equationDisplay = fullEquation + displayValue;

  updateDisplay();
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
    // updateDisplay is called inside inputDecimal
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
      // updateDisplay is called inside handleOperator
    });
  });

  equalsButton.addEventListener("click", handleEquals);

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

  // Keyboard support
  document.addEventListener("keydown", function (event) {
    // Prevent default actions for some keys (like '/' which might trigger browser search)
    if (["+", "-", "*", "/", "x", "=", "Enter", "Escape", "Backspace", "."].includes(event.key)) {
      event.preventDefault();
    }

    // Number keys (0-9)
    if (/^[0-9]$/.test(event.key)) {
      inputDigit(event.key);
      updateDisplay();
    }
    // Decimal point
    else if (event.key === ".") {
      inputDecimal(".");
      // updateDisplay is called inside inputDecimal
    }
    // Operators
    else if (["+", "-", "*", "/"].includes(event.key)) {
      handleOperator(event.key);
      // updateDisplay is called inside handleOperator
    }
    // Handle 'x' key as multiplication
    else if (event.key === "x") {
      handleOperator("*");
      // updateDisplay is called inside handleOperator
    }
    // Equals (Enter or =)
    else if (event.key === "Enter" || event.key === "=") {
      handleEquals();
    }
    // Clear (Escape)
    else if (event.key === "Escape") {
      resetCalculator();
      updateDisplay();
    }
    // Backspace
    else if (event.key === "Backspace") {
      handleBackspace();
      updateDisplay();
    }
    // Percent (p key)
    else if (event.key === "p" || event.key === "%") {
      handlePercent();
      updateDisplay();
    }
  });
});
