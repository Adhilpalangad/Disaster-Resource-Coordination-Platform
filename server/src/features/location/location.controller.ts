import type { Request, Response } from "express";
import { KERALA_DISTRICTS, findDistrict, findTaluk, findLocalBody } from "../../data/keralaLocations.js";

export const getDistricts = (_req: Request, res: Response): void => {
  const data = KERALA_DISTRICTS.map((d) => ({ id: d.id, name: d.name }));
  res.json({ success: true, data });
};

export const getTaluks = (req: Request, res: Response): void => {
  const districtId = String(req.params["districtId"] ?? "");
  const district   = findDistrict(districtId);
  if (!district) {
    res.status(404).json({ success: false, message: "District not found" });
    return;
  }
  const data = district.taluks.map((t) => ({ id: t.id, name: t.name }));
  res.json({ success: true, data });
};

export const getLocalBodies = (req: Request, res: Response): void => {
  const talukId = String(req.params["talukId"] ?? "");
  const taluk   = findTaluk(talukId);
  if (!taluk) {
    res.status(404).json({ success: false, message: "Taluk not found" });
    return;
  }
  const data = taluk.localBodies.map((lb) => ({ id: lb.id, name: lb.name, type: lb.type }));
  res.json({ success: true, data });
};

export const getWards = (req: Request, res: Response): void => {
  const localBodyId = String(req.params["localBodyId"] ?? "");
  const lb          = findLocalBody(localBodyId);
  if (!lb) {
    res.status(404).json({ success: false, message: "Local body not found" });
    return;
  }
  res.json({ success: true, data: lb.wards });
};
