var person = {
    name : 'Ryan',
    age  : 30
};

function updatePerson (obj) {
    obj = {
        name: 'Ryan',
        age : 24
    };
}

updatePerson(person);
console.log(person);

function updatePersonByRef(obj){
    obj.age = 36;
}

updatePersonByRef(person);
console.log(person);

var grades = [15,37];

function addGrade(ary){
    ary = [16, 38, 50];
    debugger;
}

addGrade(grades);
console.log(grades);

function addGradeByRef(ary){
    ary.push(90);
}

addGradeByRef(grades);
console.log(grades);