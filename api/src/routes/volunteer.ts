import express from "express"
import * as volunteerController from "../controllers/volunteerController"
import multer from "multer"
import { Request, Response } from "express"
const router = express.Router()

// Configure multer
const storage = multer.memoryStorage()
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
})

// Add a test route first
router
  .route("/test-upload")
  .post(upload.single("image"), volunteerController.testUpload)

router.route("/get-volunteers").get(volunteerController.getVolunteers)

router.route("/get-volunteer/:v_id").get(volunteerController.getVolunteer)

router
  .route("/get-volunteer-by-auth/:auth_id")
  .get(volunteerController.getVolunteerByAuthId)

router
  .route("/create-volunteer")
  .post(upload.single("image"), volunteerController.createVolunteer)

router
  .route("/update-volunteer/:v_id")
  .put(upload.single("image"), volunteerController.updateVolunteer)

router
  .route("/delete-volunteer/:v_id")
  .delete(volunteerController.deleteVolunteer)

router.put(
  "/edit-profile/:v_id",
  upload.single("image"),
  volunteerController.editProfile
)

router.post("/:v_id/skills", volunteerController.addSkill)
router.put("/:v_id/skills", volunteerController.updateSkills)

router.post("/:v_id/interests", volunteerController.addInterest)
router.put("/:v_id/interests", volunteerController.updateInterests)

router.put("/:v_id/experience", volunteerController.updateExperience)
router.put("/:v_id/availability", volunteerController.updateAvailability)

export default router
