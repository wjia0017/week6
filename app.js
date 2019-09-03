var express = require("express");
const mongodb = require('mongodb');
let bodyParser = require('body-parser');

var app = express();

//setup the view Engine
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

//setup the static assets directories
app.use(express.static('images'));
app.use(express.static('css'));
app.set(express.static('view'));

app.use(bodyParser.urlencoded({
     extended: false
     }));

app.listen(8080);
console.log("Sever running at http://localhost:8080");

//configure MongoDB
const MongoClient = mongodb.MongoClient;

//connection URL
const url = "mongodb://localhost:27017/";

let db = null;
MongoClient.connect(url, {useNewUrlParser:true},
    function (err, client) {
        if (err) {
            console.log("Error", err);
        } else {
            console.log("Connected successfully");
            db = client.db("fit2095db");
        }
    });


/*HomePage*/
app.get('/', function(req,res){//function have two parameter, 
    res.sendFile(__dirname + '/views/index.html');
});

/*Task*/
app.get('/NewTask', function(req,res){
    res.sendFile(__dirname + '/views/NewTask.html');
});


app.post('/addTask', function (req, res) {
    let userDatails= req.body;
    userDatails.taskID = getNewId();
    let filter = {taskID: userDatails.taskID,taskname:userDatails.taskname, dueDate: userDatails.dueDate, 
                 taskDesc: userDatails.taskDesc, assignTo: userDatails.assignTo,
                 taskstatus: userDatails.taskstatus
    }
    db.collection('week5').insertOne(filter, function(err, result) {
           res.redirect('/listTasks');
    });

});

function getNewId() {
    return (Math.floor(100 + Math.random() * 900));
}

app.get('/deleteTask', function(req,res){
    res.sendFile(__dirname + '/views/deleteTask.html');
});

app.post('/deleteTask', function(req,res){
    let userDatails= req.body;
   
    db.collection("week5").deleteOne({taskID: parseInt(userDatails.taskID)},function (err, result){
        res.redirect('/listTasks');
    });
});

app.post('/deletetaskdatecompleted', function (req,res){
    let userDatails = req.body;
    db.collection("week5").deleteMany({taskstatus: 'complete'});
    res.redirect('/listTasks');
})


/*List Task*/
app.get('/listTasks', function(req,res){
    db.collection('week5').find({ }).toArray(function(err,data){
        res.render("listTasks", {tasks: data});
    });
});

app.get('/updateTask', function(req,res){
        res.sendFile(__dirname + '/views/updateTask.html');
    
});


app.post('/updateTask', function(req,res){
    let userDatails= req.body;
    // let filter ={taskID: userDatails.taskID};
    // let Update = { $set: {status: req.body.taskstatus}};
    db.collection("week5").updateOne({taskID:parseInt(userDatails.taskID)},  {$set: {taskstatus: req.body.taskstatus}}, function (err, result){
        res.redirect('/listTasks');
    });
});
app.get("/findtasks", function(req,res){
    res.sendFile(__dirname +'/views/findtasks.html');
})

app.post('/findtasks', function(req,res){
   let query = {taskID: {$gte: 30, $lte: 700} };
   db.collection("week5").find(query).toArray(function (err, result){
       if(err) throw err;
       console.log(result);
        res.redirect('/listTasks');
   })

})

