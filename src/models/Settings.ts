import mongoose, { Document, Schema } from 'mongoose';

export interface ISettings extends Document {
  pgName: string;
  address: string;
  contactNumber: string;
  email: string;
  gstNumber: string;
  bankDetails: {
    accountNumber: string;
    ifscCode: string;
    bankName: string;
    accountHolderName: string;
  };
  rentDueDate: number;
  lateFeePercentage: number;
  maintenanceFee: number;
  amenities: string[];
  policies: string[];
  theme: {
    primaryColor: string;
    secondaryColor: string;
  };
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
}

const SettingsSchema: Schema = new Schema({
  pgName: { type: String, required: true },
  address: { type: String, required: true },
  contactNumber: { type: String, required: true },
  email: { type: String, required: true },
  gstNumber: { type: String, required: true },
  bankDetails: {
    accountNumber: { type: String, required: true },
    ifscCode: { type: String, required: true },
    bankName: { type: String, required: true },
    accountHolderName: { type: String, required: true },
  },
  rentDueDate: { type: Number, required: true },
  lateFeePercentage: { type: Number, required: true },
  maintenanceFee: { type: Number, required: true },
  amenities: [{ type: String }],
  policies: [{ type: String }],
  theme: {
    primaryColor: { type: String, required: true },
    secondaryColor: { type: String, required: true },
  },
  notifications: {
    email: { type: Boolean, required: true },
    sms: { type: Boolean, required: true },
    push: { type: Boolean, required: true },
  },
});

export const Settings = mongoose.model<ISettings>('Settings', SettingsSchema);
