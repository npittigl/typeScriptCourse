// start with making form visible
// our goal with this class is to get access to <template> (from index.html file) & access the form element inside and access to the <div id="app"></div>, where input is appended, then render our template in that div

// ProjectInput Class
class ProjectInput {
  // define element types (template, div, form)
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  element: HTMLFormElement;

  // constructor function to create object
  constructor() {
    // to get ACCESS to the template & to place where it should be rendered
    // add properties:
    this.templateElement = document.getElementById(
      'project-input'
    )! as HTMLTemplateElement;
    this.hostElement = document.getElementById('app')! as HTMLDivElement;

    // b/c TS is not going to analyze our html file, and maybe no element with that ID exists & might yield null, we add a ! so TS knows that templateElement is NOT null
    // TS still doesn't know WHICH element it will return (ex. div, p, button), we can use TYPE CASTING to tell ts which type element will be

    // to RENDER on page: need to import the content of template element & render to DOM
    // doing this inside the contructor that way when we create a NEW INSTANCE of this class, we immediately render a form that belongs to this instance
    // to get to content inside of template element, use "importNode" method => takes two arguments: element whose content you want, and boolean (copy with a deep clone T or F?); we say TRUE, we do want a deep clone of the content

    const importedNode = document.importNode(
      this.templateElement.content, true);

    // we need to get access to the concrete HTML element (ie the form), which we can store in another property element; first define type at top of class (HTMLFormElement), and it is equal to importedNode.firstElementChild, and tell TS again that this will be a HTML form element (type casting)
    // this.element is now the CONCRETE property that points at the node we wanna insert => so insert 'this.element' into insertAdjacentElement indside private method below 
    this.element = importedNode.firstElementChild as HTMLFormElement;

    // call the attach method in the constructor to make sure this code also executes
    this.attach();
  }

  private attach() {
    this.hostElement.insertAdjacentElement('afterbegin', this.element);
  }
}

const prjInput = new ProjectInput();
