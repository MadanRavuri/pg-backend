import mongoose, { Document, Schema } from 'mongoose';

export interface IRentPayment extends Document {
  tenantId: mongoose.Types.ObjectId;
  roomId: mongoose.Types.ObjectId;
  month: string;
  year: number;
  monthName: string;
  amount: number;
  paidAmount?: number;
  dueDate: Date;
  paidDate?: Date;
  status: string;
  paymentMethod?: string;
  transactionId?: string;
  notes?: string;
  lateFee?: number;
  wing: string;
}

const RentPaymentSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
  roomId: { type: Schema.Types.ObjectId, ref: 'Room', required: true },
  month: { type: String, required: true },
  year: { type: Number, required: true },
  monthName: { type: String, required: true },
  amount: { type: Number, required: true },
  paidAmount: { type: Number, default: 0 },
  dueDate: { type: Date, required: true },
  paidDate: { type: Date },
  status: { type: String, required: true },
  paymentMethod: { type: String },
  transactionId: { type: String },
  notes: { type: String },
  lateFee: { type: Number },
  wing: { type: String, required: true },
});

export const RentPayment = mongoose.model<IRentPayment>('RentPayment', RentPaymentSchema);
