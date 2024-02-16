function add(n1: number, n2: number, showResult: boolean, phrase: string) {
  // if (typeof n1 !== 'number' || typeof n2 !== 'number') {
  //   throw new Error('Incorrect input!');
  // }

  const result = n1 + n2;
  if(showResult) {
    console.log(phrase + result);
    // if console as console.log(phrase + n1 + n2) => outputs whole thing as a string ('Result is: 52.8'); does not compute the mathematics, just concats all variable values into one string. Therefore, store calculation into a separate variable (i.e. 'result' above) => should console 'Result is: 7.8'
  } else {
    return result;
  }
}

const number1 = 5; // 5.0
const number2 = 2.8;
const printResult = true;
const resultPhrase = 'Result is: ';

add(number1, number2, printResult, resultPhrase);

// Core types:
  // 1. number
  // 2. boolean
  // 3. string

// in addition to defining parameters/arguments globally and/or locally => must also explicitly assign core types to all the fn parameters (typeof)