import UserDTO from "../dao/DTO/user.dto.js"
import { transport } from "../utils.js";
import __dirname from "../utils.js";
export default class UserRepository {
    constructor(dao) {
        this.dao = dao
    }

    getAll = async () => {
        try {
            return await this.dao.getAll();
        } catch (error) {
            console.log('Error in getting service: ' + error);
        }
    }

    getOne = async (id) => {
        try {
            return await this.dao.getOne(id);
        } catch (error) {
            console.log('User not found');
        }
    }

    getBy = async (prop) => {
        try {
            return await this.dao.getBy(prop);
        } catch (error) {
            console.log('User not found');
        }
    }

    create = async (user) => {
        try {
            const userToInsert = new UserDTO(user);
            const result = await this.dao.create(userToInsert);
            return result;
        } catch (error) {
            console.log('Error to create service: ' + error);
        }
    }

    update = async (id, newUser) => {
        try {
            const userToInsert = new UserDTO(newUser);
            const result = await this.dao.update(id, userToInsert);
            return result;
        } catch (error) {
            console.log('Error in update service: ' + error);
        }
    }

    updateProp = async (id, prop) => {
        try {
            const result = await this.dao.update(id, prop);
            return result;
        } catch (error) {
            console.log('Error in update service: ' + error);
        }
    }

    addDocs = async (id, docName, path) => {
        try {
            const user = await this.dao.getOne(id);
            const idx = user.documents.findIndex(doc => doc.name == docName);
            if (idx != -1) {
                return this.dao.updateDoc(id, idx, docName, path);
            } else {
                return await this.dao.addDoc(id, docName, path);
            }
        } catch (error) {
            console.log(error);
        }
    }

    deleteUser = async (id) =>{
        try {
            return this.dao.delete(id);
        } catch (error) {
            console.log(error);
        }
    }

    deleteInactives = async () => {
        try {
            const getDiff = date => {
                const today = new Date()
                const diff = today.getTime() - date.getTime() // Diferencia en milisegundos
                return diff / (1000 * 60 * 60 * 24) // Convierte milisegundos en días
            }
            const users = await this.getAll();
            const toDelete = users.filter(u => getDiff(u.last_conection) > 2 );
            for (let i = 0; i < toDelete.length; i++) {
                await this.sendMail(toDelete[i]);
                await this.dao.delete(toDelete[i]._id);
            }
            return toDelete;
        } catch (error) {
            console.log(error);
        }
    }

    sendMail = async (user) => {
        const result = await transport.sendMail({
            from: 'lucasrueda64@gmail.com',
            to: user.email,
            subject: 'your account has been deleted',
            html: `
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f7f9fa;padding:24px" >
            <tbody>
                <tr>
                    <td></td>
                    <td width="600">
                        <table width="100%" cellspacing="0" style="padding:30px;background-color:#202c33;background-image: url('cid:bg.png'); background-size: fill;border:1px solid #cccccc">
                            <tbody style="background:#111b21;color:#fff;display:inline-block;min-width:80px;border-top:14px solid #009879;border-bottom:14px solid #009879;border-left:12px solid #009879;border-right:12px solid #009879">
                                <tr>
                                    <td style="border-bottom:1px solid #cccccc;background-color: #009879">
                                        <p style="display: inline-block; border-radius: 5px;">
                                            <a style="text-decoration:none;color:#202c33;font-size: 28px">Wsp Marketplace  <img style="display:inline;max-height:28px;width:auto" src="cid:wsp.ico" alt=""></a>
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding:24px 24px 0 24px">
                                        <p>
                                            <a style="text-decoration:none;color:#cccccc">Hi ${user.first_name}</a>
                                        </p>
                                        <p>
                                            <a style="text-decoration:none;color:#cccccc"> Lo sentimos mucho pero borramos tu cuenta por inactividad</a>
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding:24px 24px 0 24px">
                                        <p style="margin-bottom:0">
                                            <a style="text-decoration:none;color:#cccccc">if you need help,</a> <a target="_blank">please contact the support service.</a>
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding:48px 24px 0 24px">
                                        <p
                                            style="font-family:'SF Pro Text',-apple-system,BlinkMacSystemFont,Roboto,'Segoe UI',Helvetica,Arial,sans-serif,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol';font-size:12px;font-weight:400;line-height:1.4;color:#6a6f73;margin:0">
                                            Wsp marketplace <a
                                                href="https://www.google.com/maps/search/600+Harrison+Street?entry=gmail&amp;source=g">600
                                                Harrison Street</a> , 3rd Floor, San Francisco, CA 94107. </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="border-bottom:1px solid #cccccc; padding:24px 0 0 0"></td>
                                </tr>
                            </tbody>
                        </table>
                    </td>
                    <td></td>
                </tr>
            </tbody>
        </table>
            `,
            attachments: [
                {
                    filename: 'whatsapp.ico',
                    path: __dirname + '/public/img/whatsapp.ico',
                    cid: 'wsp.ico'
                },
                {
                    filename: 'bg-chat.png',
                    path: __dirname + '/public/img/bg-chat.png',
                    cid: 'bg.png'
                }
            ]
        })
        return result;
    }

    sendMailDeleteProduct = async (user, prod) => {
        const result = await transport.sendMail({
            from: 'lucasrueda64@gmail.com',
            to: user.email,
            subject: 'your account has been deleted',
            html: `
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f7f9fa;padding:24px" >
            <tbody>
                <tr>
                    <td></td>
                    <td width="600">
                        <table width="100%" cellspacing="0" style="padding:30px;background-color:#202c33;background-image: url('cid:bg.png'); background-size: fill;border:1px solid #cccccc">
                            <tbody style="background:#111b21;color:#fff;display:inline-block;min-width:80px;border-top:14px solid #009879;border-bottom:14px solid #009879;border-left:12px solid #009879;border-right:12px solid #009879">
                                <tr>
                                    <td style="border-bottom:1px solid #cccccc;background-color: #009879">
                                        <p style="display: inline-block; border-radius: 5px;">
                                            <a style="text-decoration:none;color:#202c33;font-size: 28px">Wsp Marketplace  <img style="display:inline;max-height:28px;width:auto" src="cid:wsp.ico" alt=""></a>
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding:24px 24px 0 24px">
                                        <p>
                                            <a style="text-decoration:none;color:#cccccc">Hi ${user.first_name}</a>
                                        </p>
                                        <p>
                                            <a style="text-decoration:none;color:#cccccc">Borramos tu producto nombre:${prod.title}-id:${prod._id}</a>
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding:24px 24px 0 24px">
                                        <p style="margin-bottom:0">
                                            <a style="text-decoration:none;color:#cccccc">if you need help,</a> <a target="_blank">please contact the support service.</a>
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding:48px 24px 0 24px">
                                        <p
                                            style="font-family:'SF Pro Text',-apple-system,BlinkMacSystemFont,Roboto,'Segoe UI',Helvetica,Arial,sans-serif,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol';font-size:12px;font-weight:400;line-height:1.4;color:#6a6f73;margin:0">
                                            Wsp marketplace <a
                                                href="https://www.google.com/maps/search/600+Harrison+Street?entry=gmail&amp;source=g">600
                                                Harrison Street</a> , 3rd Floor, San Francisco, CA 94107. </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="border-bottom:1px solid #cccccc; padding:24px 0 0 0"></td>
                                </tr>
                            </tbody>
                        </table>
                    </td>
                    <td></td>
                </tr>
            </tbody>
        </table>
            `,
            attachments: [
                {
                    filename: 'whatsapp.ico',
                    path: __dirname + '/public/img/whatsapp.ico',
                    cid: 'wsp.ico'
                },
                {
                    filename: 'bg-chat.png',
                    path: __dirname + '/public/img/bg-chat.png',
                    cid: 'bg.png'
                }
            ]
        })
        return result;
    }
}