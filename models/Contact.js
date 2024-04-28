import { Schema, model } from "mongoose";

import { handleSaveError, setUpdateSettings } from "./hooks.js";

import { emailRegexp, phoneRegexp } from "../constants/contact-constants.js";

const contactSchema = new Schema(
  {
    owner: { type: Schema.Types.ObjectId, ref: "user", required: true },
    name: { type: String, required: [true, "Set name for contact"] },
    email: { type: String, match: emailRegexp },
    phone: { type: String, match: phoneRegexp },
    favorite: { type: Boolean, default: false },
  },
  { versionKey: false, timestamps: true }
);

contactSchema.post("save", handleSaveError);

contactSchema.pre("findOneAndUpdate", setUpdateSettings);

contactSchema.post("findOneAndUpdate", handleSaveError);

const Contact = model("contact", contactSchema);

export default Contact;
