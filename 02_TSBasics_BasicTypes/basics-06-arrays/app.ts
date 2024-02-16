// const person: {
//   name: string;
//   age: number;
// } = {
const person = {
  name: 'Maximilian',
  age: 30,
  hobbies: ['Sports', 'Cooking']
};

let favoriteActivities: string[];
favoriteActivities = ['Sports'];

console.log(person.name);

for (const hobby of person.hobbies) {
  // 'hobby' = each item of hobbies array (ex. sports, cooking)
  // 'hobby' is a string type
  console.log(hobby.toUpperCase());
  // console.log(hobby.map()); // !!! ERROR !!!
  // you want this error to appear b/c .map() does not work on string types but on array types only:)
}
