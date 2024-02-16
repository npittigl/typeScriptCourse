class Department {
  public name: string;
  private employees: string[] = [];

  constructor(n: string) {
    this.name = n;
  }

  describe(this: Department) {
    console.log('Department: ' + this.name);
  }

  addEmployee(employee: string) {
    // validation etc
    this.employees.push(employee);
  }

  printEmployeeInformation() {
    console.log(this.employees.length);
    console.log(this.employees);
  }
}

const accounting = new Department('Accounting');

accounting.addEmployee('Max');
accounting.addEmployee('Manu');

// accounting.employees[2] = 'Anna';

accounting.describe();
accounting.name = 'NEW NAME';
accounting.printEmployeeInformation();

// const accountingCopy = { name: 'DUMMY', describe: accounting.describe };

// accountingCopy.describe();

// PRIVATE & PUBLIC Interfaces: When building classes, they are usually more complex

// you can mark field properties and methods inside of a class as PRIVATE or PUBLIC

// "PRIVATE" => if turn field property 'employees' to private:

  // private employees: string[] = [];

  // this means that 'employees' is ONLY accessible from inside the class, ie, only from inside the created object

  // so any method inside of the department class is still able to work with 'employees' field property => therefore can't access 'employees' from outside the class 'department'

  // so now we force that when employees should be added to this department, people have to use the 'addEmployee' method

  // 'private' keyword is a MODIFIER

  // 'public' modifier => when used, this means that the field or method is accessible from outside the class
  
    // 'public' is the default, so don't have to write it out

// JS doesn't know 'private'/'public' except for very modern versions added recently

// TS uses this feature but it does not work during runtime, however

// but using this feature helps write cleaner code