// NOTE: go to tscongig file and uncomment "exprimentalDecorators": true to enable use of decorators => make sure comma before that line and no comma after

// get error b/c did not use 'target' & methodName arguments; to circumvent this can add '_' before to let TS know that you are aware that you have not used these values but they need to be accepted anyway

// autobind decorator
function autobind(
  _: any,
  _2: string,
  descriptor: PropertyDescriptor
) {
  // want access to the orginal method; store method that we originally defined (submitHandler in this case)
  const originalMethod = descriptor.value;

  console.log(originalMethod); 
  // function submitHandler(event) 
    // length: 1
    // name: "submitHandler"

  // create adjusted descriptor, which is an object & of type 'PropertyDescriptor'
  const adjDescriptor: PropertyDescriptor = {
    configurable: true, //so can change it
    // getter method => executed when you try to access the function
    get() {
      // set up the bound function by using the original method above
      const boundFn = originalMethod.bind(this);
      // return boundFn
      return boundFn;
    }
  };
   // overall return the adjusted descriptor inside the method decorator
  return adjDescriptor;
}

// ProjectInput Class
class ProjectInput {
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  element: HTMLFormElement;
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
    this.element.id = 'user-input';

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
    this.attach();
  }

  // add autobind decorator to submitHandler
  @autobind
  private submitHandler(event: Event) {
    event.preventDefault();
    console.log(this.titleInputElement.value);
  }

  private configure() {
    this.element.addEventListener('submit', this.submitHandler);
  }

  private attach() {
    this.hostElement.insertAdjacentElement('afterbegin', this.element);
  }
}

const prjInput = new ProjectInput();
