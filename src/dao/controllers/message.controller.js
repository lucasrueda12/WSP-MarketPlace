import { MessageService } from "../../repository/index.js";

export const chat = async(req,res)=>{
    const user = req.user.user;
    const messages = await MessageService.getAll();

    req.io.on('connection', socket => {
        req.logger.info('new cliente connected');
    
        socket.on('messagein', async data => {
            data.user = user.first_name;
            data.email = user.email;
            const messageGenerated = await MessageService.create(data);
            req.logger.info(messageGenerated);
    
            messages.push(data)
            req.io.emit('messageout', messages)
        })
    })

    res.render('chat', {
        user: user,
        style: 'chat.css'
    })
} 