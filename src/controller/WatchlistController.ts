import { Request, Response } from "express";
import Watchlist from "../models/Watchlist";

// POST /api/watchlist/
export const saveWatchList = async (req: Request, res: Response) => {
    try {
        const { profileId, contentId, addedAt } = req.body;

        if (!profileId || !contentId || !addedAt) {
            return res.status(400).json({
                message: "All Fields Are Required"
            });
        }

        const watchlist = await Watchlist.create({profileId, contentId, addedAt});

        return res.status(201).json({
            message: "Watchlist Saved Successfully",
            data: watchlist
        });

    } catch (error) {
        return res.status(500).json({
            message: "Failed to Save Watch List", error
        });
    }
};

// PUT /api/watchlist/:id
export const updateWatchList = async (req: Request, res: Response) => {
    try {
        const { profileId, contentId, addedAt } = req.body;

        if (!profileId || !contentId || !addedAt) {
            return res.status(400).json({
                message: "All Fields Are Required"
            });
        }

        const watchlist = await Watchlist.findByIdAndUpdate(
            req.params.id,
            { profileId, contentId, addedAt },
            { new: true, runValidators: true }
        );

        if(!watchlist){
            return res.status(404).json({
                message : 'Watchlist Not Found'
            })
        }

        res.status(201).json({
            message : 'Watchlist Updated Successfully',
            data : watchlist
        })

    } catch (error) {
       res.status(500).json({
           message : 'Failed to Update Watchlist : ', error
       })
    }
};

//DELETE /api/watchlist/:id
export const deleteWatchList = async (req : Request, res : Response) => {
    try {
        const watchlist = await Watchlist.findByIdAndDelete(req.params.id)

        if (!watchlist) {
            return res.status(404).json({
                message : 'Watchlist Not Found'
            })
        }

        res.json({
            message : 'Watchlist Deleted Successfully'
        })

    } catch (error) {
        res.status(500).json({
            message : 'Failed to Delete Watchlist : ', error
        })
    }
}

//GET /api/watchlist/
export const getWatchList = async (req : Request, res : Response) => {
    try {
        const watchlist = await Watchlist.find().sort( {createdAt : -1} )
        return res.json(watchlist)
    } catch (error) {
        res.status(500).json({
            message : 'Failed to Fetch Watch Lists : ', error
        })
    }
}
