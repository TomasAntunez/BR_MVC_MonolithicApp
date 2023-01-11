import { unlink } from 'node:fs/promises';
import { validationResult } from 'express-validator';
import { Category, Price, Property, Message, User } from '../models/index.js';
import { isSeller, formatDate } from '../helpers/index.js';

const admin = async (req, res) => {

    // Read QueryString
    const { page: currentPage } = req.query;

    const expression = /^[1-9]$/;
    if(!expression.test(currentPage)) {
        return res.redirect('/my-properties?page=1');
    }

    try {
        const { id } = req.user;

        // Limits and Offset for pager
        const limit = 10;
        const offset = (currentPage * limit) - limit

        const [properties, total] = await Promise.all([
            Property.findAll({
                limit,
                offset,
                where: {
                    userId: id
                },
                include: [
                    { model: Category, as: 'category' },
                    { model: Price, as: 'price' },
                    { model: Message, as: 'messages' }
                ]
            }),
            Property.count({
                where: {
                    userId: id
                }
            })
        ]);
    
        res.render('properties/admin', {
            page: 'My Properties',
            csrfToken: req.csrfToken(),
            properties,
            total,
            offset,
            limit,
            pages: Math.ceil(total / limit),
            currentPage: Number(currentPage)
        });
        
    } catch (error) {
        console.log(error);
    }
};


// Form to create a new property
const create = async (req, res) => {
    // Consult models of price and category
    const [categories, prices] = await Promise.all([
        Category.findAll(),
        Price.findAll()
    ]);

    res.render('properties/create', {
        page: 'Create Property',
        csrfToken: req.csrfToken(),
        categories,
        prices,
        data: {}
    });
};


const save = async (req, res) => {
    // Validation
    let result = validationResult(req);

    if(!result.isEmpty()) {

        const [categories, prices] = await Promise.all([
            Category.findAll(),
            Price.findAll()
        ]);

        return res.render('properties/create', {
            page: 'Create Property',
            csrfToken: req.csrfToken(),
            categories,
            prices,
            errors: result.array(),
            data: req.body
        });
    }

    // Create record
    const { title, description, bedrooms, parking, toilets, street, lat, lng, price: priceId, category: categoryId } = req.body;

    const { id: userId } = req.user;

    try {
        const savedProperty = await Property.create({
            title,
            description,
            bedrooms,
            parking,
            toilets,
            street,
            lat,
            lng,
            priceId,
            categoryId,
            userId,
            image: ''
        });

        const { id } = savedProperty;

        res.redirect(`/properties/add-image/${id}`);
        
    } catch (error) {
        console.log(error);
    }
};

const addImage = async (req, res) => {

    const { id } = req.params
    
    // Validate that the property exists
    const property = await Property.findByPk(id);

    if(!property) {
        return res.redirect('/my-properties');
    }

    // Validate that the property is not published
    if(property.published) {
        return res.redirect('/my-properties');
    }

    // Validate that the property belongs to whoever visits the page
    if( req.user.id.toString() !== property.userId.toString() ) {
        return res.redirect('/my-properties');
    }

    res.render('properties/add-image', {
        page: `Add Image: ${property.title}`,
        csrfToken: req.csrfToken(),
        property
    });
};


const saveImage = async (req, res, next) => {

    const { id } = req.params
    
    // Validate that the property exists
    const property = await Property.findByPk(id);

    if(!property) {
        return res.redirect('/my-properties');
    }

    // Validate that the property is not published
    if(property.published) {
        return res.redirect('/my-properties');
    }

    // Validate that the property belongs to whoever visits the page
    if( req.user.id.toString() !== property.userId.toString() ) {
        return res.redirect('/my-properties');
    }

    try {
        // Save image and publish property
        property.image = req.file.filename;
        property.published = 1;

        await property.save();

        next();

    } catch (error) {
        console.log(error);
    }
};


const edit = async (req, res) => {

    const { id } = req.params;

    // Validate that the property exists
    const property = await Property.findByPk(id);

    if(!property) {
        return res.redirect('/my-properties');
    }

    // Check that whoever visits the url is the one who created the property
    if(property.userId.toString() !== req.user.id.toString()) {
        return res.redirect('/my-properties');
    }

    // Consult models of price and category
    const [categories, prices] = await Promise.all([
        Category.findAll(),
        Price.findAll()
    ]);

    res.render('properties/edit', {
        page: `Edit Property: ${property.title}`,
        csrfToken: req.csrfToken(),
        categories,
        prices,
        data: property
    });
};


const saveChanges = async (req, res) => {

    // Verifi validation
    let result = validationResult(req);

    if(!result.isEmpty()) {

        const [categories, prices] = await Promise.all([
            Category.findAll(),
            Price.findAll()
        ]);

        return res.render('properties/edit', {
            page: 'Edit Property',
            csrfToken: req.csrfToken(),
            categories,
            prices,
            errors: result.array(),
            data: req.body
        });
    }

    const { id } = req.params;

    // Validate that the property exists
    const property = await Property.findByPk(id);

    if(!property) {
        return res.redirect('/my-properties');
    }

    // Check that whoever visits the url is the one who created the property
    if(property.userId.toString() !== req.user.id.toString()) {
        return res.redirect('/my-properties');
    }

    // Rewrite object
    try {
        const { title, description, bedrooms, parking, toilets, street, lat, lng, price: priceId, category: categoryId } = req.body;

        property.set({
            title,
            description,
            bedrooms,
            parking,
            toilets,
            street,
            lat,
            lng,
            priceId,
            categoryId
        });

        await property.save();

        res.redirect('/my-properties');

    } catch (error) {
        console.log(error);
    }
};


const remove = async (req, res) => {

    const { id } = req.params;

    // Validate that the property exists
    const property = await Property.findByPk(id);

    if(!property) {
        return res.redirect('/my-properties');
    }

    // Check that whoever visits the url is the one who created the property
    if(property.userId.toString() !== req.user.id.toString()) {
        return res.redirect('/my-properties');
    }

    // Delete image
    await unlink(`public/uploads/${property.image}`);

    // Delete property
    await property.destroy();

    res.redirect('/my-properties');
};


const changeStatus = async (req, res) => {

    const { id } = req.params;

    // Validate that the property exists
    const property = await Property.findByPk(id);

    if(!property) {
        return res.redirect('/my-properties');
    }

    // Check that whoever visits the url is the one who created the property
    if(property.userId.toString() !== req.user.id.toString()) {
        return res.redirect('/my-properties');
    }

    // Update
    property.published = !property.published;

    await property.save();

    res.json({
        result: true
    });
};


// Show a property
const showProperty = async (req, res) => {

    const { id } = req.params;

    // Check if the property exists
    const property = await Property.findByPk(id, {
        include: [
            { model: Category, as: 'category' },
            { model: Price, as: 'price' }
        ]
    });

    if(!property || !property.published) {
        return res.redirect('/404');
    }

    res.render('properties/show', {
        page: property.title,
        property,
        csrfToken: req.csrfToken(),
        user: req.user,
        isSeller: isSeller(req.user?.id, property.userId)
    });
};


const sendMessage = async (req, res) => {

    const { id } = req.params;

    // Check if the property exists
    const property = await Property.findByPk(id, {
        include: [
            { model: Category, as: 'category' },
            { model: Price, as: 'price' }
        ]
    });

    if(!property) {
        return res.redirect('/404');
    }

    // Render the errors
    // Validation
    let result = validationResult(req);

    if(!result.isEmpty()) {

        return res.render('properties/show', {
            page: property.title,
            property,
            csrfToken: req.csrfToken(),
            user: req.user,
            isSeller: isSeller(req.user?.id, property.userId),
            errors: result.array()
        });
    }

    const { message } = req.body;
    const { id: userId } = req.user;

    // Save message
    await Message.create({
        message,
        propertyId: id,
        userId
    });

    res.redirect('/');
};


// Read received messages
const seeMessages = async (req, res) => {

    const { id } = req.params;

    // Validate that the property exists
    const property = await Property.findByPk(id, {
        include: [
            {
                model: Message,
                as: 'messages',
                include: [
                    { model: User.scope('deletePassword'), as: 'user' }
                ]
            }
        ]
    });

    if(!property) {
        return res.redirect('/my-properties');
    }

    // Check that whoever visits the url is the one who created the property
    if(property.userId.toString() !== req.user.id.toString()) {
        return res.redirect('/my-properties');
    }

    res.render('properties/messages', {
        page: 'Messages',
        messages: property.messages,
        formatDate
    })
};


export {
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
}