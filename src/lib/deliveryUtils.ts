import IWebSocketEvent from "@/interfaces/IWebSocketEvent";
import Delivery from "@/models/Delivery";

export async function updateDeliveryStatusFromEvent(msg: IWebSocketEvent) {
    switch (msg.event) {
        case "status_changed":
            return await (async () => {
                switch (msg.status) {
                    case "open":
                        return null;

                    case "picked-up":
                        return await Delivery.findByIdAndUpdate(msg.delivery_id, {
                            $set: {
                                status: msg.status,
                                pickup_time: new Date()
                            }
                        });

                    case "in-transit":
                        return await Delivery.findByIdAndUpdate(msg.delivery_id, {
                            $set: {
                                status: msg.status,
                                start_time: new Date()
                            }
                        });

                    case "delivered":
                    case "failed":
                        return await Delivery.findByIdAndUpdate(msg.delivery_id, {
                            $set: {
                                status: msg.status,
                                end_time: new Date()
                            }
                        });
                }
            })();

        case "location_changed":
            return await Delivery.findByIdAndUpdate(msg.delivery_id, {
                $set: {
                    location: msg.location
                }
            });
    }
}