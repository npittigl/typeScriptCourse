import { DragTarget } from '../models/drag-drop.js';
import { Project, ProjectStatus } from '../models/project.js';
import Cmp from './base-component.js';
import { autobind } from '../decorators/autobind.js';
import { projectState } from '../state/project-state.js';
import { ProjectItem } from './project-item.js';

// ProjectList class
// extend Component on ProjectList & remove the 3 properties (templateElement, hostElement & element)
// we've restructured the ProjectList class to take advantage of inheritance and of our shared logic
// implement DragTarget interface here, since this is where we want to drop the items
export class ProjectList extends Cmp <HTMLDivElement, HTMLElement> implements DragTarget {
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
