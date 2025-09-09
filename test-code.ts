// This file has intentional issues for testing the review bot

function calculateTotal(items: any) {
    let total = 0;
    for(var i = 0; i < items.length; i++) {
        total += items[i].price
    }
    return total
}

const user_name = "john_doe";  // Poor naming convention
console.log(user_name);        // Unnecessary console.log

// Missing error handling
function divide(a, b) {
    return a / b;  // What if b is 0?
}

// Unused variable
const unusedVar = "this is not used";

// Missing types
function processUser(user) {
    return {
        id: user.id,
        name: user.firstName + " " + user.lastName,
        email: user.email.toLowerCase()
    }
}

// Poor function naming
function doStuff(data) {
    return data.map(item => item.value);
}
