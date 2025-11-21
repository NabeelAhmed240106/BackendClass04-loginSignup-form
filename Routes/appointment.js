




import express from "express";
import mongoose from "mongoose";
import appointmentModel from "../model/appointmentSchema.js";

const router = express.Router();


router.get("/ping", (req, res) => res.status(200).json({ ok: true, message: "appointment route reachable" }));


function parseDateFlexible(dateStr) {
  if (!dateStr) return null;
  const cleaned = String(dateStr).trim().replace(/[;,\/]/g, "-");
  const parsed = new Date(cleaned);
  return isNaN(parsed.getTime()) ? null : parsed;
}


router.post("/", async (req, res) => {
  try {
    const { userId, doctorName, specialty, date, time, image } = req.body;
    if (!userId || !doctorName || !date || !time) {
      return res.status(400).json({ status: false, message: "Required fields missing" });
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ status: false, message: "Invalid userId" });
    }

    const parsedDate = parseDateFlexible(date);
    if (!parsedDate) return res.status(400).json({ status: false, message: "Invalid date" });

    const appt = await appointmentModel.create({
      userId,
      doctorName,
      specialty: specialty || "",
      date: parsedDate,
      time,
      image: image || "",
      status: "upcoming",
    });

    return res.status(201).json({ status: true, message: "Appointment created", data: appt });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
});



router.get("/", async (req, res) => {
  try {
    const { id, userId, status } = req.query;

    if (id) {
      if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ status: false, message: "Invalid id" });
      const appt = await appointmentModel.findById(id);
      if (!appt) return res.status(404).json({ status: false, message: "Appointment not found" });
      return res.status(200).json({ status: true, data: appt });
    }

    const filter = {};
    if (userId) {
      if (!mongoose.Types.ObjectId.isValid(userId)) return res.status(400).json({ status: false, message: "Invalid userId" });
      filter.userId = userId;
    }

    if (status) {
      if (status === "past") filter.status = { $in: ["completed", "canceled"] };
      else {
        const allowed = ["upcoming", "completed", "canceled"];
        if (!allowed.includes(status)) return res.status(400).json({ status: false, message: "Invalid status" });
        filter.status = status;
      }
    }

    const results = await appointmentModel.find(filter).sort({ date: 1 });
    return res.status(200).json({ status: true, data: results });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
});


router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ status: false, message: "Invalid id" });

    const allowed = ["doctorName", "specialty", "date", "time", "image", "status"];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = key === "date" ? parseDateFlexible(req.body[key]) : req.body[key];
    }

    if (updates.date === null) return res.status(400).json({ status: false, message: "Invalid date" });
    if (updates.status && !["upcoming", "completed", "canceled"].includes(updates.status)) {
      return res.status(400).json({ status: false, message: "Invalid status" });
    }

    if (Object.keys(updates).length === 0) return res.status(400).json({ status: false, message: "No valid fields to update" });

    const updated = await appointmentModel.findByIdAndUpdate(id, updates, { new: true });
    if (!updated) return res.status(404).json({ status: false, message: "Appointment not found" });

    return res.status(200).json({ status: true, message: "Appointment updated", data: updated });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
});


router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ status: false, message: "Invalid id" });

    const deleted = await appointmentModel.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ status: false, message: "Appointment not found" });

    return res.status(200).json({ status: true, message: "Appointment deleted", data: deleted });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
});

export default router;
