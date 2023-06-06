import { CartService, TicketService } from "../../repository/index.js";
import EErrors from "../../services/errors/enumErrors.js";
import { generateGetCartsErrorInfo } from "../../services/errors/info.js";
import mercadopago from "mercadopago";
import config from "../../config/config.js";

mercadopago.configure({
    access_token: `${config.mercado_pago_access_key}`
})

export const getAll = async (req, res) => {
    try {
        const carts = await CartService.getAll();
        if (!carts) {
            req.logger.error(
                CustomError.createError({
                    name: "Get carts error",
                    cause: generateGetCartsErrorInfo(),
                    message: 'Error trying to get Cart',
                    code: EErrors.CART_NOT_FOUND_ERROR
                })
            );
        }
        res.render('carts',
            {
                titlePage: 'Carts',
                style: 'cart.css',
                carts
            });
    } catch (error) {
        req.logger.error('Error: ', error);
    }
}

export const getOne = async (req, res) => {
    try {
        const cid = req.params.cid;
        const cart = await CartService.getOne(cid);
        if (!cart) {
            req.logger.error(
                CustomError.createError({
                    name: "Get carts error",
                    cause: generateGetCartsErrorInfo(),
                    message: 'Error trying to get Cart',
                    code: EErrors.CART_NOT_FOUND_ERROR
                })
            );
        }
        return res.render('carts', {
            titlePage: 'Cart',
            style: 'cart.css',
            cart
        });
    } catch (error) {
        req.logger.error('Error: ', error);
    }
}

export const create = async (req, res) => {
    try {
        const createCart = await CartService.create();
        if (!createCart) {
            req.logger.error(
                CustomError.createError({
                    name: "create carts error",
                    cause: generateGetCartsErrorInfo(),
                    message: 'Error trying to create cart',
                    code: EErrors.CREATE_CART_ERROR
                })
            );
        }
        res.send({ status: 'successful', createCart });
    } catch (error) {
        req.logger.error('Error: ', error);
    }
}

export const addProduct = async (req, res) => {
    try {
        const cid = req.params.cid;
        const pid = req.params.pid;
        const quantity = req.body?.quantity || 1;
        const user = req.user.user;
        const result = await CartService.addProduct(cid, pid, quantity, user);
        if (!result) {
            req.logger.error(
                CustomError.createError({
                    name: "create carts error",
                    cause: generateAddProductInCartErrorInfo({ cid, pid, quantity }),
                    message: 'Error trying to create cart',
                    code: EErrors.ADD_PRODUCT_IN_CART_ERROR
                })
            );
        }

        res.redirect(`/api/carts/${cid}`);
    } catch (error) {
        req.logger.error('Error: ', error);
    }

}
export const update = async (req, res) => {
    try {
        const newProducts = req.body;
        const cid = req.params.cid;
        const cart = await CartService.update(cid, newProducts);
        if (!cart) {
            req.logger.error(
                CustomError.createError({
                    name: "Get carts error",
                    cause: generateGetCartsErrorInfo(),
                    message: 'Error trying to get Cart',
                    code: EErrors.CART_NOT_FOUND_ERROR
                })
            );
        }
        res.json({ status: 'successful', cart })
    } catch (error) {
        req.logger.error('Error: ', error);
    }
}
export const updateProduct = async (req, res) => {
    try {
        const cid = req.params.cid;
        const pid = req.params.pid;
        const quantity = req.body?.quantity || 1;

        const cart = await CartService.updateProduct(cid, pid, quantity);
        if (!cart) {
            req.logger.error(
                CustomError.createError({
                    name: "Get carts error",
                    cause: generateGetCartsErrorInfo(),
                    message: 'Error trying to get Cart',
                    code: EErrors.CART_NOT_FOUND_ERROR
                })
            );
        }
        res.json({ status: 'successful', cart })
    } catch (error) {
        req.logger.error('Error: ', error);
    }

}
export const deleteCart = async (req, res) => {
    try {
        const cid = req.params.cid;
        const result = await CartService.deleteCart(cid);
        if (!result) {
            req.logger.error(
                CustomError.createError({
                    name: "create carts error",
                    cause: generateAddProductInCartErrorInfo({ cid }),
                    message: 'Error trying to create cart',
                    code: EErrors.ADD_PRODUCT_IN_CART_ERROR
                })
            );
        }
        res.json({ status: 'delete successful', result });
    } catch (error) {
        req.logger.error('Error: ', error);
    }
}
export const clearCart = async (req, res) => {
    try {
        const cid = req.params.cid;
        const cart = await CartService.clearCart(cid);
        if (!cart) {
            req.logger.error(
                CustomError.createError({
                    name: "Get carts error",
                    cause: generateGetCartsErrorInfo(),
                    message: 'Error trying to get Cart',
                    code: EErrors.CART_NOT_FOUND_ERROR
                })
            );
        }
        res.json({ status: 'successful', cart })
    } catch (error) {
        req.logger.error('Error: ', error);
    }

}
export const deleteOneProduct = async (req, res) => {
    try {
        const cid = req.params.cid;
        const pid = req.params.pid;
        const cart = await CartService.deleteOneProduct(cid, pid);
        if (!cart) {
            req.logger.error(
                CustomError.createError({
                    name: "Get carts error",
                    cause: generateGetCartsErrorInfo(),
                    message: 'Error trying to get Cart',
                    code: EErrors.CART_NOT_FOUND_ERROR
                })
            );
        }
        res.json({ status: 'successful', cart })
    } catch (error) {
        req.logger.error('Error: ', error);
    }
}

export const purchase = async (req, res) => {
        console.log("Purchasing...");
        const cid = req.params.cid;
        const user = req.user.user;
        const status = await CartService.purchase(cid);
        if (!status) {
            req.logger.error(
                CustomError.createError({
                    name: "error ticket",
                    cause: generateGetCartsErrorInfo(),
                    message: 'Error trying to get Cart',
                    code: EErrors.CART_NOT_FOUND_ERROR
                })
            );
        }
        await CartService.update(cid, status.noStock);
        if (status.totalPrice > 0) {
            const resultTicket = await TicketService.create(user.email, status.totalPrice);
            status.ticket = resultTicket;
        }
        res.redirect('/api/carts/ticket');
    
}

export const ticket = async (req, res) =>{
    try {
        const user = req.user.user;
        const tickets = await TicketService.getByEmail(user.email);
        res.render("ticket", {
            tickets: tickets,
            style: 'ticket.css'
        })
    } catch (error) {
        console.log(error);
    }
}

export const Pagar = async (req, res) => {
    try {
        if (req.body.estado != "Pagada") {
            res.cookie("id", req.body.id)
            let preference = {
                items: [
                    {
                        title: 'Coder Proyect',
                        unit_price: parseInt(req.body.total),
                        quantity: 1,
                    }
                ],
                back_urls: {
                    "success": `${config.base_url}/products`,
                    "failure": `${config.base_url}/api/carts/purchase`,
                    "pending": `${config.base_url}/session/login`
                },
                auto_return: "approved",
            };

            mercadopago.preferences.create(preference)
                .then(async function (response) {
                    res.redirect(response.body.init_point)
                }).catch(function (error) {
                    console.log(error);
                });
        } else {
            console.log("Ticket ya pagado")
            res.redirect("/api/carts/purchase")
        }
    } catch (error) {
        res.send("Error en la aplicacion")
    }
}

export const approved = async (req, res) => {
    try {
        const id = req.cookies.id;
        await CartService.updateTik(id, { status: "Pagada" })
        res.clearCookie("id")
        res.redirect("/api/carts/purchase")
    } catch (error) {
        res.send("Error en la aplicacion")
    }
};

  //TARJETAS DE PRUEBA
  //MASTERCARD ---- 5031 7557 3453 0604 ---- 123 ---- 11/25
  //VISA ---- 4509 9535 6623 3704 ---- 123 ---- 11/25
  //AMERICAN EXPRESS ---- 3711 803032 57522 ---- 1234 ---- 11/25