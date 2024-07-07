import { Router } from "express"
import Delivery from "@/models/Delivery";
import { z } from "zod";
import { serializeError } from "@/lib/utils";
import Package from "@/models/Package";

export default function deliveryRoutes(api: Router) {
    const router = Router();

    // Get all deliveries
    router.get('/', async (req, res) => {
        const page = Number(req.query.page ?? 1), limit = Number(req.query.limit ?? 10);
        // calculate the items to skip
        const skip = (page - 1) * limit;
        // load total
        const total = await Delivery.countDocuments({});
        // load data
        const list = await Delivery.find({}).skip(skip).limit(limit).populate([{
            path: 'package'
        }]);

        res.json({
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
            docs: list
        });
    });

    // Get delivery by ID
    router.get('/:id', async (req, res) => {
        const data = await Delivery.findById(req.params.id).populate('package');

        if (data) {
            res.status(200).json(data);
        } else {
            res.status(404).send(undefined);
        }
    });

    const upsertDeliverySchema = z.object({
        package_id: z.string({ required_error: "The package is required." })
    })

    // Create a new delivery
    router.post('/', async (req, res) => {
        try {
            // validate the request body
            const payload = upsertDeliverySchema.parse(req.body);

            // load the package*
            const _package = await Package.findById(payload.package_id).populate('active_delivery');

            if (_package) {
                // checking the active delivery
                if (_package.active_delivery && !["delivered", "failed"].includes(_package.active_delivery.status)) {
                    res.status(400).json({
                        message: "There is already an active delivery for this package."
                    });
                } else {
                    // create the delivery
                    const data = await Delivery.create({
                        ...payload,
                        location: _package.from_location,
                        status: "open"
                    });

                    res.status(201).json(data);
                }
            } else {
                res.status(400).json({
                    message: "The given package does not exists."
                })
            }
        } catch (error) {
            if ((error as any).name === 'ZodError') {
                res.status(400).json(await serializeError(error));
            } else {
                res.status(500).json(await serializeError(error));
            }
        }
    });

    // Update delivery
    router.put('/:id', async (req, res) => {
        try {
            const data = await Delivery.findById(req.params.id).populate('package').exec();

            if (data) {
                // validate the request body
                const payload = upsertDeliverySchema.parse(req.body);

                // create the delivery
                const updatedData = await Delivery.findByIdAndUpdate(data._id, {
                    $set: payload
                });

                // update logic
                res.status(200).json(updatedData);
            } else {
                res.status(404).send(undefined);
            }
        } catch (error) {
            if ((error as any).name === 'ZodError') {
                res.status(400).json(await serializeError(error));
            } else {
                res.status(500).json(await serializeError(error));
            }
        }
    });

    // Delete delivery
    router.delete('/:id', async (req, res) => {
        try {

            // delete the given delivery
            await Delivery.findByIdAndDelete(req.params.id);

            res.status(204).send(undefined);
        } catch (error) {
            res.status(500).json(await serializeError(error));
        }
    });

    api.use('/delivery', router);
}