import userModel from "../models/userModel.js";
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import validator from 'validator'

//login user
const loginUser = async (req,res) =>{
    const {email, pin} = req.body;
    try {
        const user = await userModel.findOne({email});

        if(!user){
           return res.json({success:false, message:'User does not exist'}) 
        }

        const isMatch = await bcrypt.compare(pin, user.pin)

        if(!isMatch){
            return res.json({success:false, message:'Invalid credentials'})
        }

        const token = createToken(user._id);
        res.json({success:true, token, role:user.role})
    } catch (error) {
        console.log(error)
        res.json({success:false, message: error.message || 'Error'})
    }
}

const createToken = (id) =>{
    // Fallback value so login/register still work even if env var is missing
    const secret = process.env.JWT_SECRET || 'dev_fallback_jwt_secret_change_me';
    return jwt.sign({id}, secret);
}

//register user
const registerUser = async (req, res) =>{
    const {
        firstName,
        lastName,
        mobileNo,
        email,
        pin,
        confirmPin,
        address,
        city,
        role
    } = req.body;
    try {
        const requiredFields = { firstName, lastName, mobileNo, email, pin, confirmPin, address, city };
        const missingField = Object.entries(requiredFields).find(([, value]) => !value?.toString().trim());
        if (missingField) {
            return res.json({ success: false, message: `${missingField[0]} is required` });
        }

        const exists = await userModel.findOne({ $or: [{ email }, { mobileNo }] });
        if (exists) {
            const message = exists.email === email
                ? 'User with this email already exists'
                : 'User with this mobile number already exists';
            return res.json({ success: false, message });
        }

        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: 'Please enter a valid email' });
        }

        if (!/^\d{4}$/.test(pin)) {
            return res.json({ success: false, message: 'PIN must be exactly 4 digits' });
        }

        if (pin !== confirmPin) {
            return res.json({ success: false, message: 'PIN and confirm PIN do not match' });
        }

        if (role && !['admin', 'user'].includes(role)) {
            return res.json({ success: false, message: 'Invalid role. Role must be admin or user' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPin = await bcrypt.hash(pin, salt);

        const newUser = new userModel({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            mobileNo: mobileNo.trim(),
            email: email.trim().toLowerCase(),
            pin: hashedPin,
            address: address.trim(),
            city: city.trim(),
            role: role || 'user'
        });

        const user = await newUser.save();
        const token = createToken(user._id);
        res.json({ success: true, token, role: user.role });

    } catch (error) {
        console.log(error)
        res.json({success:false, message: error.message || 'Error'})
    }
}

export {loginUser, registerUser}