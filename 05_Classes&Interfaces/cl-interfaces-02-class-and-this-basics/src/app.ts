class Department {
  name: string;

  constructor(n: string) {
    this.name = n;
  }

  describe(this: Department) {
    console.log('Department: ' + this.name);
  }
}

const accounting = new Department('Accounting');

accounting.describe();

const accountingCopy = { name: 'DUMMY', describe: accounting.describe };

accountingCopy.describe();

// can add methods to your classes:
// describe() {}
  // name of method
  // no colon, no equal sign
  // just parentheses & curly braces
  // () -> can take arguments
  // {} -> define logic of your method

// in this example we might want to output the name of the department

  // describe() {
  //   console.log('Department: ' + .name);
  // }

    // this logic would NOT work because it would look for a variable 'name', which has to exist inside of this describe method OR be a global variable defined outside of the class

// To refer to a CLASS PROPERTY or CLASS METHOD that lives inside of a class, we have to use the 'this' keyword

// 'this' refers back to the concrete instance of this class that was created

  // this.name -> with dot notation, can access all the properties and methods off this instance

// so if we call accounting.describe outside the class, the 'this' keyword will refer to the concrete accounting object that was BUILT based on this class

  // in console: 'Department: Accounting'

// 'this' keyword can be tricky!

// ex. if we added another object, 'accountingCopy', which just has the describe method and points at accounting.describe

  // const accountingCopy = { name: 'DUMMY', describe: accounting.describe };

// then if i call accountingCopy.describe as a method, what do you think will happen?

  // accountingCopy.describe();

// we don't get a compilation error, but at runtime we see 'Department: undefined'

// The reason it is undefined is b/c:

  // 1. we just added a 'describe' property to this object we created using object literal => that is, it's not based on the defined department class, it's just a dummy object

  // 2. the value for this 'describe' property is a pointer at the 'describe' method in my accounting object. It's pointing at the method, but not executing it b/c not passing the value of this function execution to 'describe'. What is really being passed is the function itself to the property 'describe'

  // 3. so when we call 'describe' method on the copy, it does indeed EXECUTE the method (therefore no error appears)

    // accountingCopy.describe();

// 4. the problem is WHEN this method executes, 'this' will not refer to this object this method was part of originally -> ie, not to the accounting object

// 5. instead: 'this' typically refers to the thing which is responsible for calling a method 

  // in this example, the thing that is responsible for calling the 'describe' method is accountingCopy (since we call 'describe' on accountingCopy -> accountingCopy.describe())

    // so 'this' will refer to the thing in front of the dot, which is accountingCopy

// 6. However, that is an object which has no 'name' property

  // so when we access 'this.name', we get undefined b/c 'this' does not refer to an object with a 'name' property => so 'name' yields as 'undefined'

// To work around the 'this' problem:

  // 1. You can add a special parameter called 'this' => special instruction understood by TypeScript

    // it is interpreted by TS as a hint regarding what 'this' should be referred to

  // 2. assign type to 'this' parameter

    // type here is our class type: so, department

    // describe(this: Department) {
      // console.log('Department: ' + this.name);
    // }

// so now, what this means is:

  // when 'describe' method is executed, 'this' inside of describe, should always refer to an instance that's based on the department class -> so an object which would be of type 'department'

  // we still get an error b/c we call describe here on accountingCopy, we're NOT calling it on an instance of 'department'

  // 'this' in this case, will not refer to an object of type department

  // so we have to add some extra type safety, by adding a DUMMY parameter

  // in this case we add a 'name' property on dummy object

    // const accountingCopy = { name: 'DUMMY', describe: accounting.describe };

// by adding that 'name' property , TS sees 'ok', the object on which you're calling describe, now has a 'name' property just like 'this' expects it to have bc this is based on the department object, which also has a name property