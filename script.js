// Variables to store the calculator operation
let firstNumber = "";
let operator = "";
let secondNumber = "";

// Basic calculator functions

// Addition function
function add(a, b) {
  return a + b;
}

// Subtraction function
function subtract(a, b) {
  return a - b;
}

// Multiplication function
function multiply(a, b) {
  return a * b;
}

// Division function
function divide(a, b) {
  if (b === 0) {
    return "Error: Cannot divide by zero";
  }
  return a / b;
}

// Test the functions
console.log("Addition: 5 + 3 =", add(5, 3));
console.log("Subtraction: 10 - 4 =", subtract(10, 4));
console.log("Multiplication: 6 * 7 =", multiply(6, 7));
console.log("Division: 15 / 3 =", divide(15, 3));
console.log("Division by zero:", divide(10, 0));

// Operate function
function operate(operator, a, b) {
  switch (operator) {
    case "+":
      return add(a, b);
    case "-":
      return subtract(a, b);
    case "*":
      return multiply(a, b);
    case "/":
      return divide(a, b);
    default:
      return "Error: Invalid operator";
  }
}

// Test the operate function
console.log("5 + 3 =", operate("+", 5, 3));
console.log("10 - 4 =", operate("-", 10, 4));
console.log("6 * 7 =", operate("*", 6, 7));
console.log("15 / 3 =", operate("/", 15, 3));
console.log("10 / 0 =", operate("/", 10, 0));
console.log("Invalid operator:", operate("%", 10, 5));
