import express from "express"
import * as organizationController from "../controllers/organizationController"
import multer from "multer"

const router = express.Router()

// Configure multer
const storage = multer.memoryStorage()
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
})

router.route("/get-organizations").get(organizationController.getOrganizations)

router.route("/get-organization/:o_id").get(organizationController.getOrganization)

router.route("/create-organization").post(upload.single('image'), organizationController.createOrganization)

router.route("/update-organization/:o_id").put(upload.single('image'), organizationController.updateOrganization)

router.route("/delete-organization/:o_id").delete(organizationController.deleteOrganization)

export default router
