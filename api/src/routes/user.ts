import express from "express"
import { getUserByAuthId } from "../controllers/userController"

const router = express.Router()

router.route("/get-user/:u_id").get(getUserByAuthId)

export default router
