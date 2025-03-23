// DOM elements
const display = document.getElementById('display');
const buttons = document.querySelectorAll('.btn');
const clearBtn = document.getElementById('clear');
const backspaceBtn = document.getElementById('backspace');
const equalsBtn = document.getElementById('equals');
const calculator = document.querySelector('.calculator');

// Debug mode
const DEBUG = true;

// Variables to track calculation state
let firstOperand = '';
let secondOperand = '';
let currentOperator = null;
let shouldResetDisplay = false;
let isFaultyResult = false;

// Initialize the calculator
function init() {
    logDebug('Calculator initialized');
    
    // Check for CSS animations support
    if (!isAnimationSupported()) {
        document.body.classList.add('no-animations');
        logDebug('CSS animations not fully supported in this browser');
    }
    
    // Check for backdrop-filter support
    if (!isBackdropFilterSupported()) {
        document.querySelectorAll('.container::before').forEach(el => {
            el.style.backdropFilter = 'none';
            el.style.background = 'rgba(0, 30, 60, 0.8)';
        });
        logDebug('backdrop-filter not supported in this browser');
    }

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            logDebug(`Button clicked: ${button.id}`);
            if (button.classList.contains('number')) {
                inputNumber(button.id);
            } else if (button.classList.contains('operator')) {
                inputOperator(button.id);
            } else if (button.id === '.') {
                inputDecimal();
            } else if (button.id === 'equals') {
                calculate();
            } else if (button.id === 'clear') {
                clearAll();
            } else if (button.id === 'backspace') {
                backspace();
            }
        });
    });

    // Add keyboard support
    window.addEventListener('keydown', handleKeyboardInput);
    
    // Add debug button if in debug mode
    if (DEBUG) {
        createDebugButton();
    }
}

function logDebug(message) {
    if (DEBUG) {
        console.log(`[Calculator Debug]: ${message}`);
    }
}

function isAnimationSupported() {
    const elm = document.createElement('div');
    return typeof elm.style.animation !== 'undefined';
}

function isBackdropFilterSupported() {
    const elm = document.createElement('div');
    return typeof elm.style.backdropFilter !== 'undefined';
}

function createDebugButton() {
    const debugBtn = document.createElement('button');
    debugBtn.textContent = 'Debug Info';
    debugBtn.id = 'debug-btn';
    debugBtn.style.position = 'fixed';
    debugBtn.style.bottom = '10px';
    debugBtn.style.right = '10px';
    debugBtn.style.zIndex = '9999';
    debugBtn.style.background = '#333';
    debugBtn.style.color = '#fff';
    debugBtn.style.border = 'none';
    debugBtn.style.padding = '8px 15px';
    debugBtn.style.borderRadius = '5px';
    debugBtn.style.cursor = 'pointer';
    
    debugBtn.addEventListener('click', () => {
        showDebugInfo();
    });
    
    document.body.appendChild(debugBtn);
}

function showDebugInfo() {
    const debugInfo = {
        'Browser': navigator.userAgent,
        'Window Size': `${window.innerWidth}x${window.innerHeight}`,
        'Pixel Ratio': window.devicePixelRatio,
        'Animation Support': isAnimationSupported(),
        'Backdrop Filter Support': isBackdropFilterSupported(),
        'Current State': {
            firstOperand,
            secondOperand,
            currentOperator,
            shouldResetDisplay,
            isFaultyResult
        }
    };
    
    console.table(debugInfo);
    alert('Debug info logged to console. Press F12 to view.');
}

function inputNumber(number) {
    if (shouldResetDisplay) {
        display.value = '';
        shouldResetDisplay = false;
    }
    // Reset faulty indication when starting new input
    if (isFaultyResult) {
        isFaultyResult = false;
        display.classList.remove('wrong-result');
    }
    display.value += number;
    logDebug(`Number input: ${number}, Display: ${display.value}`);
}

function inputOperator(operator) {
    logDebug(`Operator input: ${operator}`);
    if (currentOperator !== null) calculate();
    firstOperand = display.value;
    currentOperator = operator;
    shouldResetDisplay = true;
    logDebug(`First operand set to: ${firstOperand}, Operator: ${currentOperator}`);
}

function inputDecimal() {
    if (shouldResetDisplay) {
        display.value = '0';
        shouldResetDisplay = false;
    }
    if (!display.value.includes('.')) {
        display.value += '.';
        logDebug('Decimal point added');
    } else {
        logDebug('Decimal point already exists');
    }
}

function clearAll() {
    display.value = '';
    firstOperand = '';
    secondOperand = '';
    currentOperator = null;
    
    // Reset faulty indication
    if (isFaultyResult) {
        isFaultyResult = false;
        display.classList.remove('wrong-result');
    }
    logDebug('Calculator cleared');
}

function backspace() {
    display.value = display.value.toString().slice(0, -1);
    logDebug(`Backspace pressed, Display: ${display.value}`);
}

function calculate() {
    if (currentOperator === null || shouldResetDisplay) {
        logDebug('Calculate called but no operation to perform');
        return;
    }
    
    secondOperand = display.value;
    logDebug(`Calculating: ${firstOperand} ${currentOperator} ${secondOperand}`);
    
    // Determine if this should be a faulty calculation
    const shouldBeFaulty = Math.random() < 0.1;
    let result;
    
    if (shouldBeFaulty) {
        // 10% chance of performing the wrong operation
        result = performFaultyOperation(parseFloat(firstOperand), parseFloat(secondOperand), currentOperator);
        logDebug(`FAULTY calculation performed: Result = ${result}`);
        
        // Indicate this is a faulty result
        isFaultyResult = true;
        display.classList.add('wrong-result');
        
        // Flash notification message
        showWrongAnswerIndicator();
    } else {
        // 90% chance of performing the correct operation
        result = performCorrectOperation(parseFloat(firstOperand), parseFloat(secondOperand), currentOperator);
        logDebug(`Normal calculation performed: Result = ${result}`);
        
        // Reset faulty indication
        isFaultyResult = false;
        display.classList.remove('wrong-result');
    }
    
    // Handle NaN, Infinity and undefined results
    if (isNaN(result) || !isFinite(result)) {
        logDebug(`Error in calculation: ${result}`);
        display.value = 'Error';
    } else {
        // Display result
        display.value = roundResult(result);
    }
    
    // Reset state for next calculation
    firstOperand = display.value;
    currentOperator = null;
    shouldResetDisplay = true;
}

function showWrongAnswerIndicator() {
    // Create or get notification element
    let notification = document.getElementById('wrong-notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'wrong-notification';
        notification.textContent = 'Wrong Answer!';
        document.querySelector('.calculator').appendChild(notification);
        logDebug('Created wrong answer notification');
    }
    
    // Show notification
    notification.classList.add('show');
    logDebug('Showing wrong answer notification');
    
    // Hide after delay
    setTimeout(() => {
        notification.classList.remove('show');
        logDebug('Hiding wrong answer notification');
    }, 2000);
}

function performCorrectOperation(a, b, operator) {
    logDebug(`Performing correct operation: ${a} ${operator} ${b}`);
    switch (operator) {
        case '+':
            return a + b;
        case '-':
            return a - b;
        case '*':
            return a * b;
        case '/':
            return a / b;
        default:
            return b;
    }
}

function performFaultyOperation(a, b, operator) {
    logDebug(`Performing faulty operation for: ${a} ${operator} ${b}`);
    // Faulty operations mapping:
    // + → -
    // * → +
    // - → /
    // / → **
    switch (operator) {
        case '+':
            return a - b; // Addition becomes subtraction
        case '-':
            return a / b; // Subtraction becomes division
        case '*':
            return a + b; // Multiplication becomes addition
        case '/':
            return a ** b; // Division becomes exponentiation
        default:
            return b;
    }
}

function roundResult(number) {
    // Handle floating point precision issues
    return Math.round(number * 1000000) / 1000000;
}

function handleKeyboardInput(e) {
    logDebug(`Key pressed: ${e.key}`);
    if (e.key >= '0' && e.key <= '9') inputNumber(e.key);
    if (e.key === '.') inputDecimal();
    if (e.key === '=' || e.key === 'Enter') calculate();
    if (e.key === 'Backspace') backspace();
    if (e.key === 'Escape') clearAll();
    if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/') {
        inputOperator(e.key);
    }
}

// Add a fallback style for browsers that don't support certain CSS features
function addCssFallbacks() {
    const style = document.createElement('style');
    style.textContent = `
    .no-animations * {
        animation: none !important;
        transition: none !important;
    }
    
    @supports not (backdrop-filter: blur(8px)) {
        .container::before {
            background: rgba(0, 30, 60, 0.8);
        }
    }
    `;
    document.head.appendChild(style);
    logDebug('Added CSS fallbacks');
}

// Check browser compatibility
function checkCompatibility() {
    const issues = [];
    
    if (!isAnimationSupported()) {
        issues.push('Animations not fully supported');
    }
    
    if (!isBackdropFilterSupported()) {
        issues.push('backdrop-filter not supported');
    }
    
    if (!CSS.supports('display', 'grid')) {
        issues.push('CSS Grid not supported');
    }
    
    if (issues.length > 0) {
        console.warn('Compatibility issues detected:', issues);
    }
    
    return issues;
}

// Add browser compatibility fixes
addCssFallbacks();
checkCompatibility();

// Start the calculator
init(); 