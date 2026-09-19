import { Router } from "express";
import { submitContactForm } from "./contact.controller.js";

const router = Router();

// POST /api/contact — public contact form submission
router.post("/", submitContactForm);

export default router;
