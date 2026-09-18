import type { Request, Response } from "express";
import { User } from "../auth/user.model.js";

/** GET /api/volunteers */
export const getVolunteers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, district } = req.query;

    const query: Record<string, unknown> = { role: "volunteer" };

    if (district && typeof district === "string" && district.trim()) {
      query.district = district.trim();
    }

    if (search && typeof search === "string" && search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
        { district: searchRegex },
        { profession: searchRegex },
        { organizationName: searchRegex },
      ];
    }

    const volunteers = await User.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: volunteers,
      count: volunteers.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch volunteers",
      error: String(error),
    });
  }
};

/** GET /api/volunteers/:id */
export const getVolunteerById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const volunteer = await User.findById(id);

    if (!volunteer || volunteer.role !== "volunteer") {
      res.status(404).json({ success: false, message: "Volunteer not found" });
      return;
    }

    res.status(200).json({ success: true, data: volunteer });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch volunteer details",
      error: String(error),
    });
  }
};

/** PATCH/PUT /api/volunteers/:id */
export const updateVolunteer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, phone, district, profession, organizationName } = req.body;

    const existing = await User.findById(id);
    if (!existing || existing.role !== "volunteer") {
      res.status(404).json({ success: false, message: "Volunteer not found" });
      return;
    }

    const volunteer = await User.findByIdAndUpdate(
      id,
      {
        ...(name && { name: name.trim() }),
        ...(phone !== undefined && { phone: phone.trim() }),
        ...(district !== undefined && { district: district.trim() }),
        ...(profession !== undefined && { profession: profession.trim() }),
        ...(organizationName !== undefined && { organizationName: organizationName.trim() }),
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Volunteer updated successfully",
      data: volunteer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update volunteer",
      error: String(error),
    });
  }
};

/** DELETE /api/volunteers/:id */
export const deleteVolunteer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const existing = await User.findById(id);
    if (!existing || existing.role !== "volunteer") {
      res.status(404).json({ success: false, message: "Volunteer not found" });
      return;
    }

    await User.findByIdAndDelete(id);

    res.status(200).json({ success: true, message: "Volunteer deleted successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete volunteer",
      error: String(error),
    });
  }
};
