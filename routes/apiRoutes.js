import express from 'express';
import { properties } from '../controllers/apiController.js';

const router = express.Router();


router.get('/properties', properties);


export default router;