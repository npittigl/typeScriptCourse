/// <reference path="base-component.ts" />
/// <reference path="../utilities/validation.ts" />
/// <reference path="../decorators/autobind.ts" />
/// <reference path="../state/project-state.ts" />

namespace App {
    // ProjectInput Class
    // we restructured ProjectInput to take advantage of inheritance & let base class do a lot of the work
    // extends Component class
    export class ProjectInput extends Component< HTMLDivElement, HTMLFormElement> {
        // define element types for user inputs
        titleInputElement: HTMLInputElement;
        descriptionInputElement: HTMLInputElement;
        peopleInputElement: HTMLInputElement;

        // function to create object
        constructor() {
            // pass id of template, id of host element, insertBefore = true, and newElementId to super()
            super('project-input', 'app', true, 'user-input');

            // access to inputs & store them as properties to the the class
            this.titleInputElement = this.element.querySelector('#title') as HTMLInputElement;
            this.descriptionInputElement = this.element.querySelector('#description') as HTMLInputElement;
            this.peopleInputElement = this.element.querySelector('#people') as HTMLInputElement;

            // call class methods inside constructor function
            this.configure();
        }

        // method for event listener
        // make configure public & convention to have public methods before private methods
        configure() {
            this.element.addEventListener('submit', this.submitHandler);
        }

        // TS complains it needs renderContent(), so we add it b/c we need to even though it's not doing anything in it but it satisfies our base class
        renderContent() {}

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
                // now we can call projectState.addProject here, passing title, desc, people as arguments & now the project can be created based on user's input
                // Now we need to push that information that we have a new project to our ProjectList Class, because that's the class responsible for outputting something to the screen
                projectState.addProject(title, desc, people);
                // call method to clear fields
                this.clearInputs();
            }
        }
    }
}