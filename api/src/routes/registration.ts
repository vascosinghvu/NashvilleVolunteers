import express from 'express'
import { getRegistrations, getUserRegistrations, getEventRegistrations, createRegistration, deleteRegistration } from '../controllers/registrationController'

const router = express.Router()

router.route("/get-registrations").get(getRegistrations)
router.route("/get-user-registrations/:v_id").get(getUserRegistrations)
router.route("/get-event-registrations/:event_id").get(getEventRegistrations)
router.route("/create-registration").post(createRegistration)
router.route("/delete-registration/:v_id/:event_id").delete(deleteRegistration)

export default router