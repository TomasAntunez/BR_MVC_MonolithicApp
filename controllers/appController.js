import { Sequelize } from 'sequelize';
import { Price, Category, Property } from '../models/index.js';


const beginning = async (req, res) => {

    const [categories, prices, homes, apartments] = await Promise.all([
        Category.findAll({raw: true}),
        Price.findAll({raw: true}),
        Property.findAll({
            limit: 3,
            where: {
                categoryId: 1
            },
            include: [
                {
                    model: Price,
                    as: 'price'
                }
            ],
            order: [
                ['createdAt', 'DESC']
            ]
        }),
        Property.findAll({
            limit: 3,
            where: {
                categoryId: 2
            },
            include: [
                {
                    model: Price,
                    as: 'price'
                }
            ],
            order: [
                ['createdAt', 'DESC']
            ]
        })
    ]);

    res.render('index', {
        page: 'Beginning',
        categories,
        prices,
        homes,
        apartments,
        csrfToken: req.csrfToken()
    });
};


const category = async (req, res) => {
    const { id } = req.params;

    // Check if category exists
    const category = await Category.findByPk(id);
    if(!category) {
        return res.redirect('/404');
    }

    // Get category properties
    const properties = await Property.findAll({
        where: {
            categoryId: id
        },
        include: [
            { model: Price, as: 'price' }
        ]
    });

    res.render('category', {
        page: category.name,
        properties,
        csrfToken: req.csrfToken()
    });
};


const notFounded = (req, res) => {
    res.render('404', {
        page: 'Not Founded',
        csrfToken: req.csrfToken()
    });
};


const searcher = async (req, res) => {
    const { term } = req.body;

    // Check that the term is not empty
    if(!term.trim()) {
        return res.redirect('back');
    }

    // Consult the properties
    const properties = await Property.findAll({
        where: {
            title: {
                [Sequelize.Op.like]: '%' + term + '%'
            }
        },
        include: [
            { model: Price, as: 'price' }
        ]
    });

    res.render('search', {
        page: `Results of "${term.trim()}"`,
        properties,
        csrfToken: req.csrfToken()
    })
};


export {
    beginning,
    category,
    notFounded,
    searcher
}