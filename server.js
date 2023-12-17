const express = require('express');
const session = require('express-session');
const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://<username>:<password>@cluster0.mongodb.net/test?retryWrites=true&w=majority";

const app = express();

app.use(session({
    secret: '35900b97094c8f7b886f67ba535c298c32ba8bb5a507d66c8f3ce15d38fd1b5b3615c5221deb6201e2667fb9bbd21089555a6fd6170bdb1a8bcc36de51c8bdb1',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false} // set to true if you're using https
}));

app.post('/login', async (req, res) => {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    try {
        await client.connect();
        const database = client.db('SIH-SG');
        const users = database.collection('users');
        const user = await users.findOne({ role: req.body.role, username: req.body.username, password: req.body.password });
        if (!user) {
            res.status(401).send('Invalid username or password');
        } else {
            req.session.userId = user.userId; // Set user id as a session
            
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

app.post('/register', async (req, res) => {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
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
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    try {
        await client.connect();
        const database = client.db('SIH-SG');
        const collection = database.collection('data'); // Replace with your collection name

        // Query the database based on the view
        const view = req.body.view;
        let data;
        if (view === 'Daily View') {
            // Query for daily data
            data = await collection.find({}).toArray(); // Replace with your query
        } else if (view === 'Monthly View') {
            // Query for monthly data
            data = await collection.find({}).toArray(); // Replace with your query
        } else if (view === 'Yearly View') {
            // Query for yearly data
            data = await collection.find({}).toArray(); // Replace with your query
        }

        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching data');
    } finally {
        await client.close();
    }
});

app.get('/adash', (req, res) => {
    res.render('adash', { userId: req.session.userId });
});

app.get('/udash', (req, res) => {
    res.render('udash', { userId: req.session.userId });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});




const server = createServer(app);
const port = process.env.PORT || 3000;
server.listen(port, () => console.log(`Server started on port ${port}`));
module.exports = server;
