import { Document, model, Schema } from "mongoose";
import { IDelivery } from "./Delivery";

export interface IPackage extends Document {
    active_delivery?: IDelivery,
    description: string;
    weight: number;
    height: number;
    width: number;
    depth: number;
    from_name: string;
    from_address: string;
    from_location: {
        lat: string;
        lng: string;
    };
    to_name: string;
    to_address: string;
    to_location: {
        lat: string;
        lng: string;
    };
}

const packageSchema = new Schema<IPackage>({
    active_delivery: {
        type: Schema.Types.ObjectId,
        ref: 'Delivery',
    },
    description: {
        type: Schema.Types.String
    },
    weight: {
        type: Schema.Types.Number
    },
    width: {
        type: Schema.Types.Number
    },
    height: {
        type: Schema.Types.Number
    },
    depth: {
        type: Schema.Types.Number
    },
    from_name: {
        type: Schema.Types.String
    },
    from_address: {
        type: Schema.Types.String
    },
    from_location: {
        type: Schema.Types.Mixed
    },
    to_name: {
        type: Schema.Types.String
    },
    to_address: {
        type: Schema.Types.String
    },
    to_location: {
        type: Schema.Types.Mixed
    }
}, {
    timestamps: true
})

const Package = model('Package', packageSchema, 'packages');

export default Package;