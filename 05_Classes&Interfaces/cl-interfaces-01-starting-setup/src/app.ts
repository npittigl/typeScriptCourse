// Code goes here!
class Department {
    name: string;

    constructor(n: string) {
        this.name = n;
    }
}

const accounting = new Department('Accounting');

console.log(accounting);

// defining a class
    // use the 'class' keyword 
    // name the class - upper case character
    // (ex. web tool to manage different departments in our company; object to handle data of diff. depts, and methods to render information on depts on screen etc.)

    // to simplify the creation of these different department objecs which will look the same in structure, is to create a 'department' CLASS

// classes are like syntactic sugar for constructor functions
    // 'name' property (no let or const)
    // add TS type -> name: string;
    // this is NOT an object, therefore not a key-value pair
    // name: string; -> key field
        // defines name of a property you will have in the object; this object will be created BASED on this class

        // you define the value TYPE that the key will hold in the end (ex. string)
        // you can add initial value here:
            // name: string = 'DEFAULT'; but don't need to do that

        // in the class you can add a METHOD (function inside of an object) called CONSTRUCTOR

            // constructor() {}

        // this method is tied to the class and tied to any object created based on the class, which is executed when the object is being created
        // does initialization work on the object you're building

        // constructor() -> can accept parameter/argument

        // constructor(n: string) {
        //     this.name = n;
        // }

            // parameter called 'n'
            // assigned a string type
            // want to store that arguement into the name field
            // can reach out to it using 'this', and store 'n' in it
            // this sets the value of the name field (the 'name' property) to the value you're getting on 'n'

        // HOW TO CREATE OBJECT?

        // outside of the class you:

            // type the 'new' keyword
            // name of class
            // ();
            // pass the string argument to this department call here

                // new Department('Accounting');

            // store new object in a constant

                // const accounting = new Department('Accounting');

                    // console.log(accounting);

                        // Object { name: "Accounting" }