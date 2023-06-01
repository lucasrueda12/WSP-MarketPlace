import { Router } from 'express';
import { passportCall, authorization} from '../utils.js';
import { UserService }  from '../repository/index.js'
import __dirname from '../utils.js';
import { upload } from '../config/multer.js';

const router = Router();

router.get('/', passportCall('jwt'), authorization('admin'), async (req,res) =>{
    const users = await UserService.getAll();
    const mainData = users.map(u => { 
        const data ={
            id: u._id,
            name: u.first_name,
            email: u.email,
            role: u.role
        }
        return data;
    })
    res.render('users',{
        style: 'home.css',
        data: mainData
    });
})

router.delete('/', async (req, res) =>{
    const result = await UserService.deleteInactives();
    res.json({status: 'successfull', payload: 'users inactives deleteds', deletes: result});
})

router.post('/delete/:uid', async (req, res) =>{
    const id = req.params.uid;
    const result = await UserService.deleteUser(id);
    res.redirect('/api/users/');
})

router.post('/change/:uid', async (req, res) =>{
    const id = req.params.uid;
    const user = await UserService.getOne(id);
    if(!user) res.send(404);
    if (user.role == 'admin')  res.redirect('/api/users/');
    user.role = (user.role == 'user' ? 'premium' : 'user');
    const newUser = await UserService.update(id, user);
    res.redirect('/api/users/');
})

router.get('/premium/:uid', passportCall('jwt'), authorization(['user', 'premium']), (req, res) =>{
    const id = req.params.uid;
    res.render('switchRole', {
        user: req.user.user,
        id: id,
    })
})

router.post('/premium/:uid', passportCall('jwt'), authorization(['user', 'premium']), async (req, res) =>{
    const id = req.params.uid;
    const user = await UserService.getOne(id);
    if(!user) res.send(404);
    if (user.role == 'admin')  res.redirect('/api/users/profile');
    user.role = (user.role == 'user' ? 'premium' : 'user');
    const newUser = await UserService.update(id, user);
    res.redirect('/api/users/profile');
})

router.get('/profile', passportCall('jwt'), authorization('user'), (req, res)=>{
    res.render('profile', {
        user: req.user.user
    })
})

router.get('/private', passportCall('jwt'), authorization('user'), (req, res)=>{
    res.send({status: 'success', payload: req.user, role: 'user'});
});

router.get('/secret', passportCall('jwt'), authorization('admin'), (req, res)=>{
    res.send({status: 'success', payload: req.user, role: 'ADMIN'});
});

router.post('/:uid/documents', upload, (req, res) =>{
    if(!req.file) return res.json({status: 'failed', payload: 'file not upload to server'})
    res.json({status: 'success', payload: 'congrats file upload' });
});

export default router;