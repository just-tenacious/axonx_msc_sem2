import Appointment from "../models/Appointment.js";
import { createBaseController } from "./baseController.js";

const controller = createBaseController(Appointment, "Appointment");
export default controller;
