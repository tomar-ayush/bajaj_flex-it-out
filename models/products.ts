import mongoose, { Document } from 'mongoose';

export interface IProduct extends Document {
  name?: string;
  image?: string;
  description: string;
  price: number;
}

const productSchema = new mongoose.Schema<IProduct>({
  name: String,
  image: String,
  description: String,
  price: {
    type: Number,
    default: 0,
  },
}, {
  collection: "bajaj_products", // Custom collection name
  timestamps: true
});

export const Product = mongoose.models.Product || mongoose.model<IProduct>('Product', productSchema);
