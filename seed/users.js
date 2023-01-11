import bcrypt from 'bcrypt';


const users = [
    {
        name: 'Tomas',
        email: 'email@email.com',
        confirmed: 1,
        password: bcrypt.hashSync('password', 10)
    }
];


export default users;