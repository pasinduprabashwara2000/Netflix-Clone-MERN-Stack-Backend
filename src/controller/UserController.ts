import {Request, Response} from "express";
import bcrypt from "bcryptjs";
import User from '../models/User'

//POST /api/user/
export const createUser = async (req : Request, res : Response) => {
    try {
        const {name, email, hashedPassword, role, isActive} = req.body

        if(!name || !email || !hashedPassword || !role){
            return res.status(400).json({
                message : 'name, email, hashed password, role and isActive are required'
            })
        }

        const user = await User.create({
            name, email, role, isActive,
            hashedPassword : await bcrypt.hash(hashedPassword, 10)
        })

        res.status(201).json({
            message : 'User Created Successfully',
            data : { ...user.toObject(), hashedPassword : undefined }
        })

    } catch (error){
        res.status(500).json({
            message: 'Failed to Create User : ', error : (error as Error).message
        })
    }
}

//PUT /api/user/:id
export const updateUser = async (req: Request, res : Response) => {
    try {
        const {name, email, hashedPassword, role, isActive} = req.body

        const update : Record<string, unknown> = {name, email, role, isActive}
        if(hashedPassword) update.hashedPassword = await bcrypt.hash(hashedPassword, 10)

        const user = await User.findByIdAndUpdate(req.params.id, update,
            {new : true, runValidators : true}).select('-hashedPassword')

        if(!user){
            return res.status(404).json({
                message : 'User not found'
            })
        }

        res.json({
            message : 'User Updated Successfully',
            data : user
        })
    } catch (error) {
        res.status(500).json({
            message : 'Failed to Update User : ', error : (error as Error).message
        })
    }
}

//DELETE /api/delete/:id
export const deleteUser = async (req : Request , res : Response) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id)

        if(!user){
            return res.status(404).json({
                message : 'User not found'
            })
        }

        res.json({
            message : 'User Deleted Successfully'
        })

    } catch (error) {
        res.status(500).json({
            message : 'Failed to load User : ', error : (error as Error).message
        })
    }
}

//GET /api/user/
export const getUser = async (req : Request, res : Response) => {
    try {
        const user = await User.find().select('-hashedPassword').sort( {createdAt : -1} )
        res.json(user)
    } catch (error) {
        res.status(500).json({
            message : 'Failed to Fetch Users : ', error : (error as Error).message
        })
    }
}