// Validation - create interface to define the structure of validation object
interface Validatable {
  value: string | number;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

// function to validate the validatable object, i.e. check for all these properties to exist 
function validate(validatableInput: Validatable) {
  // default assumption is that what we get is true
  let isValid = true;

  // 1. check if validatableInput has 'required' property
  // can set isValid = isValid && => b/c this ensures that the new value of isValid wil be false if the statement after && is false. If at least one of the two statements is false, then the overall value will be false
    // isValid = true if:
      // 1. has 'required' property AND
      // 2. that there is an input (convert to string & add trim method) => if it's NOT zero, then will return TRUE and isValid stays TRUE
        // => if it is zero (length of 0), if it's empty, this will return FALSE & isValid will become FALSE 
  if (validatableInput.required) {
    isValid = isValid && validatableInput.value.toString().trim().length !== 0;
  }

  // 2. add a type guard to make sure validatableInput.value is equal to a string => if not a string, then we don't need to go into this 'if' check b/c then there is nothing to check
  // If it is a string, check that it has min length
  // to be super secure, check that minlength is not ZERO but checking if minLength is not equal to undefined or not equal to null (with one equal sign, as this includes both null & undefined)
  if (
    validatableInput.minLength != null &&
    typeof validatableInput.value === 'string'
  ) {
    isValid =
      isValid && validatableInput.value.length >= validatableInput.minLength;
  }
  // 3. check for max length
  if (
    validatableInput.maxLength != null &&
    typeof validatableInput.value === 'string'
  ) {
    isValid =
      isValid && validatableInput.value.length <= validatableInput.maxLength;
  }

  // 4. check if 'number' (for people input) & value >= min
    // make sure value is not 0 => != null & if type of validatable.value is equal to type 'number' => TRUE, otherwise isValid is FALSE
  if (
    validatableInput.min != null &&
    typeof validatableInput.value === 'number'
  ) {
    isValid = isValid && validatableInput.value >= validatableInput.min;
  }

  // 5. check if 'number' & value <= max
    // make sure value is not 0 => != null & if type of validatable.value is equal to type 'number' => TRUE, otherwise isValid is FALSE
  if (
    validatableInput.max != null &&
    typeof validatableInput.value === 'number'
  ) {
    isValid = isValid && validatableInput.value <= validatableInput.max;
  }
  return isValid;
}

// autobind decorator
function autobind(_: any, _2: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  const adjDescriptor: PropertyDescriptor = {
    configurable: true,
    get() {
      const boundFn = originalMethod.bind(this);
      return boundFn;
    }
  };
  return adjDescriptor;
}

// ProjectInput Class
class ProjectInput {
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  element: HTMLFormElement;
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;

  constructor() {
    this.templateElement = document.getElementById(
      'project-input'
    )! as HTMLTemplateElement;
    this.hostElement = document.getElementById('app')! as HTMLDivElement;

    const importedNode = document.importNode(
      this.templateElement.content,
      true
    );
    this.element = importedNode.firstElementChild as HTMLFormElement;
    this.element.id = 'user-input';

    this.titleInputElement = this.element.querySelector(
      '#title'
    ) as HTMLInputElement;
    this.descriptionInputElement = this.element.querySelector(
      '#description'
    ) as HTMLInputElement;
    this.peopleInputElement = this.element.querySelector(
      '#people'
    ) as HTMLInputElement;

    this.configure();
    this.attach();
  }

  private gatherUserInput(): [string, string, number] | void {
    const enteredTitle = this.titleInputElement.value;
    const enteredDescription = this.descriptionInputElement.value;
    const enteredPeople = this.peopleInputElement.value;

    // inside gatherUserInput() method is where we'll construct the validatable object
    // (side note: instead of an interface we could've also created a class here, then we could instantiate it with a new keyword)
    // create variables for each object we want validated and set it to type Validatable with value properties

    // 1. validatable object for title
    const titleValidatable: Validatable = {
      // user input value for title
      value: enteredTitle,
      // field cannot be empty
      required: true
    };

    // 2. validatable object for description
    const descriptionValidatable: Validatable = {
      // user input value for description
      value: enteredDescription,
      // field cannot be empty
      required: true,
      // min length of characters
      minLength: 5
    };

    // 3. validatable object for people
    const peopleValidatable: Validatable = {
      // user input value for number of people
      // + to convert from string to number
      value: +enteredPeople,
      // field cannot be empty
      required: true,
      // min/max num values
      min: 1,
      max: 5
    };

    // now we have our three validatable objects above and we run each through the validate function in the 'if' check below:
    if (
      !validate(titleValidatable) ||
      !validate(descriptionValidatable) ||
      !validate(peopleValidatable)
    ) {
      // if one of the objects is not valid, alert user
      alert('Invalid input, please try again!');
      return;
    } else {
      // otherwise return user's input values
      return [enteredTitle, enteredDescription, +enteredPeople];
    }
  }

  private clearInputs() {
    this.titleInputElement.value = '';
    this.descriptionInputElement.value = '';
    this.peopleInputElement.value = '';
  }

  @autobind
  private submitHandler(event: Event) {
    event.preventDefault();
    const userInput = this.gatherUserInput();
    if (Array.isArray(userInput)) {
      const [title, desc, people] = userInput;
      console.log(title, desc, people);
      this.clearInputs();
    }
  }

  private configure() {
    this.element.addEventListener('submit', this.submitHandler);
  }

  private attach() {
    this.hostElement.insertAdjacentElement('afterbegin', this.element);
  }
}

const prjInput = new ProjectInput();
