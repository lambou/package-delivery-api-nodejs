import bodyParser from "body-parser";
import express from "express";
import { connect } from "mongoose";
import { WebSocket } from "ws";
import IWebSocketEvent from "./interfaces/IWebSocketEvent";
import { updateDeliveryStatusFromEvent } from "./lib/deliveryUtils";
import packageRoutes from "./routes/package";

const app = express();

// api router
const api = express.Router();

// routes injection
packageRoutes(api);

// attach api
app.use('/api', api);

// setup the public folder
app.use(express.static('public'))

// parsing json body
app.use(bodyParser.json({ type: 'application/*+json' }))

app.get('/', (req, res) => {
    res.send('This is an api');
})

async function main() {
    // connect to the mongo database
    await connect(process.env.DATABASE_URL!);

    // initiate the app server
    const appServer = app.listen(process.env.PORT, () => {
        console.log(`%cThe app is listening to the port ${process.env.PORT}`, 'color:blue;')
    });

    // create a websocket server
    const wsServer = new WebSocket.Server({
        noServer: true
    })

    wsServer.on("connection", function (ws) {
        ws.on("message", async function (msg: IWebSocketEvent) {
            // update the delivery according to the event type
            const delivery = await updateDeliveryStatusFromEvent(msg);

            // a change has been made
            if (delivery) {
                wsServer.clients.forEach(function each(client) {
                    // check if client is ready
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({
                            event: "delivery_updated",
                            delivery_object: delivery.toJSON()
                        } as IWebSocketEvent));
                    }
                })
            }
        });
    })

    appServer.on('upgrade', async function upgrade(request, socket, head) {
        //emit connection when request accepted
        wsServer.handleUpgrade(request, socket, head, function done(ws) {
            wsServer.emit('connection', ws, request);
        });
    });
}

main().catch(err => console.log(err));