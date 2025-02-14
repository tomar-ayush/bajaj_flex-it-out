import { Schema, model, models } from "mongoose";

interface IOtp {
  email: string;
  otp: string;
  createdAt: Date;
}

const OtpSchema = new Schema<IOtp>({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 60 * 5,
  },
});

const Otp = models.Otp || model<IOtp>("Otp", OtpSchema);

export default Otp;

