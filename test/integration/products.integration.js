import chai from "chai";
import supertest from "supertest";
import config from "../../src/config/config";
import { response } from "express";

const expect = chai.expect
const requester = supertest('http://127.0.0.1:8080')

describe('Pizzas', () => {
    describe('Create Piiza', () => {
        before(async function () {
            const newUser = {
                email: 'john@example.com',
                password: createHash('hola')
            }
            this.token = jwt.sign(newUser,
                config.private_key,
                {
                    expiresIn: '1h'
                });
            response.cookie(config.jwt_cookie_name, this.token)
        })
        it('The endpoint POST /api/pizza must to create a piiza', async () => {
            const product = {
                title: "hola",
                description: "mundo",
                price: 22,
                stock: 22,
                category: 'mundo',
                thumbnails: [],
            }
            const response = await requester.post('/products').send(product);
            const { status, ok, _body } = response

            expect(_body.productAdded).to.have.property('_id')
        })

    })
})