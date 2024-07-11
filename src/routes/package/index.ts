import { serializeError } from "@/lib/utils";
import Delivery from "@/models/Delivery";
import Package from "@/models/Package";
import bodyParser from "body-parser";
import { Router } from "express";
import { z } from "zod";

export default function packageRoutes(api: Router) {
    const router = Router();

    router.use(bodyParser.json())

    // Get all packages
    router.get('/', async (req, res) => {
        const paginatedResult = typeof req.query.paginate === "string" && ["true", "1", "yes"].includes(req.query.paginate.toLowerCase());

        if (paginatedResult) {
            const page = Number(req.query.page ?? 1), limit = Number(req.query.limit ?? 10);
            // calculate the items to skip
            const skip = (page - 1) * limit;
            // load total
            const total = await Package.countDocuments({});
            // load data
            const list = await Package.find({}).sort({ createdAt: 'desc' }).skip(skip).limit(limit).populate([{
                path: 'active_delivery'
            }]);

            res.json({
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
                docs: list
            });
        } else {
            // load data
            const list = await Package.find({}).sort({ createdAt: 'desc' }).populate([{
                path: 'active_delivery'
            }]);

            res.json(list);
        }
    });

    // Get package by ID
    router.get('/:id', async (req, res) => {
        try {
            const data = await Package.findById(req.params.id).populate('active_delivery');

            if (data) {
                res.status(200).json(data);
            } else {
                res.status(404).send(undefined);
            }
        } catch (error) {
            res.status(500).json(await serializeError(error));
        }
    });

    const upsertPackageSchema = z.object({
        description: z.string().min(1, "The description is required."),
        weight: z.number().positive(),
        width: z.number().positive(),
        height: z.number().positive(),
        depth: z.number().positive(),
        from_name: z.string().min(1, "The from name is required."),
        from_address: z.string().min(1, "The from address is required."),
        from_location: z.object({
            lat: z.number({ required_error: "The latitude is required." }), lng: z.number({ required_error: "The longitude is required." })
        }),
        to_name: z.string().min(1, "The recipient name is required."),
        to_address: z.string().min(1, "The recipient address is required."),
        to_location: z.object({
            lat: z.number({ required_error: "The latitude is required." }), lng: z.number({ required_error: "The longitude is required." })
        })
    })

    // Create a new package
    router.post('/', async (req, res) => {
        try {
            // validate the request body
            const payload = upsertPackageSchema.parse(req.body);

            // create the package
            const data = await Package.create(payload);

            res.status(201).json(data);
        } catch (error) {
            if ((error as any).name === 'ZodError') {
                res.status(400).json(await serializeError(error));
            } else {
                res.status(500).json(await serializeError(error));
            }
        }
    });

    // Update package
    router.put('/:id', async (req, res) => {
        try {
            const data = await Package.findById(req.params.id).populate('active_delivery');

            if (data) {
                // validate the request body
                const payload = upsertPackageSchema.parse(req.body);

                // checking the active delivery
                if (data.active_delivery && !["delivered", "failed"].includes(data.active_delivery.status)) {
                    res.status(400).json({
                        message: "You cannot update a package when it has an active delivery."
                    });
                } else {
                    // create the package
                    const updatedData = await Package.findByIdAndUpdate(data._id, {
                        $set: payload
                    });

                    // update logic
                    res.status(200).json(updatedData);
                }
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

    // Delete package
    router.delete('/:id', async (req, res) => {
        try {
            const data = await Package.findById(req.params.id);

            if (data) {
                // checking the active delivery
                if (data.active_delivery && !["delivered", "failed"].includes(data.active_delivery.status)) {
                    res.status(400).json({
                        message: "You cannot delete a package when it has an active delivery."
                    });
                } else {
                    // delete attached deliveries
                    await Delivery.deleteMany({ package: data._id })
                    // delete the given package
                    await Package.findByIdAndDelete(data._id);

                    res.status(204).send(undefined);
                }
            } else {
                res.status(204).send(undefined);
            }
        } catch (error) {
            res.status(500).json(await serializeError(error));
        }
    });

    api.use('/package', router);
}