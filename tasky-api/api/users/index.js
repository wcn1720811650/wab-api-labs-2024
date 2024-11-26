import express from 'express';
import User from './userModel';
import asyncHandler from 'express-async-handler';
import bcrypt from 'bcrypt'

const router = express.Router();

function validPassword(password) {
    const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    return regex.test(password)
}
// Get all users
router.get('/', async (req, res) => {
    const users = await User.find();
    res.status(200).json(users);
});

// register(Create)/Authenticate User
router.post('/', asyncHandler(async (req, res) => {
    if (req.query.action === 'register') {  //if action is 'register' then save to DB
       const {username,password} = req.body;
       if (!validPassword(password)) {
        return res.status(400).json({
            code:400,
            msg: 'Passwords must be at least 8 characters long and contain letters, numbers, and special characters.'
        });
       }

       const hashedPassword = await bcrypt.hash(password,10);

       const newUser = new User({ username, password:hashedPassword })
       await newUser.save();

       return res.status(201).json({
            code: 201,
            msg: 'register successfully'
        })
    } else {
        const user = await User.findOne({username});
            if (!user) {
                return res.status(401).json({ code: 401, msg: 'Authentication failed' });
            }else{
                return res.status(200).json({ code: 200, msg: "Authentication Successful", token: 'TEMPORARY_TOKEN' });
            }
    }
    
}));

// Update a user
router.put('/:id', async (req, res) => {
    if (req.body._id) delete req.body._id;
    const result = await User.updateOne({
        _id: req.params.id,
    }, req.body);
    if (result.matchedCount) {
        res.status(200).json({ code:200, msg: 'User Updated Sucessfully' });
    } else {
        res.status(404).json({ code: 404, msg: 'Unable to Update User' });
    }
});
export default router