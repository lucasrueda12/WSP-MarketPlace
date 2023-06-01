import { Router } from 'express';
//import ProductManager from '../manager/ProdMger.js';
import prodModel from '../dao/mongo/models/products.model.js';

const router = Router();
//const productManager = new ProductManager('products.json');

router.get('/', async (req, res) => {
    try {
        const products = await prodModel.find().lean().exec();
        req.io.on('connection', socket => {
            socket.on('updateProducts', async data => {
                const productAdded = await prodModel.create(data);
                socket.emit('realtimeProducts', await prodModel.find().lean().exec());
            })

            socket.on('deleteProducts', async data => {
                const productdel = await prodModel.findByIdAndDelete(data.id);
                socket.emit('realtimeProducts', await prodModel.find().lean().exec());
            })
        })

        res.render('realTimeProducts', {
            style: 'realTimeProducts.css',
            data: products
        })
    } catch (error) {
        console.log("Error: ", error);
    }
})

export default router;
