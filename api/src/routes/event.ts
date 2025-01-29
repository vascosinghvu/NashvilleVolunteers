import express from "express"
import * as eventController from "../controllers/eventController"

const router = express.Router()

router.route("/get-events").get(eventController.getEvents)

router.route("/get-event/:event_id").get(eventController.getEvent)

router.route("/create-event").post(eventController.createEvent)

router.route("/update-event/:event_id").put(eventController.updateEvent)

router.route("/delete-event/:event_id").delete(eventController.deleteEvent)

router.route("/search-events").get(eventController.searchEvents)

export default router
