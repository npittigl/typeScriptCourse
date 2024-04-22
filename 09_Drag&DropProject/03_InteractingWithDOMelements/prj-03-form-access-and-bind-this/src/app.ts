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
    // give 'element' id name 'user-input' to inherit CSS styling
    this.element.id = 'user-input';

    // get access to different inputs & store them as properties to the the class
    this.titleInputElement = this.element.querySelector('#title') as HTMLInputElement;
    this.descriptionInputElement = this.element.querySelector('#description') as HTMLInputElement;
    this.peopleInputElement = this.element.querySelector('#people') as HTMLInputElement;

    // make sure to call configure method before we attach form, that way form can be submitted
    this.configure();
    // call the attach method in the constructor to make sure this code also executes
    this.attach();
  }

  // another private method (private b/c we are never going to access this from outside the class) to handle form submission
  // want access to input values, validate them & do something with input values
  private submitHandler(event: Event) {
    event.preventDefault();
    console.log(this.titleInputElement.value); //error
    // get an error because 'this' keyword in the submitHandler method does NOT point at the class. WHY? b/c of how JS & TS works
    // so 'this.titleInputElement' will not point at the class when the method is triggered upon an event 
    // when pass 'this' in bind() inside configure method (this.submitHandler.bind(this)), the 'this' inside of submitHandler will refer to the same thing as 'this' inside of configure method
  }

  // create another private method to create an event listener
  private configure() {
    // remember that 'this.element' = form; so attaching event listener to form element 
    this.element.addEventListener('submit', this.submitHandler.bind(this));
    // here we bind the submitHandler method to the event listener, and when we bind something to an event, the method that will be executed will have 'this' bound to something else => in this case to the current target of the event
    // the solution is to call bind() here on submitHandler to preconfigure how this function is going to execute when it executes in the future
    // the first argument to bind is actually what the 'this' keyword will refer to inside of the to-be executed function (submitHandler)
    // .bind(this) => now refers to the class and to the class inside of the submitHandler
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
