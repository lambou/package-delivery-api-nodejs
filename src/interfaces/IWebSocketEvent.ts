import { IDelivery } from "@/models/Delivery";

type IWebSocketEvent = { event: "location_changed", delivery_id: string; location: { lat: string; lng: string } } | {
    event: "status_changed"; delivery_id: string; status: "open" | "picked-up" | "in-transit" |
    "delivered" | "failed"
} | {
    event: "delivery_updated",
    delivery_object: IDelivery
};

export default IWebSocketEvent;