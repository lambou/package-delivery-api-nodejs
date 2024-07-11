import { Document, model, Schema } from "mongoose";
import { IPackage } from "./Package";

export interface IDelivery extends Document {
    package: IPackage;
    pickup_time?: Date;
    start_time?: Date;
    end_time?: Date;
    location?: {
        lat: string;
        lng: string;
    },
    status: "open" | "picked-up" | "in-transit" |
    "delivered" | "failed"
}

const deliverySchema = new Schema<IDelivery>({
    package: {
        type: Schema.Types.ObjectId,
        ref: 'Package'
    },
    pickup_time: {
        type: Schema.Types.Date
    },
    start_time: {
        type: Schema.Types.Date
    },
    end_time: {
        type: Schema.Types.Date
    },
    location: {
        type: Schema.Types.Mixed,
    },
    status: {
        type: Schema.Types.String,
        enum: ["open", "picked-up", "in-transit",
            "delivered", "failed"],
        default: "open"
    }
}, {
    timestamps: true
});

const Delivery = model('Delivery', deliverySchema, 'deliveries');

export default Delivery;