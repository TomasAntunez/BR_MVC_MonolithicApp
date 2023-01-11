import { DataTypes } from 'sequelize';
import db from '../config/db.js'
import bcrypt from 'bcrypt';

const User = db.define('user', {

    name: {
        type: DataTypes.STRING,
        allowNull: false
    },

    email: {
        type: DataTypes.STRING,
        allowNull: false
    },

    password: {
        type: DataTypes.STRING,
        allowNull: false
    },

    token: {
        type: DataTypes.STRING
    },

    confirmed: {
        type: DataTypes.BOOLEAN
    }

}, {
    hooks: {
        beforeCreate: async function(user) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
        }
    },
    scopes: {
        deletePassword: {
            attributes: {
                exclude: ['password', 'token', 'confirmed', 'createdAt', 'updatedAt']
            }
        }
    }
});

// Custom methods
User.prototype.verifyPassword = function(password) {
    return bcrypt.compareSync(password, this.password)
}


export default User;