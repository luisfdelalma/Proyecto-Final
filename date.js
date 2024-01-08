let date1 = new Date("2024-01-07T18:06:09.485Z")
let date2 = new Date()


// date.setMinutes(date.getMinutes() - 30)

// console.log(date.toString())

console.log(date1.toString());
console.log(date2.toString());
console.log(new Date(date2 - date1).getMinutes());