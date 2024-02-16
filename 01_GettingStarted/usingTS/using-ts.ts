const button = document.querySelector("button")! as HTMLButtonElement;
const input1 = document.getElementById("num1")! as HTMLInputElement;
const input2 = document.getElementById("num2")! as HTMLInputElement;

function add(num1: number, num2: number) {
    return num1 + num2;
}

button.addEventListener("click", function() {
  console.log(add(+input1.value, +input2.value));
});

// not all html selectors have value property, so TS is telling us to be more explicit or to double check HTML since it does not have access to our HTML file that the selector does indeed have a value property

// we can let TS know that yes we have checked that the selector exists (and we will get a value property)
// "!" => this will NEVER yield 'null' and it will always find an element
// add syntax "as HTMLInputElement" to let TS know it will be an input element => this is called a TYPECAST (lets TS know which TYPE of element it will be)

// adding : after parameter allows us to indicate TYPEOF 
// ex. function add(num1: number, num2: number){}

// TS makes us be as EXPLICIT as possible during development
