// Project State Management
  //  this class will manage the state of our application (ie manages our projects), which also allows us to set up listeners in different parts of the app that are interested
    // this is similar to other frameworks like Angular or libraries like React & Redux
        // => that you have a global state management object and you listen to changes

class ProjectState {
  // property to hold array of listeners (fns)
  private listeners: any[] = [];
  // property to hold an array of projects
  private projects: any[] = [];
  // private property called instance that is of type ProjectState
  private static instance: ProjectState;

  // use a private constructor to guarantee that this is a singleton class
  private constructor() {}

  // static getInstance method => where we check if this.instance is a thing, if so, we can return this.instance 
  static getInstance() {
    if (this.instance) {
      return this.instance;
    }
    // i.e, this.instance will be equal to a new project state
    this.instance = new ProjectState();
    return this.instance;
  }

  // function to add listener functions to 'listeners' array
  addListener(listenerFn: Function) {
    this.listeners.push(listenerFn);
  }

  // define how project should look like
  // goal is to add an item to that list whenever we click the add project button
  // to make that work, inside of the ProjectState class we'll add a public project method
  addProject(title: string, description: string, numOfPeople: number) {
    // create a new project with object literal notation for now
    const newProject = {
      // have some id for every project
      id: Math.random().toString(),
      title: title,
      description: description,
      people: numOfPeople
    };
    
    // can reach out to the projects array in ProjectsState, which is private, from inside the class to push new project into the projects array
    this.projects.push(newProject);

    // the idea here is that whenever something changes, like here when we add a new project, we call all listener functions => we loop through all listeners & execute this as a function
     // and to that function we pass the thing that's relevant for it, based on the state we're managing, which in this case, in this class (ProjectState), is the our projects list
    for (const listenerFn of this.listeners) {
      // call slice() on it to only return a copy of that array (b/c arrays & objects are reference values)
      listenerFn(this.projects.slice());
    }

    // SO NOW every listener function is getting executed and gets our copy, our brand new copy of projects
    // Now we need to go to the places where we want to be informed about changes (ie project list class) and set up such a listener
  }

  // But still have some unclear questions:
    // 1. How do we call addProject from inside our class down there where we gather the user input from inside the submit handler?
    // 2. How do we call addProject()?
    // 3. And how do we pass that updated list of projects whenever it changes to the project list class?

  // Now we need to push that information that we have a new project to our ProjectList Class, because that's the class responsible for outputting something to the screen 
  // Want to set up a subscription pattern, where inside of our projectState we manage a list of listeners (a list of functions), which should be called whenever something changes.
}

// create an instance of ProjectState => a global constant, which we could use from the entire file
// const projectState = new ProjectState();

// now we can call getInstance here by changing it to:
const projectState = ProjectState.getInstance();
// this guarantees that we always work with the same exact same object & will always only have one object of the type in the entire application b/c we only want to have one state management object for our project (which is the ProjectState class with the SINGLETON constructor)

// Validation
interface Validatable {
  value: string | number;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

function validate(validatableInput: Validatable) {
  let isValid = true;
  if (validatableInput.required) {
    isValid = isValid && validatableInput.value.toString().trim().length !== 0;
  }
  if (
    validatableInput.minLength != null &&
    typeof validatableInput.value === 'string'
  ) {
    isValid =
      isValid && validatableInput.value.length >= validatableInput.minLength;
  }
  if (
    validatableInput.maxLength != null &&
    typeof validatableInput.value === 'string'
  ) {
    isValid =
      isValid && validatableInput.value.length <= validatableInput.maxLength;
  }
  if (
    validatableInput.min != null &&
    typeof validatableInput.value === 'number'
  ) {
    isValid = isValid && validatableInput.value >= validatableInput.min;
  }
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

// ProjectList Class
class ProjectList {
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  element: HTMLElement;
  // add new field; type any array & will equal any projects we are getting
  assignedProjects: any[];

  constructor(private type: 'active' | 'finished') {
    this.templateElement = document.getElementById(
      'project-list'
    )! as HTMLTemplateElement;
    this.hostElement = document.getElementById('app')! as HTMLDivElement;

    // need to reference 'assignedProjects' inside constructor
    this.assignedProjects = [];

    const importedNode = document.importNode(
      this.templateElement.content,
      true
    );
    this.element = importedNode.firstElementChild as HTMLElement;
    this.element.id = `${this.type}-projects`;

    // BEFORE we attach and render content, reach out to global constant 'projectState' and call addListener
    // have to pass the listener function to addListener
    // the listeners we're managing here in the global 'projectState', will be called when something changes
      // so will need to add a function, an anonymous arrow function that will get a list of projects when it's called from inside projectState

    projectState.addListener((projects: any[]) => {
      // adding projects to 'assignedProjects' array whenever there is a change in state => not really adding it but overriding the assigned projects with new projects
      this.assignedProjects = projects;
      // so we get a list of projects inside of this function body, we can then use this list of projects => idea is to render all these projects => can create a new method to achieve that

      // call renderProjects from inside here
      this.renderProjects();
    });

    this.attach();
    this.renderContent();
  }

  // method to render projects, which will only be called once new projects are added (renderContent runs first)
  private renderProjects() {
    // access list from renderContent, add ! and type cast to make it clear it will not be null
    const listEl = document.getElementById(`${this.type}-projects-list`)! as HTMLUListElement;

     // loop through all the project items of assignedProjects, and for every item I want to add something to the list
    for (const prjItem of this.assignedProjects) {
      // every li (project item) is a project, which is an object

      // create li element
      const listItem = document.createElement('li');
      // add title to li
      listItem.textContent = prjItem.title;
      // append li to ul
      listEl.appendChild(listItem)
    }
  }

  private renderContent() {
    const listId = `${this.type}-projects-list`;
    this.element.querySelector('ul')!.id = listId;
    this.element.querySelector('h2')!.textContent =
      this.type.toUpperCase() + ' PROJECTS';
  }

  private attach() {
    this.hostElement.insertAdjacentElement('beforeend', this.element);
  }
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

    if (
      !validate(titleValidatable) ||
      !validate(descriptionValidatable) ||
      !validate(peopleValidatable)
    ) {
      alert('Invalid input, please try again!');
      return;
    } else {
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
      projectState.addProject(title, desc, people);
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
const activePrjList = new ProjectList('active');
const finishedPrjList = new ProjectList('finished');
