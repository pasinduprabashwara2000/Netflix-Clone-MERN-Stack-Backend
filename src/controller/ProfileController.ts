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
export const updateUser = async (req : Request, res :  Response) => {
    try {
       const {userId, name, avatarUrl, isKids, language, maturityLevel} = req.body

    } catch (error) {

    }
}