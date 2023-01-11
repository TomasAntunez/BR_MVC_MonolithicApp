import Property from './Property.js';
import Price from './Price.js';
import Category from './Category.js';
import User from './User.js';
import Message from './Message.js';


// Price.hasOne(Property);
Property.belongsTo(Price, { foreingKey: 'priceId' });
Property.belongsTo(Category, { foreingKey: 'categoryId' });
Property.belongsTo(User, { foreingKey: 'userId' });
Property.hasMany(Message, { foreingKey: 'propertyId' });

Message.belongsTo(Property, { foreingKey: 'propertyId' });
Message.belongsTo(User, { foreingKey: 'userId' });

export {
    Property,
    Price,
    Category,
    User,
    Message
};