// Drag & Drop Interfaces

export interface Draggable {
    // listens for start of drag event; will execute drag event & wont' return anything
    dragStartHandler(event: DragEvent): void;

    // listens for & executes end of the drag event & doesn't return anything
    dragEndHandler(event: DragEvent): void;
}

// ProjectList class (the boxes of 'active' and 'finished' projects), is the drag targets
export interface DragTarget {
    // 3 event handlers w/ event object of type DragEvent; don't return anything:

    // permits the drop
    dragOverHandler(event: DragEvent): void;
    // handles actual drop & update data & UI
    dropHandler(event: DragEvent): void;
    // give user some visual feedback to indicate that the drop occurred
    dragLeaveHandler(event: DragEvent): void;
}


// add keyword 'namespace' at the top w/ curly brackets and give a name to the namespace
// this is a TS feature
// TS compiles it to an object
// to make interfaces available outside of namespace, must add 'export' keyword in front of each interface