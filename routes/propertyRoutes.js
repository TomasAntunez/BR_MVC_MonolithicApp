import express from 'express';
import { body } from 'express-validator';
import {
    admin,
    create,
    save,
    addImage,
    saveImage,
    edit,
    saveChanges,
    remove,
    changeStatus,
    showProperty,
    sendMessage,
    seeMessages
} from '../controllers/propertyController.js';
import protectRoute from '../middleware/protectRoute.js';
import upload from '../middleware/uploadImage.js';
import identifyUser from '../middleware/indentifyUser.js';

const router = express.Router();


router.get('/my-properties',
    protectRoute,
    admin
);

router.get('/properties/create',
    protectRoute,
    create
);
router.post('/properties/create',
    protectRoute,
    body('title').notEmpty().withMessage('Property title is required'),
    body('description')
        .notEmpty().withMessage('Property description is required')
        .isLength({ max: 200 }).withMessage('Property description is very long'),
    body('category').isNumeric().withMessage('Select a category'),
    body('price').isNumeric().withMessage('Select a price range'),
    body('bedrooms').isNumeric().withMessage('Select the number of bedrooms'),
    body('parking').isNumeric().withMessage('Select the number of parkings'),
    body('toilets').isNumeric().withMessage('Select the number of toilets'),
    body('lat').notEmpty().withMessage('Select location'),
    save
);

router.get('/properties/add-image/:id',
    protectRoute,
    addImage
);
router.post('/properties/add-image/:id',
    protectRoute,
    upload.single('image'),
    saveImage
);

router.get('/properties/edit/:id',
    protectRoute,
    edit
);
router.post('/properties/edit/:id',
    protectRoute,
    body('title').notEmpty().withMessage('Property title is required'),
    body('description')
        .notEmpty().withMessage('Property description is required')
        .isLength({ max: 200 }).withMessage('Property description is very long'),
    body('category').isNumeric().withMessage('Select a category'),
    body('price').isNumeric().withMessage('Select a price range'),
    body('bedrooms').isNumeric().withMessage('Select the number of bedrooms'),
    body('parking').isNumeric().withMessage('Select the number of parkings'),
    body('toilets').isNumeric().withMessage('Select the number of toilets'),
    body('lat').notEmpty().withMessage('Select location'),
    saveChanges
);

router.post('/properties/delete/:id',
    protectRoute,
    remove
);


router.put('/properties/:id',
    protectRoute,
    changeStatus
);


router.get('/messages/:id',
    protectRoute,
    seeMessages
);


// Public area
router.get('/property/:id',
    identifyUser,
    showProperty
);

// Save Messages
router.post('/property/:id',
    identifyUser,
    body('message').isLength({min:20}).withMessage('The message can not be empty or it is too short'),
    sendMessage
);


export default router;