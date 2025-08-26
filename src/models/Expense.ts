import mongoose, { Document, Schema } from 'mongoose';

export interface IExpense extends Document {
  category: string;
  subcategory: string;
  description: string;
  amount: number;
  date: Date;
  paymentMethod: string;
  vendor: string;
  status: string;
  wing: string;
}

const ExpenseSchema: Schema = new Schema({
  category: { type: String, required: true },
  subcategory: { type: String, required: true },
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: Date, required: true },
  paymentMethod: { type: String, required: true },
  vendor: { type: String, required: true },
  status: { type: String, enum: ['paid', 'pending', 'approved'], required: true },
  wing: { type: String, required: true },
});

export const Expense = mongoose.model<IExpense>('Expense', ExpenseSchema);
