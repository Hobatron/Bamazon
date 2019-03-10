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

function customerInput() {
    inquirer.prompt([{
        message: 'Please enter a product ID(2-11)',
        name: 'id'
    }]).then(input => {
        id = input.id;
        console.log(id);
        if (id > 1 && id < 12) {
            connection.query('SELECT * FROM products where ID = ' + id, function (err, res) {
                if (res[0].quantity > 0) {
                    purchesing(res[0]);
                } else {
                    notEnoughQuantity();
                };
            });
        } else {
            console.log("Please enter a valid id #'s 2-11");
            customerInput();
        };
    });
};

function purchesing(item) {
    inquirer.prompt([{
        message: "You've selected: " + '"' + item.name + '"' + ". There's " + item.quantity + " in stock. How much would you like to order?",
        name: 'quantity'
    }]).then(order => {
        qnt = order.quantity;
        if (qnt > 0 && qnt < item.quantity) {
            connection.query('UPDATE products SET quantity = ? where id = ?', [item.quantity - qnt, item.ID], function (err, res) {
                console.log('Order created for ' + qnt + ' of ' + item.name)
            });
            console.log('Your total comes to: $' + item.cost * qnt + '.00, with free shipping! Thanks for shopping with Bamazon');
            connection.end();
        } else if (qnt > item.quantity) {
            console.log('Not enough in stock, type another amount, or 0 to return');
            purchesing(item);
        } else {
            console.log('Returning to main menu')
            customerInput();
        }
    })
}

function notEnoughQuantity() {
    console.log("There's none in stock! We'll notice admins and get in ordered soon. Sorry!");
    customerInput();
}


customerInput();