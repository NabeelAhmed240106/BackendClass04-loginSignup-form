


import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
  userId: String,
  doctorName: String,
  specialty: String,
  date: Date,
  time: String,
  image: String,
  status: String
});

export default mongoose.model("Appointment", appointmentSchema);

