/// <reference path="base-component.ts" />
/// <reference path="../decorators/autobind.ts" />
/// <reference path="../models/project.ts" />
/// <reference path="../models/drag-drop.ts" />

namespace App {
    // ProjectItem Class - responsible for rendering a single project item
    // extends Component class b/c responsible for rendering things to DOM
    // pass: 1. hostElement <ul>; 2. element <li>
    // use draggable interface here
    export class ProjectItem extends Component<HTMLUListElement, HTMLLIElement> implements Draggable {
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

}