const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2");

const app = express();
const PORT = 8000;

// db
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "test",
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL database: ", err);
    return;
  }
  console.log("Connected to MySQL database");
});

// bodyparser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const UssdMenu   = require('ussd-builder');

app.get("/", (req, res) => {
  res.send("Success Message");
});


let menu = new UssdMenu();

let dataToSave = {}

const atCredentials = {
    
}

const AfricasTalking = require('africastalking')(atCredentials)

const sms = AfricasTalking.SMS

menu.startState({
    run: () =>{
        menu.con('Welcome! to Charitable Circle: ' + '\n1. Donate ' + '\n2. Exit' );
    },
    next:{
        '1': 'Donate',
        '2': 'quit',
        
    }
});

menu.state('Donate', {
    run: () =>{
        menu.con('  Enter your name?')
    },
    next: {
        '*[a-zA-Z]+': 'name'
    }
});

menu.state('name', {
    run: () => {
        let name = menu.val;
        dataToSave.name = name;
        console.log(dataToSave);
        
        menu.con('Enter Your Location');

    },

    next: {
        // using regex to match user input to net state

        '*[a-zA-Z]+': 'location'    
    }
});

menu.state('location', {
    run: async () =>{
        let location = menu.val;
        dataToSave.location = location;
        console.log(dataToSave);

        menu.con("item to donate")
       

    },
    next: {
        '*[a-zA-Z]+': 'item'    
    }
});

menu.state('item', {
    run: () =>{
        let item = menu.val;
        dataToSave.item = item;
        console.log(dataToSave);
        menu.con('  Enter time and date ?')
    },
    next: {
        '*[a-zA-Z]+': 'date'
    }
});

menu.state('date', {
    run: async() => {
        let date = menu.val;
        dataToSave.date = date; 
        const options = {
            to     : menu.args.phoneNumber,
            message: `Hi ${dataToSave.name}, Thankyou for your willingness to donate.We will collect your donations on the specified date`
        }
        sms.send(options)
        .then(console.log)
        .catch(console.log)

        

        await sms.send(options)
                .then( response =>{
                    console.log(response)
                })
                .catch( error => {
                    console.log(error)
                })
      
        menu.end("Thank you for choosing Charitable Circle");

    },
});

menu.state('quit', {
    run: () =>{
        menu.end("Goodbye")
    }
})

app.post('/ussd', (req, res)=>{
    menu.run(req.body, ussdResult => {
        res.send(ussdResult)
    })
})



app.listen(PORT, () => {
  console.log("App is listening on port: ", PORT);
});
