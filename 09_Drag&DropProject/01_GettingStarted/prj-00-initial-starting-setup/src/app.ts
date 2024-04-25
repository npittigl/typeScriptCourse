// Project State Management class
    
class ProjectState {
    // property to hold array of listeners (fns)
    private listeners: any[] = [];
    // property to hold an array of projects
    private projects: any[] = [];
    // another private property called instance that is of type ProjectState
    private static instance: ProjectState;

    // use a private constructor to guarantee that this is a singleton class
    private constructor() {}

    // static getInstance method => to check then return this.instance 
    static getInstance() {
        if(this.instance) {
            return this.instance
        }
        // i.e, this.instance will be equal to a new project state
        this.instance = new ProjectState();
        return this.instance;
    }

    // function to add listeners fns to listeners array
    addListener(listenerFn: Function) {
        this.listeners.push(listenerFn);
    }

    // define how project should look like
    addProject(title: string, description: string, numOfpeople: number) {
        // create a new project with object literal notation for now
        const newProject = {
            id: Math.random().toString(),
            title: title,
            description: description,
            people: numOfpeople
        };

        // push newProject into projects array
        this.projects.push(newProject);

        // whenever state changes (ex add new project), we loop through all listeners and execute as function
        for (const listenerFn of this.listeners) {
            // .slice() to make copy of projects
            listenerFn(this.projects.slice());
        }
    }
}

// create an instance of ProjectState => a global constant, which we could use from the entire file
const projectState = ProjectState.getInstance();

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
    // add new field; type any array & will equal any projects we are getting
    assignedProjects: any[];

    // constructor method to create 2 lists
    constructor(private projectType: 'active' | 'finished') {
        // to access elements
        this.templateElement = document.getElementById('project-list')! as HTMLTemplateElement;
        this.hostElement = document.getElementById('app')! as HTMLDivElement;
        // need to reference 'assignedProjects' inside constructor
        this.assignedProjects = [];

        const importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild as HTMLElement;

        // id name for section 
        this.element.id = `${this.projectType}-projects`;

        // before we attach and render content, reach out to global constant 'projectState' and call addListener
        projectState.addListener((projects: any[]) => {
            // overriding assignedProjects with new projects, now can access list of projects & render them
            this.assignedProjects = projects;
            // call renderProjects from inside here
            this.renderProjects();
        });

        // call methods to attach section to DOM and render content (ie, h2, ul)
        this.attach();
        this.renderContent();
    }

    // method to render projects
    private renderProjects() {
        // access list from renderContent
        const listEl = document.getElementById(`${this.projectType}-projects-list`)! as HTMLUListElement;
        // loop through all the project items of assignedProjects
        for(const prjItem of this.assignedProjects) {
            // every li (project item) is a project, which is an object
            // create li element
            const listItem = document.createElement('li');
            // add title to li
            listItem.textContent = prjItem.title;
            // append li to ul
            listEl.appendChild(listItem);
        }
    }

    // method to render content (h2, ul) and is called before renderProjects
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
            // now we can call projectState.addProject here, passing title, desc, people as arguments & now the project can be created based on user's input
            // Now we need to push that information that we have a new project to our ProjectList Class, because that's the class responsible for outputting something to the screen
            projectState.addProject(title, desc, people);
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