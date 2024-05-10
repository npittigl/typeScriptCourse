import { ProjectInput } from './components/project-input.js';
import { ProjectList } from './components/project-list.js';

// instatiate classes
new ProjectInput();
new ProjectList('active');
new ProjectList('finished');

// NOTES ON MODULES:

// using modules is super useful b/c it allows you to write more maintainable & manageable code

// having it in one file can get messy for bigger projects

// Namespaces vs. ES modules: ES modules is highly recommended b/c you get that extra type safety & you ensure that every file has to clearly specify what it wants

// Downside to namespace is that b/c it is enough for one file to import something that another file also needs, if that one file that imports the thing is removed, that other file also breaks

// can use namespaces for smaller projects

// Namespace & ES both work in modern browsers only

    // it would not be supported in Internet Explorer 9

    // so to make it work in ALL browsers can use a bundling tool like Webpack for example to bundle that together into one JS file

    // during development we have this multi-file but when we ship our code we actually have one file only -> making sure that the browser doesn't have to download that many files