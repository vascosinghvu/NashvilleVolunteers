import express from "express"
import * as eventController from "../controllers/eventController"

const router = express.Router()

router.route("/get-events").get(eventController.getEvents)

router.route("/get-event/:id").get(eventController.getEvent)

router.route("/create-event").post(eventController.createEvent)

router.route("/update-event/:id").put(eventController.updateEvent)

router.route("/delete-event/:id").delete(eventController.deleteEvent)

export default router
