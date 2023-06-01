import mongoose from "mongoose";
import User from "../../src/dao/mongo/user.mongo.js";
import Cart from "../../src/dao/mongo/cart.mongo.js";
import Assert from 'assert';
import { createHash } from "../../src/utils.js";
import { isValidPassword } from "../../src/utils.js";

mongoose.connect('mongodb://127.0.0.1:27017/db_testing_WspMarket');

const assert = Assert.strict;

describe('Testing User DAO', function(){
    before(async function(){
        this.usersDAP = new User();
        this.cartDAP = new Cart();
        this.mockUser = {
            first_name: 'Lucas',
            last_name: 'Rueda',
            email: 'test@example.com',
            age: 12,
            password: createHash('secretTest'),
            cart: (await this.cartDAP.create({products: []}))._id,
            role: 'admin'
        }
    })

    beforeEach(function(){
        mongoose.connection.collections.users.drop();
        this.timeout(5000);
    })

    it('El get debe devolver un array', async function(){
        const result = await this.usersDAP.getAll();

        assert.strictEqual(Array.isArray(result), true);
    })

    it('El dao debe de poder crear un user', async function(){
        const result = await this.usersDAP.create(this.mockUser);
        assert.ok(result._id);
    })

    it('El dao debe de poder traer el cart de un user', async function(){
        const result = await this.usersDAP.create(this.mockUser);
        const cart = await this.cartDAP.getOne(result.cart);
        assert.deepStrictEqual(cart.products, []);
    })

    it('El dao debe de poder traer un user por ID', async function(){
        const result = await this.usersDAP.create(this.mockUser);

        const user = await this.usersDAP.getOne(result._id);
        assert.strictEqual(typeof user, 'object');
    })

    it('El dao debe de poder traer un user por email', async function(){
        const result = await this.usersDAP.create(this.mockUser);

        const user = await this.usersDAP.getBy({email: this.mockUser.email});
        assert.strictEqual(typeof user, 'object');
    })

    it('El dao debe de poder cambiar la contraseña de user', async function(){
        const result = await this.usersDAP.create(this.mockUser);
        const userUpdate = await this.usersDAP.update(result._id, {password: createHash('holaMundo')});
        assert.strictEqual(isValidPassword(result, 'holaMundo'), false);
    })
})
