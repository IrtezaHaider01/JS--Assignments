console.log("-------------------level 1-------------------")

function sayHello (){
    console.log("Hello  World")
}
sayHello()



function showName (name){
    console.log(name)
}
showName("Irteza")


function add (a,b){
    return a + b
}
console.log(add(4,10))



function sub (a,b){
    return a - b
}
console.log(sub(2,1))



function mult (a,b){
    return a * b
}
console.log(mult(5,5))



function square (a){
    return a**2
}
console.log(square(4))


function cube (a){
    return a**3
}
console.log(cube(7))

function getFullName (firstName, lastName){
    console.log(`${firstName} ${lastName}`)
}
getFullName("Irteza","Haider")




console.log("-------------------level 2-------------------")

function isEven(a){
    if( a%2 == 0){
        console.log(true)
    }
    else{
        console.log(false)
    }
}
isEven(4)
isEven(7)


function isPositive(a){
    if( a >= 0){
        console.log(true)
    }
    else{
        console.log(false)
    }
}
isPositive(2)
isPositive(-2)


function findGreater(a,b){
    if( a > b){
        console.log(a)
    }
    else{
        console.log(b)
    }
}
findGreater(4,2)


function canVote(a){
    if( a >= 18){
        console.log("Eligible")
    }
    else{
        console.log("Not Eligible")
    }
}
canVote(32)
canVote(15)




function checkNum(num){
    if( num%2 == 0){
        console.log("Even")
    }
    else{
        console.log("Odd")
    }
}
checkNum(2)
checkNum(3)

function getGrade(marks){
    if(marks >= 80){
        console.log("A Grade")
    }
    else if(marks >= 70){
        console.log("B Grade")
    }
    else if(marks >= 60){
        console.log("C Grade")
    }
    else if(marks >= 50){
        console.log("D Grade")
    }
    else if(marks < 50){
        console.log("Fail")
    }

}

getGrade(89)
getGrade(74)
getGrade(63)
getGrade(54)
getGrade(48)


function isDivisibleBy5(num){
    if(num%5 == 0){
        console.log(true)
    }
    else{
        console.log(false)
    }
}
isDivisibleBy5(15)
isDivisibleBy5(6)



console.log("-------------------level 3-------------------")

function getLength(str){
    var length = 0;
    for (let i = 0; i < str.length; i++) {
        length += 1;
    }
    console.log(length)
}
getLength("Irteza")


function toUpperCase(str){  
    console.log(str.toUpperCase())
}
toUpperCase("irteza")


function getFirstCharacter(str){
    console.log(str[0])
}
getFirstCharacter("Irteza")


function getLastCharacter(str){
    console.log(str[str.length-1])
}
getLastCharacter("Irteza")


function isLongWord(word){
    if(word.length > 5){
        console.log(true)
    }
    else{
        console.log(false)
    }
}
isLongWord("Vegetable")


function calculateDiscount(price, discount){
    let result = ((price/100) * discount)
    console.log(result)
}

calculateDiscount(1000,20)


function calculateAge(birthYear, currentYear){
    console.log(currentYear - birthYear)
}
calculateAge(2004, 2026);


function convertToMinutes(hours){
    console.log(hours * 60)
}
convertToMinutes(2)
