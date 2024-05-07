// Drag & Drop Interfaces
interface Draggable {
  dragStartHandler(event: DragEvent): void;
  dragEndHandler(event: DragEvent): void;
}

interface DragTarget {
  dragOverHandler(event: DragEvent): void;
  dropHandler(event: DragEvent): void;
  dragLeaveHandler(event: DragEvent): void;
}

// Project Type
enum ProjectStatus {
  Active,
  Finished
}

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
type Listener<T> = (items: T[]) => void;

class State<T> {
  protected listeners: Listener<T>[] = [];

  addListener(listenerFn: Listener<T>) {
    this.listeners.push(listenerFn);
  }
}

class ProjectState extends State<Project> {
  private projects: Project[] = [];
  private static instance: ProjectState;

  private constructor() {
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
    // call updateListeners method
    this.updateListeners();
    // for (const listenerFn of this.listeners) {
      //.slice() to make copy of projects
      //listenerFn(this.projects.slice());
    // }
  }

  // need a move project method
  // switch project status -> need to know:
    // 1. which project to move
    // 2. which box teh new box is (ie which status the new status is)
  moveProject(projectId: string, newStatus: ProjectStatus) {
    // need to find a project with taht id in our array of projects defined in this class => private projects: Project[] = []; 
    // and then flip the status
    // find() => runs on every element in this array and gives us acces to every element, and returns true if finds element we are looking for
    // might be null, so here we'll call this 'const project'
    const project = this.projects.find(prj => prj.id === projectId);

    // if true, that is, if the id of element we're currently looking at is equal to the projecId i'm getting as an argument, then we change status to the new status
    // if you inspect the DOM it technically rerenders which might not be ideal, so we could think about coming up with some solution which checks whether the status actually did change, and if it didn't, we don't update
    if (project && project.status !== newStatus) {
      // change status to the new status
      project.status = newStatus;
      // call updateListeners method
      this.updateListeners();
    }
  }

  // now we need to let all our listeners know that something changed about our project and that they should re-render
  // so we have to go through all the listeners again & since we don't want to repeat code here, we will outsource this in a new private method => updateListeners
  private updateListeners() {
    // for loop to go thru all listeners
    // then call this updateListeners both from the addProject & moveProject method

    // whenever state changes (ex add new project), we loop through all listeners and execute as function
    // get error: listeners is private & only accessible within class State<T>
    for (const listenerFn of this.listeners) {
      // .slice() to make copy of projects
      listenerFn(this.projects.slice());
    }
  }
  // now all listeners will be triggered which leads to the list to rerender its items
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
abstract class Component<T extends HTMLElement, U extends HTMLElement> {
  templateElement: HTMLTemplateElement;
  hostElement: T;
  element: U;

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
  }

  private attach(insertAtBeginning: boolean) {
    this.hostElement.insertAdjacentElement(
      insertAtBeginning ? 'afterbegin' : 'beforeend',
      this.element
    );
  }

  abstract configure(): void;
  abstract renderContent(): void;
}

// ProjectItem Class
class ProjectItem extends Component<HTMLUListElement, HTMLLIElement>
  implements Draggable {
  private project: Project;

  get persons() {
    if (this.project.people === 1) {
      return '1 person';
    } else {
      return `${this.project.people} persons`;
    }
  }

  constructor(hostId: string, project: Project) {
    super('single-project', hostId, false, project.id);
    this.project = project;

    this.configure();
    this.renderContent();
  }

  // dataTransfer property is special for drag events => you can attach data to the drag event and you'll later be able to extract that data upon a drop & the browser in JS behind the scenes will store that data during the drag operation & ensure that the data you get when the drop happens is the same data you attach here
  @autobind
  dragStartHandler(event: DragEvent) {
    // STEP 1: Attaching data to the drag event
    // you call setData method on dataTransfer property => takes 2 arguments: 
      // 1. Identifier of the format of the data - which will be plain text data. 
      // 2. Item id - Not going to attach our objects here, ie the project itself, suffice to attach the ID of the project b/c this will later allow us to fetch that project from our state
    // add ! b/c dataTranser could be null so we add the ! b/c we know that it won't be null
    event.dataTransfer!.setData('text/plain', this.project.id);

    // STEP 2: Setting effectAllowed property to 'move' => this controls how the cursor will look & tells browser about our intention, that we plan to move an element from A to B => we want to move (drag) an element, we remove it from its original place and add it to a new place upon a drop
    event.dataTransfer!.effectAllowed = 'move';
  }

  dragEndHandler(_: DragEvent) {
    console.log('DragEnd');
  }

  configure() {
    this.element.addEventListener('dragstart', this.dragStartHandler);
    this.element.addEventListener('dragend', this.dragEndHandler);
  }

  renderContent() {
    this.element.querySelector('h2')!.textContent = this.project.title;
    this.element.querySelector('h3')!.textContent = this.persons + ' assigned';
    this.element.querySelector('p')!.textContent = this.project.description;
  }
}

// ProjectList Class
class ProjectList extends Component<HTMLDivElement, HTMLElement>
  implements DragTarget {
  assignedProjects: Project[];

  constructor(private type: 'active' | 'finished') {
    super('project-list', 'app', false, `${type}-projects`);
    this.assignedProjects = [];

    this.configure();
    this.renderContent();
  }

  @autobind
  dragOverHandler(event: DragEvent) {
     // STEP 3: in this project we only have 1 drap & drop operation but in bigger apps you  might have different pieces on the page that can be dragged and dropped => so need to check if a drag is allowed here in the dragOverHandler, which fires when you enter a draggable area with an item attached to the mouse
      // 1. check if event.dataTransfer is available AND
      // 2. check if event.dataTransfer.types property has a first value which is equal to text/plain
        // => this simply means 'is the data attached to our drag event of this format?'. Which it is b/c that is how we set it up in our dragStartHandler. We're just allowing dropping of plain text instead of say images
          // if true -> allow drop & update the background
    if (event.dataTransfer && event.dataTransfer.types[0] === 'text/plain') {
      // call e.preventDefaulat b/c in JS a drag'n'drop works such that a drop is only allowed (i.e. drop event will only trigger on an element) if in the dragOverHandler on that same element you called preventDefault => the default for JS dran'n'drop events is to NOT allow dropping, so you have to preventDefault in the dragOverHandler to tell JS & browser that for this element, in this case for this section for this projectList class you wanna allow a drop
      // so only if you add this in dragOverHandler the drop event will actually trigger when the user lets go; otherwise if the user lets go, the drop event will not fire
      event.preventDefault();
      const listEl = this.element.querySelector('ul')!;
      listEl.classList.add('droppable');
    }
  }

  // add autobind so 'this' keyword refers to surrounding class
  // in this class we have type property: active or finished
  @autobind
  dropHandler(event: DragEvent) {
    // store id in variable
    // dataTransfer.getData => to get the data with this 'text/plain' format, which should be the project ID we attached to our dataTransfer package on the project item
    const prjId = event.dataTransfer!.getData('text/plain');
    // call moveProject method on projectState (instance we created of ProjectState => a global constant)
      // 1. pass project id
      // 2. pass new project status => we have to translate active or finished to our enum values
    // check if status is equal to 'active', in which case, we pass in ProjectStatus.Active, as the new status b/c that is the status of the list we moved project to, otherwise we pass in ProjectStatus.Finished
    projectState.moveProject(
      prjId,
      this.type === 'active' ? ProjectStatus.Active : ProjectStatus.Finished
    );
  }

  @autobind
  dragLeaveHandler(_: DragEvent) {
    const listEl = this.element.querySelector('ul')!;
    listEl.classList.remove('droppable');
  }

  configure() {
    this.element.addEventListener('dragover', this.dragOverHandler);
    this.element.addEventListener('dragleave', this.dragLeaveHandler);
    this.element.addEventListener('drop', this.dropHandler);

    projectState.addListener((projects: Project[]) => {
      const relevantProjects = projects.filter(prj => {
        if (this.type === 'active') {
          return prj.status === ProjectStatus.Active;
        }
        return prj.status === ProjectStatus.Finished;
      });
      this.assignedProjects = relevantProjects;
      this.renderProjects();
    });
  }

  renderContent() {
    const listId = `${this.type}-projects-list`;
    this.element.querySelector('ul')!.id = listId;
    this.element.querySelector('h2')!.textContent =
      this.type.toUpperCase() + ' PROJECTS';
  }

  private renderProjects() {
    const listEl = document.getElementById(
      `${this.type}-projects-list`
    )! as HTMLUListElement;
    listEl.innerHTML = '';
    for (const prjItem of this.assignedProjects) {
      new ProjectItem(this.element.querySelector('ul')!.id, prjItem);
    }
  }
}

// ProjectInput Class
class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;

  constructor() {
    super('project-input', 'app', true, 'user-input');
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
  }

  configure() {
    this.element.addEventListener('submit', this.submitHandler);
  }

  renderContent() {}

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
