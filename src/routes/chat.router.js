import { Router } from 'express';
import { chat } from '../dao/controllers/message.controller.js';
import { authorization } from '../utils.js';


const router = Router();

router.get('/',authorization(['user', 'premium', 'admin']), chat);

export default router;