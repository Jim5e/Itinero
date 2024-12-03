import express from "express";
import * as itinerariesController from "../controllers/itineraries.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = express.Router();
router.get("/itineraries", authenticate, itinerariesController.getItineraryByUserId);
router.get("/itineraries/:itineraryId/activities", itinerariesController.getActivitiesByItineraryId);
router.get("/itineraries/:id", itinerariesController.getItineraryById);
router.post("/itineraries/create", authenticate, itinerariesController.createItinerary);

export default router;