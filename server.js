const express = require('express');
const bodyParser = require('body-parser');
const User = require('./models/user');
const { MongoClient, ServerApiVersion } = require('mongodb');
const { createServer } = require('http');
const cors = require('cors');

const app = express();
app.set('view engine', 'ejs');
// Enable all CORS requests
app.use(cors());
const uri = "mongodb+srv://Uday:MjjJ700NYlGsgSPd@cluster0.q2srzww.mongodb.net/?retryWrites=true&w=majority";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('.')); // Serve static files from the current directory

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html'); // Send index.html file
});
app.post('/register', async (req, res) => {
    try {
        await client.connect();
        const database = client.db('SIH-SG');
        const users = database.collection('users');
        const newUser = {
            userId: req.body.userid,
            role: req.body.role,
            username: req.body.username,
            password: req.body.password
        };
        const result = await users.insertOne(newUser);
        res.sendFile(__dirname + '/index.html');
    } catch (err) {
        console.error(err);  // Log the error to the console
        res.status(500).send('Error registering user');
    } finally {
        await client.close();
    }
});

app.post('/fetchData', async (req, res) => {
    try {
        await client.connect();
        const database = client.db('SIH-SG');
        const collection = database.collection('data'); // Replace with your collection name

        // Query the database based on the view
        const view = req.body.view;
        let data;
        if (view === 'Daily View') {
            // Query for daily data
        } else if (view === 'Monthly View') {
            // Query for monthly data
        } else if (view === 'Yearly View') {
            // Query for yearly data
        }

        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    } finally {
        await client.close();
    }
});
const session = require('express-session');

app.use(session({
    secret: '35900b97094c8f7b886f67ba535c298c32ba8bb5a507d66c8f3ce15d38fd1b5b3615c5221deb6201e2667fb9bbd21089555a6fd6170bdb1a8bcc36de51c8bdb1',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false} // set to true if you're using https
}));
app.post('/login', async (req, res) => {
    try {
        await client.connect();
        const database = client.db('SIH-SG');
        const users = database.collection('users');
        const user = await users.findOne({ role: req.body.role, username: req.body.username, password: req.body.password });
        if (!user) {
            res.status(401).send('Invalid username or password');
        } else {
            req.session.userId = user.userId;
            if (user.role === 'admin') {
                res.redirect('/adash'); // Redirect to adash if the user is an admin
            } else {
                res.redirect('/udash'); // Redirect to udash otherwise
            }
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    } finally {
        await client.close();
    }
});
app.get('/udash', (req, res) => {
    res.render('udash', { userId: req.session.userId });
});
app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return console.log(err);
        }
        res.redirect('/index.html');
    });
});

const server = createServer(app);
const port = process.env.PORT || 3000;
server.listen(port, () => console.log(`Server started on port ${port}`));
module.exports = server;
