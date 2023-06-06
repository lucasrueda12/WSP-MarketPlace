import { Router } from 'express';
import { passportCall, authorization, generateToken} from '../utils.js';
import { UserService }  from '../repository/index.js'
import __dirname from '../utils.js';
import { upload } from '../config/multer.js';
import config from '../config/config.js';

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
    const user = req.user.user;
    let noHasDocs = true;
    if(user.documents.includes('identificacion') && user.documents.includes('comprobante de domicilio') && user.documents.includes('comprobante de estado de cuenta')){
        noHasDocs = !noHasDocs;
    }
    res.render('switchRole', {
        noHasDocumentation: noHasDocs,
        roleUser: user.role == 'user' || "",
        user: user,
        id: id,
    })
})

router.post('/premium/:uid', passportCall('jwt'), authorization(['user', 'premium']), async (req, res) =>{
    const id = req.params.uid;
    const user = await UserService.getOne(id);
    if(!user) res.send(404);
    if (user.role == 'admin')  res.redirect('/api/users/profile');
    if(user.role == 'premium' || (user.documents.includes('identificacion') && user.documents.includes('comprobante de domicilio') && user.documents.includes('comprobante de estado de cuenta'))){
        user.role = (user.role == 'user' ? 'premium' : 'user');
        const newUser = await UserService.update(id, user);
        res.clearCookie(config.jwt_cookie_name);
        user.token = generateToken(user);
        req.user = user;
        res.cookie(config.jwt_cookie_name, req.user.token).redirect('/api/users/profile');
    }
    res.redirect(`/api/users/premium/${id}`);
})

router.get('/profile', passportCall('jwt'), authorization(['user', 'premium']), (req, res)=>{
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


router.post('/:uid/documents', upload, passportCall('jwt'), async (req, res) =>{
    const user = req.user.user;
    console.log(user);
    if(!req.files) return res.redirect(`/api/users/premium/${req.params.uid}`)
    let hasDocuments = 0;
    user.documents.forEach(element => {
        
    });
    if(hasDocuments){
        user.role = (user.role == 'user' ? 'premium' : 'user');
        const newUser = await UserService.update(id, user);
        res.clearCookie(config.jwt_cookie_name);
        user.token = generateToken(user);
        req.user = user;
        res.cookie(config.jwt_cookie_name, req.user.token).redirect('/api/users/profile');
    }
    res.json({status: 'success', payload: 'congrats file upload' });
});

export default router;