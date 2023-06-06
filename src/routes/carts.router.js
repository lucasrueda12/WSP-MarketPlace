import { Router } from 'express';
import { addProduct, clearCart, create, deleteCart, deleteOneProduct, getAll, getOne, update, updateProduct, purchase, ticket, Pagar } from '../dao/controllers/cart.controller.js';
import { authorization, passportCall } from '../utils.js';

const router = Router();

router.get('/', authorization('admin'), getAll);

router.post('/pagar', passportCall('jwt'), authorization(['user', 'premium']), Pagar)

router.get('/ticket', passportCall('jwt'), authorization(['user', 'premium']), ticket)

router.get('/:cid', authorization(['user', 'premium']), getOne);

router.post('/', authorization('user'), create);

router.post('/:cid/products/:pid', authorization('user'), addProduct);

router.put('/:cid', authorization('user'), update);

router.put('/:cid/products/:pid', authorization('user'), updateProduct);

router.delete('/:cid', authorization('admin'), deleteCart)

router.delete('/:cid', authorization('user'), clearCart);

router.delete('/:cid/products/:pid', authorization('user'), deleteOneProduct)

router.post('/:cid/purchase',authorization('user'), purchase);



export default router;