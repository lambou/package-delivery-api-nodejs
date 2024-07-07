import bodyParser from "body-parser";
import express from "express"
import packageRoutes from "./routes/package";
import { connect } from "mongoose";

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

    app.listen(process.env.PORT, () => {
        console.log(`%cThe app is listening to the port ${process.env.PORT}`, 'color:blue;')
    });
}

main().catch(err => console.log(err));