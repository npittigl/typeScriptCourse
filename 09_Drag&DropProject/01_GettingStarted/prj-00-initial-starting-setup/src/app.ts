/// <reference path="drag-drop-interfaces.ts" />
/// <reference path="project-model.ts" />

namespace App {
    

    // custom type for listener
    // change function type to GENERIC type "T", so we can set this from outside
    type Listener<T> = (items: T[]) => void;

    // base class for ProjectState
    // move array of listeners & addListener method to this base class
    // make State generic <T>
    // so when we extend State, we have to specify the type of data this state will work with
    // and instead of State, this then gets forwarded to our Listener custom type (above)
    class State<T> {
        // property to hold array of listeners (fns); of type Listener
        // add access modifier "protected", which is similar to private but also allows access from inheriting classes 
        // Protected = can't be accessed from outside the class, but can be accessed by any class that inherits it
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
    class ProjectState extends State<Project>{ 
        // property to hold an array of projects; type Project(the custom type we created)
        private projects: Project[] = [];

        // another private property called instance that is of type ProjectState
        private static instance: ProjectState;

        // use a private constructor to guarantee that this is a singleton class
        private constructor() {
            // b/c of inheritance we need to call super method inside ProjectState constructor
            super();
        }
        // static getInstance method => to check then return this.instance 
        static getInstance() {
            if(this.instance) {
                return this.instance
            }
            // i.e, this.instance will be equal to a new project state
            this.instance = new ProjectState();
            return this.instance;
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
            // call updateListeners method
            this.updateListeners();

            // for (const listenerFn of this.listeners) {
            //     // .slice() to make copy of projects
            //     listenerFn(this.projects.slice());
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
            if(project && project.status !== newStatus) {
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
    // using INHERITANCE & creating a GENERIC CLASS here, where when we inherit from it
    // and we can set the concrete types
    // 'abstract' means it can't be instantiated
    abstract class Component<T extends HTMLElement, U extends HTMLElement> {
        // we can say that T and U will be some kind of HTMLElement
            // hostElement is type T
            // element is type U
            // And now, whenever we inherit from this class, we can specify the concrete types so that we can with different types in different places where we inherit
        templateElement: HTMLTemplateElement;
        hostElement: T;
        element: U;

        // constructor:
        // need to know ID of our template so we know how to select it
        // need to know hostElement ID so we know where to render this component, 
        // and need to get a newElementId, so that we get an ID that has to be assigned to the newly rendered element 
            // => optional, which we indicate by putting '?' after parameter 
            // or you can add 'undefined' as a type (newElementId: string | undefined)
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
        }

        private attach(insertAtBeginning: boolean) {
            this.hostElement.insertAdjacentElement(insertAtBeginning ? 'afterbegin' : 'beforeend', this.element);
        }

        // force any class inheriting from this component to add these two methods and to have them available
        // that way if someone else looks at our code they will get a good understanding of what the idea behind the Component clas is: it does all the general rendering or attachment of the component, but that the concrete content & configuration needs to happen in the place where we inherit (note: can't have private abstract methods; one or the other)
        abstract configure(): void;
        // abstract configure?(): void; -> make it optional if don't want to be forced to add it to ProjectList class
        abstract renderContent(): void;
    }

    // ProjectItem Class - responsible for rendering a single project item
    // extends Component class b/c responsible for rendering things to DOM
    // pass: 1. hostElement <ul>; 2. element <li>
    // use draggable interface here
    class ProjectItem extends Component<HTMLUListElement, HTMLLIElement> implements Draggable {
        // would make sense to store the project that belongs to this rendered project item in this project item class
        // that is, the project based on our Project Class, which we created up there - this is the data we will basically work with 
        // make it private & of type Project (based on class we created)
        private project: Project;

        // getter function to retrieve proper term depending on no. of pple assigned to prj
        get persons() {
            if(this.project.people === 1) {
                return '1 person';
            } else {
                return `${this.project.people} persons`;
            }
        }

        // constructor needs to provide id of element when project item rendered b/c id is not fixed (since we have 2 lists where item could be rendered to)
        constructor(hostId: string, project: Project) {
            // first thing to forward to super() is the template id for a single list item (taken from HTML doc)
            // tempmlate id: 'single-project'
            // hostId - <ul>; forwarded from constructor
            // where to attach new li item - beginning or end of template? T or F
                // false = at the end
            // new element id => <li> item; forwarded from constructor
            super('single-project', hostId, false, project.id);

            this.project = project;

            this.configure();
            this.renderContent();
        }

        // must add the 2 methods from the Draggable interface
        @autobind
        dragStartHandler(event: DragEvent): void {
            // STEP 1: Attaching data to the drag event
            // use dataTransfer property which is special for drag events
            // call setData method on dataTransfer
                // setData() takes 2 arguments:
                    // 1. identifier of the data format ('text/plain')
                    // 2. item id - attach ID of the project
            event.dataTransfer!.setData('text/plain', this.project.id);

            // STEP 2: Setting effectAllowed property to 'move' => this controls how the cursor will look & tells browser about our intention, that we plan to move an element from A to B
            event.dataTransfer!.effectAllowed = 'move';
        }

        @autobind
        dragEndHandler(_: DragEvent): void {
            console.log('DragEnd');
        }

        // Draggable methods above cannot listen to drag start event; can put that logic here in configure method
        configure() {
            // access rendered element & add event listeners for dragstart and dragend
            // want to make sure that inside of the drag handlers, that 'this' keyword refers to our class, as we know with event listeners that is not the case by default => can use .bind but we will use our autobind decorator - place it above both drag handler methods
            this.element.addEventListener('dragstart', this.dragStartHandler);
            this.element.addEventListener('dragend', this.dragEndHandler);

            // ** in HTML must add the draggable attribute & set to true on list item
            // <li draggable="true"> => this tells the browser that this will be draggable
        }

        renderContent() {
            this.element.querySelector('h2')!.textContent = this.project.title;

            // use getter here to retrieve proper wording based on no. of pple assigned to project
            this.element.querySelector('h3')!.textContent = this.persons + ' assigned';

            this.element.querySelector('p')!.textContent = this.project.description;
        }
    }

    // ProjectList class
    // extend Component on ProjectList & remove the 3 properties (templateElement, hostElement & element)
    // we've restructured the ProjectList class to take advantage of inheritance and of our shared logic
    // implement DragTarget interface here, since this is where we want to drop the items
    class ProjectList extends Component <HTMLDivElement, HTMLElement> implements DragTarget {
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

            // make sure to call configure()
            this.configure();
            this.renderContent();
        }

        // must add the methods from Draggable interface: dragOver, dragLeave, drop handlers
        @autobind
        dragOverHandler(event: DragEvent) {
            // 1. check if event.dataTransfer is available AND
            // 2. check if event.dataTransfer.types property has a first value which is equal to text/plain
                // => this simply means 'is the data attached to our drag event of this format?'
                // if true -> allow drop & update the background
            if(event.dataTransfer && event.dataTransfer.types[0] === 'text/plain') {
                // call e.preventDefaulat b/c the default for JS drag'n'drop events is to NOT allow dropping, so you have to preventDefault in the dragOverHandler to tell JS & browser that for this element, in this case for this section for this projectList class you wanna allow a drop
                event.preventDefault();
                // access the ul element
                const listEl = this.element.querySelector('ul')!;
                // add css styling so background changes colour to pink (active) or blue (finished) when user drags item
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
                this.projectType === 'active' ?  ProjectStatus.Active : ProjectStatus.Finished
            );
        }

        @autobind
        dragLeaveHandler(_event: DragEvent) {
            // access the ul element
            const listEl = this.element.querySelector('ul')!;
            // remove css styling so background changes back to white when user no longer hovers item (drags) over ul
            listEl.classList.remove('droppable');
        }

        // Move public renderContent & configure above private renderProjects method

        // error b/c we don't have that configure method which was promised in base class
        configure() {
            // inside configure method, make sure even listeners are fired when event takes place

            // dragover event
            this.element.addEventListener('dragover', this.dragOverHandler);
            // dragleave event
            this.element.addEventListener('dragleave', this.dragLeaveHandler);
            // drop event
            this.element.addEventListener('drop', this.dropHandler);

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

        // method to render projects
        private renderProjects() {
            // access list from renderContent
            const listEl = document.getElementById(`${this.projectType}-projects-list`)! as HTMLUListElement;

            // clear list content to avoid  unnecessary rerendering
            listEl.innerHTML ='';

            // loop through all the project items of assignedProjects
            for(const prjItem of this.assignedProjects) {
                // no longer add info manually, instead call new ProjectItem()
                    // 1. pass hostId (this.element.id of <ul>); add ! to skip null check
                    // 2. project (prjITem)
                new ProjectItem(this.element.querySelector('ul')!.id, prjItem);
            }
        }
    }

    // ProjectInput Class
    // we restructured ProjectInput to take advantage of inheritance & let base class do a lot of the work
    // extends Component class
    class ProjectInput extends Component< HTMLDivElement, HTMLFormElement> {
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

    // instatiate classes
    new ProjectInput();
    new ProjectList('active');
    new ProjectList('finished');
}
