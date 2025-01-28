import express from "express"
import * as volunteerController from "../controllers/volunteerController"

const router = express.Router()

router.route("/get-volunteers").get(volunteerController.getVolunteers)

router.route("/get-volunteer/:v_id").get(volunteerController.getVolunteer)

router.route("/create-volunteer").post(volunteerController.createVolunteer)

router.route("/update-volunteer/:v_id").put(volunteerController.updateVolunteer)

router.route("/delete-volunteer/:v_id").delete(volunteerController.deleteVolunteer)

export default router
