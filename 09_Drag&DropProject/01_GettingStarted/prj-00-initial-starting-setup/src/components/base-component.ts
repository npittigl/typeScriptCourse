// DEFAULT EXPORT: can use default exports if you have a file which only exports one thing
    // this tells JS that this is the main piece of code being exported, so if you wanted to add something else, you can still have other named exports here
    // ex. export const something = "..."
    // you can mix named and default exports in the same file 
    // BUT can only have ONE default export per file
    // you don't import it by name

// Base class to house all element types
// using INHERITANCE & creating a GENERIC CLASS here, where when we inherit from it
// and we can set the concrete types
// 'abstract' means it can't be instantiated
export default abstract class Component<T extends HTMLElement, U extends HTMLElement> {
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
