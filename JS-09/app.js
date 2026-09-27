// <------------------Map--------------------------->
let marks= [1,2,3,4,5]
let modifiedMarks = marks.map((value) => value * 2)
console.log(modifiedMarks)


let numbers = [5, 10, 15, 20];
let modifiednumbers = numbers.map((value) => value + 10)
console.log(modifiednumbers)


let names = ["ali", "sara", "ahmed"];

let modifiednames = names.map(function(name) {
    return name.toUpperCase();
});

console.log(modifiednames);


// <------------------Filter-------------------------->
let Counting = [1, 2, 3, 4, 5, 6];
let Countingnumber = Counting.filter(function(number) {
    return number % 2 === 0;
});

console.log(Countingnumber);


let Greaternummber = [5, 12, 8, 20, 3, 15];
let greaterNumbers = Greaternummber.filter(function(number) {
    return number > 10;
});

console.log(greaterNumbers);


let Character = ["Ali", "Ahmed", "Sara", "Usman", "John"];
let modifiedCharacter = Character.filter(function(character) {
    return character.length > 4;
});

console.log(modifiedCharacter);


// let numbers = [2, 5, 7, 10, 3, 12];
// let result = numbers
//     .filter(function(number) {
//         return number > 5;
//     })
//     .map(function(number) {
//         return number * 2;
//     });

// console.log(result);