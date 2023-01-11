import express from 'express';
import csrf from 'csurf';
import cookieParser from 'cookie-parser';
import userRoutes from './routes/userRoutes.js';
import propertyRoutes from './routes/propertyRoutes.js';
import appRoutes from './routes/appRoutes.js';
import apiRoutes from './routes/apiRoutes.js';
import db from './config/db.js';


// Create app 
const app = express();


// Enable reading of form data
app.use( express.urlencoded({extended: true}) );


// Enable Cookie Parser
app.use( cookieParser() );

// Enable CSRF
app.use( csrf({cookie: true}) );


// Database connection
try {
    await db.authenticate();
    db.sync();
    console.log('Succesfull connection to database');
} catch(error) {
    console.log(error);
}


// Enable pug
app.set('view engine', 'pug');
app.set('views', './views');


// Public folder
app.use(express.static('public'));


// Routing
app.use('/', appRoutes);
app.use('/auth', userRoutes);
app.use('/', propertyRoutes);
app.use('/api', apiRoutes);


// Define a port and start the proyect
const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`The server is running on port ${port}`);
})