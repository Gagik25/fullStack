
const bycrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const keys = require('../config/Keys');
const errorHandler = require('../utils/errorHandler');



module.exports.login = async (req, res) => {
    const condidate = await User.findOne({email: req.body.email});

    if (condidate) {
        const passwordResult = bycrypt.compareSync(req.body.password, condidate.password);
        if (passwordResult) {
            const token = jwt.sign({
               email: condidate.email,
               userId: condidate._id
            }, keys.jwt, {expiresIn: 60 * 60});



            res.status(200).json({
                token: `Bearer ${token}`
            })
        } else {
            res.status(401).json({
                message: 'Password not comply with'
            })
        }

    } else {
        res.status(404).json({
            message: "User not founded"
        })
    }
};


module.exports.register = async (req, res) => {


    // check send data register in mongoDB start
    // const user = new User({
    //     email: req.body.email,
    //     password: req.body.password
    // });
    //
    // user.save().then(() => console.log('User created'))
    // check send data register in mongoDB end

    const condidate = await User.findOne({email: req.body.email});

    if (condidate) {
        //  send user error this email available
        res.status(409).json({
            message: 'This email it is already available'
        })
    } else {
        //  it must creat user

        const salt = bycrypt.genSaltSync(10);
        const password = req.body.password;
        const user = new User({
            email: req.body.email,
            password: bycrypt.hashSync(password, salt)
        });


        try {
            await user.save();
            res.status(201).json(user)
        } catch (e) {
            errorHandler(res, e);
        }
    }
};
