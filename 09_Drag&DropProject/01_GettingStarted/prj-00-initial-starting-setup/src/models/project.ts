namespace App {
    // custom type for project status
    export enum ProjectStatus { 
        Active, 
        Finished 
    }

    // class project to define project obj structure
    export class Project {
        constructor(
            public id: string, 
            public title: string, 
            public description: string, 
            public people: number,
            public status: ProjectStatus
        ) {}
    }
}