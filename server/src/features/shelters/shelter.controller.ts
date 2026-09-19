import type { Request, Response } from "express";
import { Shelter } from "./shelter.model.js";
import { databaseService } from "../resilience/database.service.js";

// Helper to seed initial 3 shelters if collection is empty
const seedInitialSheltersIfEmpty = async () => {
  const count = await databaseService.countDocuments(Shelter);
  if (count === 0) {
    await databaseService.create(Shelter, { name: "St. Mary's School Relief Shelter", location: "Wayanad Sector 1", capacity: 300, occupancy: 240, status: "in_progress", manager: "Sr. Teresa" });
    await databaseService.create(Shelter, { name: "Community Hall Camp B", location: "Calicut Road", capacity: 150, occupancy: 145, status: "pending", manager: "M. Nair" });
    await databaseService.create(Shelter, { name: "Central Indoor Stadium Shelter", location: "Town Center", capacity: 500, occupancy: 120, status: "verified", manager: "R. Pillai" });
  }
};

/** GET /api/shelters */
export const getShelters = async (req: Request, res: Response): Promise<void> => {
  try {
    await seedInitialSheltersIfEmpty();

    const { search } = req.query;
    const query: Record<string, unknown> = {};

    if (search && typeof search === "string" && search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");
      query.$or = [
        { name: searchRegex },
        { location: searchRegex },
        { manager: searchRegex },
      ];
    }

    const shelters = await databaseService.find(Shelter, query, { sort: { createdAt: -1 } });

    res.status(200).json({
      success: true,
      data: shelters,
      count: shelters.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch shelters",
      error: String(error),
    });
  }
};

/** GET /api/shelters/:id */
export const getShelterById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const shelter = await databaseService.findById(Shelter, id);

    if (!shelter) {
      res.status(404).json({ success: false, message: "Shelter not found" });
      return;
    }

    res.status(200).json({ success: true, data: shelter });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch shelter details",
      error: String(error),
    });
  }
};

/** POST /api/shelters */
export const createShelter = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, location, capacity, occupancy, status, manager, phone, notes } = req.body;

    if (!name || !location || capacity === undefined || !manager) {
      res.status(400).json({
        success: false,
        message: "name, location, capacity, and manager are required",
      });
      return;
    }

    const shelter = await databaseService.create(Shelter, {
      name: name.trim(),
      location: location.trim(),
      capacity: Number(capacity) || 100,
      occupancy: Number(occupancy) || 0,
      status: status || "verified",
      manager: manager.trim(),
      phone: phone?.trim(),
      notes: notes?.trim(),
    });

    res.status(201).json({
      success: true,
      message: "Shelter created successfully",
      data: shelter,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create shelter",
      error: String(error),
    });
  }
};

/** PUT/PATCH /api/shelters/:id */
export const updateShelter = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const { name, location, capacity, occupancy, status, manager, phone, notes } = req.body;

    const updated = await databaseService.findByIdAndUpdate(
      Shelter,
      id,
      {
        ...(name && { name: name.trim() }),
        ...(location && { location: location.trim() }),
        ...(capacity !== undefined && { capacity: Number(capacity) }),
        ...(occupancy !== undefined && { occupancy: Number(occupancy) }),
        ...(status && { status }),
        ...(manager && { manager: manager.trim() }),
        ...(phone !== undefined && { phone: phone.trim() }),
        ...(notes !== undefined && { notes: notes.trim() }),
      },
      { new: true, runValidators: true }
    );

    if (!updated) {
      res.status(404).json({ success: false, message: "Shelter not found" });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Shelter updated successfully",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update shelter",
      error: String(error),
    });
  }
};

/** DELETE /api/shelters/:id */
export const deleteShelter = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const deleted = await databaseService.findByIdAndDelete(Shelter, id);

    if (!deleted) {
      res.status(404).json({ success: false, message: "Shelter not found" });
      return;
    }

    res.status(200).json({ success: true, message: "Shelter deleted successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete shelter",
      error: String(error),
    });
  }
};

