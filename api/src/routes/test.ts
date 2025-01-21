import express from "express"
import * as testController from "../controllers/testController"

const router = express.Router()

router.route("/test").post(testController.test)

export default router
