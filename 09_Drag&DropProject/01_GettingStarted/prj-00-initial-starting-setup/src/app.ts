// Validation interface (defines object that will be validated)
interface Validatable {
    value: string | number;
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
} // ? before name or include 'undefined' as type if you want property value to be optional

// function to heck if input is valid
function validate(validatableInput: Validatable) {
    let isValid= true;
    if(validatableInput.required) {
        isValid = isValid && validatableInput.value.toString().trim().length !== 0;
    }
    if(validatableInput.minLength != null && typeof validatableInput.value === 'string') {
        isValid = isValid && validatableInput.value.length >= validatableInput.minLength;
    }
    if(validatableInput.maxLength != null && typeof validatableInput.value === 'string') {
        isValid = isValid && validatableInput.value.length <= validatableInput.maxLength;
    }
    if(validatableInput.min != null && typeof validatableInput.value === 'number') {
        isValid = isValid && validatableInput.value >= validatableInput.min;
    }
    if(validatableInput.max != null && typeof validatableInput.value === 'number') {
        isValid = isValid && validatableInput.value <= validatableInput.max;
    }
    return isValid;
}

// Autobind decorator
function autobind(
    _target: any, 
    _2methodName: string, 
    descriptor: PropertyDescriptor
) {
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

// ProjectList class
class ProjectList {
    templateElement: HTMLTemplateElement;
    hostElement: HTMLDivElement;
    // element is a section; use HTMLElement
    element: HTMLElement;

    // constructor method to create 2 lists
    constructor(private projectType: 'active' | 'finished') {
        // to access elements
        this.templateElement = document.getElementById('project-list')! as HTMLTemplateElement;
        this.hostElement = document.getElementById('app')! as HTMLDivElement;
        const importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild as HTMLElement;

        // id name for section 
        this.element.id = `${this.projectType}-projects`;

        // call methods to attach section to DOM and render content (ie, h2, ul)
        this.attach();
        this.renderContent();
    }

    // method to render content (h2, ul)
    private renderContent() {
        // add id to project list
        const listId = `${this.projectType}-projects-list`;
        // access <ul> & add listId
        this.element.querySelector('ul')!.id = listId;
        // access <h2> & insert content
        this.element.querySelector('h2')!.textContent = this.projectType.toUpperCase() + ' PROJECTS';
    }

    // method to attach section to page
    private attach() {
        this.hostElement.insertAdjacentElement('beforeend', this.element);
    }
}

// ProjectInput Class
class ProjectInput {
    // define element types (template, div, form)
    templateElement: HTMLTemplateElement;
    hostElement: HTMLDivElement;
    element: HTMLFormElement;
    // define element types for user inputs
    titleInputElement: HTMLInputElement;
    descriptionInputElement: HTMLInputElement;
    peopleInputElement: HTMLInputElement;

    // function to create object
    constructor() {
        // get ACCESS to template & place where it should be rendered
        // store them as properties to the class
        this.templateElement = document.getElementById('project-input')! as HTMLTemplateElement;
        this.hostElement = document.getElementById('app')! as HTMLDivElement;

        const importedNode = document.importNode(this.templateElement.content, true);

        this.element = importedNode.firstElementChild as HTMLFormElement;
        this.element.id = 'user-input'; // add id name to inherit CSS styling

        // access to inputs & store them as properties to the the class
        this.titleInputElement = this.element.querySelector('#title') as HTMLInputElement;
        this.descriptionInputElement = this.element.querySelector('#description') as HTMLInputElement;
        this.peopleInputElement = this.element.querySelector('#people') as HTMLInputElement;

        // call class methods inside constructor function
        this.configure();
        this.attach();
    }

    // method to get all user's inputs
    private gatherUserInput(): [string, string, number] | void {
        // store inputs into variables
        const enteredTitle = this.titleInputElement.value;
        const enteredDescription = this.descriptionInputElement.value;
        const enteredPeople = this.peopleInputElement.value;

        // construct validatable object; type Validatable (the created interface above); add property values
        const titleValidatable: Validatable = {
            value: enteredTitle,
            required: true
        };
        const descriptionValidatable: Validatable = {
            value: enteredDescription,
            required: true,
            minLength: 5
        };
        const peopleValidatable: Validatable = {
            value: +enteredPeople,
            required: true,
            min: 1,
            max: 5
        };

        // run each validatable object based on user's input through the validate function
        // if one object is not valid, return alert or return tuple of user inputs
        if(
            !validate(titleValidatable) ||
            !validate(descriptionValidatable) ||
            !validate(peopleValidatable)
        ) {
            alert('Invalid input, please try again!');
            return;
        } else {
            return [enteredTitle, enteredDescription, +enteredPeople]
        }
    }

    // clear input
    private clearInputs() {
        this.titleInputElement.value = '';
        this.descriptionInputElement.value = '';
        this.peopleInputElement.value = '';
    }

    //submitHandler method (callback fn)
    @autobind
    private submitHandler(event: Event) {
        event.preventDefault();
        const userInput = this.gatherUserInput();
        
        if(Array.isArray(userInput)) {
            const [title, desc, people] = userInput;
            console.log(title, desc, people);
            // call method to clear fields
            this.clearInputs();
        }
    }

    // method for event listener
    private configure() {
        this.element.addEventListener('submit', this.submitHandler);
    }

    // method to render form on DOM
    private attach() {
        this.hostElement.insertAdjacentElement('afterbegin', this.element);
    }
}

// instatiate classes
const prjInput = new ProjectInput();
const activePrjList = new ProjectList('active');
const finishedPrjList = new ProjectList('finished');