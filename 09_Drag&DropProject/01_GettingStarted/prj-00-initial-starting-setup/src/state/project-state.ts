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
    export class ProjectState extends State<Project>{ 
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
    export const projectState = ProjectState.getInstance();
}