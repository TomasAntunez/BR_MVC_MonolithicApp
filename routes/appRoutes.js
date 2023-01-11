import express from 'express';
import {
    beginning,
    category,
    notFounded,
    searcher
} from '../controllers/appController.js';


const router = express.Router();


// Main page
router.get('/', beginning);

// Categories
router.get('/categories/:id', category);

// 404 page
router.get('/404', notFounded);

// Searcher
router.post('/searcher', searcher)


export default router;