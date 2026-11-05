import {Request, Response} from "express";
import Profile from "../models/Profile";

//POST /api/profile/
export const createProfile = async (req : Request, res : Response) => {
    try {
        const {userId, name, avatarUrl, isKids, language, maturityLevel} = req.body

        if(!userId || !name || !avatarUrl || !isKids || !language || !maturityLevel){
            return res.status(400).json({
                message : 'userId, name, avatarUrl, isKids, language and maturity level required'
            })
        }

        const profile = await Profile.create({userId, name, avatarUrl, isKids, language, maturityLevel})

        res.status(201).json({
            message : 'User created successfully',
            data : profile
        })

    } catch (error) {
        res.status(500).json({
            message : 'Failed to Create Profile : ',error
        })
    }
}

//PUT /api/profile/
export const updateProfile = async (req : Request, res :  Response) => {
    try {
       const {userId, name, avatarUrl, isKids, language, maturityLevel} = req.body

       const profile = await Profile.findByIdAndUpdate(req.params.id,
             {userId, name, avatarUrl, isKids, language, maturityLevel},
             {new : true, runValidators : true})

       if(!profile){
           return res.status(404).json({
               message : 'Profile not found'
           })
       }

       res.json({
           message : 'Profile Updated successfully',
           data : profile
       })

    } catch (error) {
        res.status(500).json({
            message : 'Failed to Update Profile : ', error
        })
    }
}

//DELETE /api/profile/delete/:id
export const deleteProfile = async (req : Request, res : Response) => {
    try {
        const profile = await Profile.findByIdAndDelete(req.params.id)

        if(!profile){
            return res.status(404).json({
                message : 'Profile not found'
            })
        }

        res.json({
            message : 'Profile Deleted Successfully'
        })

    } catch (error) {
        res.status(500).json({
            message : 'Failed to Delete Profile : ', error
        })
    }
}

//GET /api/profile/
export const getProfile = async (req : Request, res : Response) => {
    try {
        const profile  = await Profile.find().sort({ createdAt : -1})
        res.json(profile)
    } catch (error) {
        res.status(500).json({
            message : 'Failed to Load Profiles : ', error
        })
    }
}