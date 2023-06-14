import passport from "passport";
//local
import local from 'passport-local';
//github
import GitHubStrategy from 'passport-github2';
import jwt from 'passport-jwt';

import userModel from '../dao/mongo/models/user.model.js';
import cartModel from '../dao/mongo/models/cart.model.js';

import { createHash, extractCookie, generateToken, isValidPassword } from '../utils.js';
import config from './config.js';
import { UserService } from "../repository/index.js";
//jwt
const JWTStrategy = jwt.Strategy;
const ExtractJWT = jwt.ExtractJwt;

//local
const LocalStrategy = local.Strategy;
const initializePassport = () => {
    passport.use('register', new LocalStrategy({
        passReqToCallback: true,
        usernameField: 'email'
    }, async (req, username, password, done) => {
        const { first_name, last_name, email, age, role } = req.body;
        try {
            const user = await userModel.findOne({ email: username })
            if (user) {
                console.log('User already exists');
                return done(null, false);
            }

            const newUser = {
                first_name,
                last_name,
                email,
                age,
                password: createHash(password),
                cart: (await cartModel.create({}))._id,
                role
            }
            if (newUser.email == 'adminCoder@coder.com' && password == 'coderAdmin') { (newUser.role = 'admin') };

            const result = await userModel.create(newUser);

            return done(null, result);

        } catch (error) {
            return done('[LOCAL] ERROR al crear user ' + error);
        }
    }));

    passport.use('login', new LocalStrategy({
        usernameField: 'email',
    }, async (username, password, done) => {
        try {
            const user = await UserService.getBy({ email: username });
            if (!user) {
                return done(null, user);
            }
            if (!isValidPassword(user, password)) {
                return done(null, false)
            };

            await UserService.updateProp(user._id, {last_conection: Date.now()});
            //genera el token del jwt
            const token = generateToken(user);
            user.token = token;
            return done(null, user);
        } catch (error) {
            return done(' [LOCAL] Error al obtener user' + error)
        }
    }))

    passport.use('github', new GitHubStrategy({
        clientID: "Iv1.3991cd4344ad90aa",
        clientSecret: "f3b507fc533c28f3b18482eb0cc00e6e7e6d147a",
        callbackURL: `${config.base_url}/session/githubcallback`,
        scope: ['user:email']
    }, async (accessToken, refreshToken, profile, done) => {

        try {
            const user = await userModel.findOne({ email: profile.emails[0].value });
            if (user) {
                const token = generateToken(user);
                user.token = token;
                return done(null, user)
            };

            const newUser = await userModel.create({
                first_name: profile._json.name,
                last_name: '',
                email: profile.emails[0].value,
                age: profile._json.age,
                password: createHash('abcd1234xyz'),
                cart: (await cartModel.create({}))._id,
                role: 'user'
            })
            const token = generateToken(newUser);

            newUser.token = token;

            return done(null, newUser);
        } catch (error) {
            return done('Error to login with GitHub: ' + error);
        }
    }))

    //jwtStrategy

    passport.use('jwt', new JWTStrategy({
        jwtFromRequest: ExtractJWT.fromExtractors([extractCookie]),
        secretOrKey: config.private_key,
    }, async (jwt_payload, done) => {
        try {
            // returna el user
            return done(null, jwt_payload);
        } catch (error) {
            return done(error);
        }
    }))

    passport.serializeUser((user, done) => {
        done(null, user._id);
    });

    passport.deserializeUser(async (id, done) => {
        const user = await userModel.findById(id);
        done(null, user);
    });
}


export default initializePassport;