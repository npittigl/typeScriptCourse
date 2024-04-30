// Project Type
enum ProjectStatus {
  Active,
  Finished
}

// class project to define project obj structure
class Project {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public people: number,
    public status: ProjectStatus
  ) {}
}

// Project State Management

// custom type for listener
// now this means we don't know whether our listener will actually return an array of projects (Projects[]) -> so change function type to GENERIC type "T", so we can set this from outside
type Listener<T> = (items: T[]) => void;

// base class for ProjectState
// we make State generic
// so when we extend State, we have to specify the type of data this state will work with
// and instead of State, this then gets forwarded to our Listener custom type (above)
class State<T> {
  // move array of listeners & addListener method to this base class

  // property to hold array of listeners (fns); of type Listener
  // add access modifier "protected", which is similar to private but also allows access from inheriting classes 
  // PROTECTED = it can't be accessed from outside the class, but can be accessed by any class that inherits it
  protected listeners: Listener<T>[] = [];

  // function to add listener fns to listeners array
  // listenerFn becomes type 'Listener' instead of type 'Function'
  addListener(listenerFn: Listener<T>) {
    this.listeners.push(listenerFn);
  }
}

// Project State Management class
// can restructure our ProjectState
// technically we don't need inheritance b/c we only have this one single state we manage in this entire application, but imagine a bigger application with multiple different states (ex. one for user state, one for projects, one for shopping cart etc.)   
// some features of this state class are always the same, ex. array of listeners & addListener() method => so we could use a base class here
// to use the State base class: ProjectState class extends the State class & provide a concrete value for that generic place holder ("T"); here that concrete placeholder is Project => b/c the ProjectState is all about managing Projects
class ProjectState extends State<Project> {
  private projects: Project[] = [];
  private static instance: ProjectState;

  // use a private constructor to guarantee that this is a singleton class
  private constructor() {
    // b/c of inheritance we need to call super method inside ProjectState constructor
    super();
  }

  static getInstance() {
    if (this.instance) {
      return this.instance;
    }
    this.instance = new ProjectState();
    return this.instance;
  }

  addProject(title: string, description: string, numOfPeople: number) {
    const newProject = new Project(
      Math.random().toString(),
      title,
      description,
      numOfPeople,
      ProjectStatus.Active
    );
    this.projects.push(newProject);
    for (const listenerFn of this.listeners) {
      listenerFn(this.projects.slice());
    }
  }
}

const projectState = ProjectState.getInstance();

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

// Component Base Class

// Base class to house all element types
    // => like in react; you can think of these classes as user interface components, which you render to the screen. And every componenet in the end is a renderable object which has some functionalities that allow us to render it => then the concrete instances, or the inherited classes, add extra functionality which this specific component needs
// we do have problem re: types -> ex. templateElement will always be a HTMLTemplateElement but hostElement doesn't always have to be a div, for ex., when we add a project list item class, we'll render that in a ProjectList, and not directly in our root div
// And in ProjectInput 'element' has more specific type as HTMLFormElement vs. HTMLElement
// so we would lose this extra information if we restrict ourselves to always having just an HTMLElement there, w/o storing more specific information
// How do we work around this? By not just using INHERITANCE but by creating a GENERIC CLASS here, where when we inherit from it, we can set the concrete types
// add angle brackets after class name, inside add 2 identifiers of our choice, like T & U, and add some CONSTRAINTS

// mark this class as ABSTRACT b/c people should never directly instantiate it, should always be used for INHERITANCE => add 'abstract' keyword in front of class to make sure we cannot instantiate it
abstract class Component<T extends HTMLElement, U extends HTMLElement> {
  // we can say that T and U will be some kind of HTMLElement
    // hostElement is type T
    // element is type U
    // And now, whenever we inherit from this class, we can specify the concrete types so that we can with different types in different places where we inherit
  templateElement: HTMLTemplateElement;
  hostElement: T;
  element: U;

  // constructor:
  // need to know ID of our template so we know how to select it, 
  // need to know hostElement ID so we know where to render this component, 
  // and need to get a newElementId, so that we get an ID that has to be assigned to the newly rendered element 
    // => optional, which we indicate by putting '?' after parameter or you can add 'undefined' as a type (newElementId: string | undefined)
  constructor(
    templateId: string,
    hostElementId: string,
    insertAtStart: boolean,
    newElementId?: string
  ) {
    this.templateElement = document.getElementById(
      templateId
    )! as HTMLTemplateElement;
    this.hostElement = document.getElementById(hostElementId)! as T;

    const importedNode = document.importNode(
      this.templateElement.content,
      true
    );
    this.element = importedNode.firstElementChild as U;
    if (newElementId) {
      this.element.id = newElementId;
    }

    this.attach(insertAtStart);

    // Q. WHY not call configure() & renderContent() in the abstract class constructor??

    // if we call this in Component class, we might call a method in the inheriting class (class that extends the abstract class), where renderContent() or configure() relies on something where teh constructor of the inheriting class actually sets something up, only AFTER the base class constructor finished, which renderContent() & configure() rely on.

    // That's why it's safer to make sure that the inheriting class has to call these methods instead of the base class callling these methods for us
  }

  private attach(insertAtBeginning: boolean) {
    this.hostElement.insertAdjacentElement(
      insertAtBeginning ? 'afterbegin' : 'beforeend',
      this.element
    );
  }

  // add 2 more abstract methods -> force any class inheriting from this component, to add these two methods and to have them available
  // that way if someone else looks at our code they will get a good understanding of what the idea behind the Component clas is: it does all the general rendering or attachment of the component, but that the concrete content & configuration needs to happen in the place where we inherit (note: can't have private abstract methods; one or the other)
  abstract configure(): void;
  // abstract configure?(): void; -> make it optional if don't want to be forced to add it to ProjectList class
  abstract renderContent(): void;
}

// ProjectList Class
// extend Component on ProjectList & remove the 3 properties (templateElement, hostElement & element)
// we've restructured the ProjectList class to take advantage of inheritance and of our shared logic
class ProjectList extends Component<HTMLDivElement, HTMLElement> {
  // keep assignedProjects b/c specific to the ProjectList
  assignedProjects: Project[];

  // constructor method to create 2 lists
  constructor(private type: 'active' | 'finished') {
    // need to call super() at the beginning to call the constructor of the base class; need to pass some information to the super() constructor: the ID of our templateElement, hostElementId, whether we want to insert this at the start of the hostElement, and, potentially, the ID that should be assigned to the new element
    // third parameter is insertAtStart boolean (t or f) -> tells it where it needs to be inserted
      // in this case it is FALSE b/c we don't want it inserted at the start, but at the end
    // fourth parameter is Id for new element -> don't need 'this' in '${this.projectType}' -> just ${projectType} b/c we can't use 'this' before super finished running
      // not a problem because we received type as an argument (type: active | finished)
    super('project-list', 'app', false, `${type}-projects`);

    // need to reference 'assignedProjects' inside constructor
    this.assignedProjects = [];

    // call methods to attach section to DOM and render content (ie, h2, ul)
    // this.attach();
    // don't need to call attach() b/c that will happen in the base Component class

    // make sure to call configure()
    this.configure();
    this.renderContent();
  }

  // Move public renderContent & configure above private renderProjects method

  // error b/c we don't have that configure method which was promised in base class
  configure() {
    // before we attach and render content, reach out to global constant 'projectState' and call addListener
    // projects type = Project[] (our custom type class)
    projectState.addListener((projects: Project[]) => {
      // filter projects based on status before we store the projects and render them
      const relevantProjects = projects.filter(prj => {
        // store projects with status 'active' in relevantProjects
        if (this.type === 'active') {
          return prj.status === ProjectStatus.Active;
        }
        return prj.status === ProjectStatus.Finished;
      });
      this.assignedProjects = relevantProjects;
      this.renderProjects();
    });
  }

  // method to render content (h2, ul) and is called before renderProjects
  // get error for private renderContent(); so remove private b/c 'private abstract' not supported
  renderContent() {
    // add id to project list
    const listId = `${this.type}-projects-list`;
    // access <ul> & add listId
    this.element.querySelector('ul')!.id = listId;
    // access <h2> & insert content
    this.element.querySelector('h2')!.textContent =
      this.type.toUpperCase() + ' PROJECTS';
  }

  // method to render projects
  private renderProjects() {
    // access list from renderContent
    const listEl = document.getElementById(
      `${this.type}-projects-list`
    )! as HTMLUListElement;
    // clear list content to avoid  unnecessary rerendering
    listEl.innerHTML = '';
     // loop through all the project items of assignedProjects
    for (const prjItem of this.assignedProjects) {
      // every li (project item) is a project, which is an object
      // create li element
      const listItem = document.createElement('li');
      // add title to li
      listItem.textContent = prjItem.title;
      // append li to ul
      listEl.appendChild(listItem);
    }
  }

  // method to attach section to page
    // this clashes with the attached method we have in base component class, so we get rid of it
    // private attach() {
    //     this.hostElement.insertAdjacentElement('beforeend', this.element);
    // }
}

// ProjectInput Class
// we restructured ProjectInput to take advantage of inheritance & let base class do a lot of the work - it extends base class COMPONENT
class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;

  // function to create object
  constructor() {
    // pass id of template, id of host element, insertBefore = true, and newElementId to super()
    super('project-input', 'app', true, 'user-input');

    // access to inputs & store them as properties to the the class
    this.titleInputElement = this.element.querySelector(
      '#title'
    ) as HTMLInputElement;
    this.descriptionInputElement = this.element.querySelector(
      '#description'
    ) as HTMLInputElement;
    this.peopleInputElement = this.element.querySelector(
      '#people'
    ) as HTMLInputElement;

    // call class methods inside constructor function
    this.configure();
  }

  // method for event listener
  // make configure public & it is convention to have public methods before private methods
  configure() {
    this.element.addEventListener('submit', this.submitHandler);
  }

  // TS complains it needs renderContent(), so we add it b/c we need to even though it's not doing anything in it but it satisfies our base class
  renderContent() {}

  // method to get all user's inputs
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
}

const prjInput = new ProjectInput();
const activePrjList = new ProjectList('active');
const finishedPrjList = new ProjectList('finished');
