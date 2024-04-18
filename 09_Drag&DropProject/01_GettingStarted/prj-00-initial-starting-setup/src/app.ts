// start with making form visible
// our goal with this class is to get access to <template> (from index.html file) & access the form element inside and access to the <div id="app"></div>, where input is appended, then render our template in that div
class ProjectInput {
    // define element types (template, div, form)
    templateElement: HTMLTemplateElement;
    hostElement: HTMLDivElement;
    element: HTMLFormElement;

    // function to create object
    constructor() {
        // to get ACCESS to the template & to place where it should be rendered
        // add properties:
        this.templateElement = document.getElementById('project-input')! as HTMLTemplateElement;
        
        this.hostElement = document.getElementById('app')! as HTMLDivElement;

        // b/c TS is not going to analyze our html file, and maybe no element with that ID exists & might yield null, we add a ! so TS knows that templateElement is NOT null
        // TS still doesn't know WHICH element it will return (ex. div, p, button), we can use TYPE CASTING to tell ts which type element will be

        // to RENDER on page: need to import the content of template element & render to DOM
        // doing this inside the contructor that way when we create a NEW INSTANCE of this class, we immediately render a form that belongs to this instance
        // to get to content inside of template element, use "importNode" method => takes two arguments: element whose content you want, and boolean (copy with a deep clone T or F?); we say TRUE, we do want a deep clone of the content
        const importedNode = document.importNode(this.templateElement.content, true);

        // we need to get access to the concrete HTML element (ie the form), which we can store in another property element; first define type at top of class (HTMLFormElement), and it is equal to importedNode.firstElementChild, and tell TS again that this will be a HTML form element (type casting)
        // this.element is now the CONCRETE property that points at the node we wanna insert => so insert 'this.element' into insertAdjacentElement indside private method below 
        this.element = importedNode.firstElementChild as HTMLFormElement;

        // call the attach method in the constructor to make sure this code also executes
        this.attach();
    }

    // we want to use importedNode to render some content, so we will create a new method, a private method
    private attach() {
        // reach out to hostElement and call insertAdjacentElement (default method provided by JS), to insert the HTML element 
        // insertAdjacentElement takes 2 arguments: 
            // 1) description of where to insert it (ex. can insert after the beginning of the element you're targeting, so after the opening tag of host element, before the beginning or before the opening tag, before the end tag or after the end tag) 
            // 2) what you want to insert, in this case it's importedNode (which is a constant only available in the constructor, and it's a document fragment)
        this.hostElement.insertAdjacentElement('afterbegin', this.element);
    }
}

// instantiate a new form using the class we created (have to store it in a new constant)
// form is rendered on DOM, which is coming from the HTML file => rendered with the help of our object oriented typescript code
const prjInput = new ProjectInput();
