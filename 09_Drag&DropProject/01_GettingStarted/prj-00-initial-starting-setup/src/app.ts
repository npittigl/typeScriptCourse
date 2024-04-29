// custom type for project status
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

// custom type for listener
type Listener = (items: Project[]) => void;

// Project State Management class   
class ProjectState {
    // property to hold array of listeners (fns); of type Listener
    private listeners: Listener[] = [];
    
    // property to hold an array of projects; type Project(the custom type we created)
    private projects: Project[] = [];

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

    // function to add listener fns to listeners array
    // listenerFn becomes type 'Listener' instead of type 'Function'
    addListener(listenerFn: Listener) {
        this.listeners.push(listenerFn);
    }

    // define how project should look like
    addProject(title: string, description: string, numOfpeople: number) {
        // can instatiate Project class to create a new project with parameters as properties (id, title, desc, people, status)
        const newProject = new Project (
            Math.random().toString(),
            title,
            description,
            numOfpeople,
            // every new project will be active by default (use enum)
            ProjectStatus.Active
        );
    
        // create a new project with object literal notation for now
        // const newProject = {
        //     id: Math.random().toString(),
        //     title: title,
        //     description: description,
        //     people: numOfpeople
        // };

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

// function to check if input is valid
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

    // constructor
    // need to know ID of our template so we know how to select it, need to know hostElement ID so we know where to render this component, and need to get a newElementId, so that we get an ID that has to be assigned to the newly rendered element => optional, which we indicate by putting '?' after parameter or you can add 'undefined' as a type (newElementId: string | undefined)
    constructor(
        templateId: string, 
        hostElementId: string, 
        insertAtStart: boolean,
        newElementId?: string
    ) {
        this.templateElement = document.getElementById(templateId)! as HTMLTemplateElement;
        this.hostElement = document.getElementById(hostElementId)! as T;

        const importedNode = document.importNode(
            this.templateElement.content, 
            true
        );
        this.element = importedNode.firstElementChild as U;

        // b/c optional, use if statement to check if needed, if so then assign new element id
        if(newElementId) {
            this.element.id = newElementId;
        }

        this.attach(insertAtStart);

        // Q. WHY not calling configure() & renderContent() in the abstract class constructor??
    }

    private attach(insertAtBeginning: boolean) {
        this.hostElement.insertAdjacentElement(insertAtBeginning ? 'afterbegin' : 'beforeend', this.element);
    }

    // add 2 more abstract methods -> force any class inheriting from this component, to add these two methods and to have them available
    // that way if someone else looks at our code they will get a good understanding of what the idea behind the Component clas is: it does all the general rendering or attachment of the component, but that the concrete content & configuration needs to happen in the place where we inherit (note: can't have private abstract methods; one or the other)
    abstract configure(): void;
    // abstract configure?(): void; -> make it optional if don't want to be forced to add it to ProjectList class
    abstract renderContent(): void;
}

// ProjectList class
// extend Component on ProjectList & remove the 3 properties (templateElement, hostElement & element)
class ProjectList extends Component <HTMLDivElement, HTMLElement> {
    // keep assignedProjects b/c specific to the ProjectList
    assignedProjects: Project[];

    // constructor method to create 2 lists
    constructor(private projectType: 'active' | 'finished') {
        // need to call super() at the beginning to call the constructor of the base class; need to pass some information to the super() constructor: the ID of our templateElement, hostElementId, whether we want to insert this at the start of the hostElement, and, potentially, the ID that should be assigned to the new element
        // third parameter is insertAtStart boolean (t or f) -> tells it where it needs to be inserted
            // in this case it is FALSE b/c we don't want it inserted at the start, but at the end
        // fourth parameter is Id for new element -> don't need 'this' in '${this.projectType}' -> just ${projectType} b/c we can't use 'this' before super finished running
            // not a problem because we received type as an argument (type: active | finished)
        super('project-list', 'app', false, `${projectType}-projects`);
    
        // need to reference 'assignedProjects' inside constructor
        this.assignedProjects = [];

        // call methods to attach section to DOM and render content (ie, h2, ul)
        // this.attach();
        // don't need to call attach() b/c that will happen in the base Component class

        // make sure to call configure()
        this.configure();
        this.renderContent();
    }

    // method to render projects
    private renderProjects() {
        // access list from renderContent
        const listEl = document.getElementById(`${this.projectType}-projects-list`)! as HTMLUListElement;

        // clear list content to avoid  unnecessary rerendering
        listEl.innerHTML ='';

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

    // error b/c we don't have that configure method which was promised in base class
    configure() {
        // before we attach and render content, reach out to global constant 'projectState' and call addListener
        // projects type = Project[] (our custom type class)
        projectState.addListener((projects: Project[]) => {
            // filter projects based on status before we store the projects and render them
            const relevantProjects = projects.filter(prj => { 
                // store projects with status 'active' in relevantProjects
                if(this.projectType === 'active') {
                    return prj.status === ProjectStatus.Active;
                }
                return prj.status === ProjectStatus.Finished;
            });

            // overriding assignedProjects with new ACTIVE projects filtered from above addListener function; now can access list of projects & render them to ACTIVE list in DOM
            this.assignedProjects = relevantProjects;
            // call renderProjects from inside here
            this.renderProjects();
        });
    };

    // method to render content (h2, ul) and is called before renderProjects
    // get error for private renderContent(); so remove private b/c 'private abstract' not supported
    renderContent() {
        // add id to project list
        const listId = `${this.projectType}-projects-list`;
        // access <ul> & add listId
        this.element.querySelector('ul')!.id = listId;
        // access <h2> & insert content
        this.element.querySelector('h2')!.textContent = this.projectType.toUpperCase() + ' PROJECTS';
    }

    // method to attach section to page
    // this clashes with the attached method we have in base component class, so we get rid of it
    // private attach() {
    //     this.hostElement.insertAdjacentElement('beforeend', this.element);
    // }
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