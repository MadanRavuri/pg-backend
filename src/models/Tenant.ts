import mongoose, { Document, Schema } from 'mongoose';

export interface ITenant extends Document {
  name: string;
  email: string;
  phone: string;
  roomId: mongoose.Types.ObjectId;
  rent: number;
  deposit: number;
  status: string;
  joinDate: Date;
  emergencyContact: {
    name: string;
    phone: string;
    relation: string;
  };
  wing: string;
  floor: number;
}

const TenantSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  roomId: { type: Schema.Types.ObjectId, ref: 'Room', required: true },
  rent: { type: Number, required: true },
  deposit: { type: Number, required: true },
  status: { type: String, required: true },
  joinDate: { type: Date, required: true },
  emergencyContact: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    relation: { type: String, required: true },
  },
  wing: { type: String, required: true },
  floor: { type: Number, required: true },
});

export const Tenant = mongoose.model<ITenant>('Tenant', TenantSchema);
