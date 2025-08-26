import mongoose, { Document, Schema } from 'mongoose';

export interface IRoom extends Document {
  roomNumber: string;
  floor: number;
  wing: string;
  type: string;
  rent: number;
  status: string;
  amenities: string[];
  description?: string;
  tenantId?: mongoose.Types.ObjectId;
}

const RoomSchema: Schema = new Schema({
  roomNumber: { type: String, required: true },
  floor: { type: Number, required: true },
  wing: { type: String, required: true },
  type: { type: String, required: true },
  rent: { type: Number, required: true },
  status: { type: String, required: true },
  amenities: [{ type: String }],
  description: { type: String },
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant' },
});

export const Room = mongoose.model<IRoom>('Room', RoomSchema);
