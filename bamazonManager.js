var mysql = require('mysql');
var inquirer = require('inquirer');

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'bamazondb'
});

connection.connect(function (err) {
    if (err) throw err;
});

function managerMenu() {
    inquirer.prompt([{
        type: 'list',
        message: 'Task:',
        choices: ['View Products', 'View Low Inv', 'Add to Inv', 'Add New Product'],
        name: 'task'
    }]).then(current => {
        switch (current.task) {
            case 'View Products':
                viewProducts();
                break;
            case 'View Low Inv':
                viewLowInv();
                break;
            case 'Add to Inv':
                addInv();
                break;
            case 'Add New Product':
                addNewItem();
                break;
        }
    })
}

function viewProducts() {
    connection.query('SELECT * FROM products', function (err, res) {
        if (err) {
            inquirer.prompt([{
                type: 'confirm',
                message: 'No products to view, would you like to add some?',
                default: false,
                name: 'addingItem'
            }]).then(is => {
                if (is.addingItem) {
                    addNewItem();
                } else {
                    return;
                }
            })
        } else {
            for (i in res) {
                console.log(itemFormat4View(res[i]))
            }
        }
    });
    managerMenu();

}

function viewLowInv() {
    notEnoughQuantity = 100;
    connection.query('SELECT * FROM products WHERE quantity < ' + notEnoughQuantity, function (err, res) {
        if (err) throw err;
        for (var i in res) {
            console.log(itemFormat4View(res[i]))
        };
        managerMenu();
    })
}

function addInv() {

    inquirer.prompt([{
        message: "Type the items ID,amount to add(ex:3,50). Then press enter.",
        name: 'toAdd'
    }]).then(items => {
        item = items.toAdd.split(',');
        connection.query('SELECT quantity FROM products WHERE ID = ' + item[0], function (err, res) {
            if (err) throw err;
            connection.query('UPDATE products SET quantity = ? WHERE ID = ?', [res[0].quantity + item[1], item[0]], function (err, res) {
                if (err) throw err;
                console.log('Updated quantity for ID: ' + item[0]);
            })

        })
    })
    managerMenu();

}

function addNewItem() {
    inquirer.prompt([{
        message: "New items name?",
        name: "name"
    }, {
        message: "Current Quantity?",
        name: "quantity"
    }, {
        message: "Price?(whole numbers)",
        name: "cost"
    }, {
        type: 'list',
        message: "Department?",
        choices: ["IceCream", "NoBakeCookieDough"],
        name: 'department_name'
    }]).then(item => {
        connection.query('INSERT INTO products SET ?', [item], function (err, res) {
            if (err) throw err;
        });
    })
    managerMenu();


}

function itemFormat4View(item) {
    return ('ID: ' + item.ID + ' | Name: ' + item.name + ' | Quantity: ' + item.quantity + ' | Cost: $' + item.cost + '.00/per');
}

managerMenu();