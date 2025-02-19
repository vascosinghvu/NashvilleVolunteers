import express from "express"
import * as eventController from "../controllers/eventController"
import multer from "multer"

const router = express.Router()

// Configure multer
const storage = multer.memoryStorage()
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
})

router.route("/get-events").get(eventController.getEvents)

router.route("/get-event/:event_id").get(eventController.getEvent)

router.route("/create-event")
  .post(upload.single('image'), eventController.createEvent)
  .post(eventController.createEvent)  // Allow both with and without image

router.route("/update-event/:event_id").put(upload.single('image'), eventController.updateEvent)

router.route("/delete-event/:event_id").delete(eventController.deleteEvent)

// ie http://localhost:8000/event/search-events?query=meal distribution
router.route("/search-events").get(eventController.searchEvents)

// Add this new route for getting organization's events
router.route("/organization/:o_id").get(eventController.getOrganizationEvents)

export default router
