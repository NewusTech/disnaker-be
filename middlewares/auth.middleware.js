const baseConfig = require('../config/base.config');
const { response } = require('../helpers/response.formatter');
const { Token } = require('../models');
const { User, Permission, Role } = require('../models');
const jwt = require('jsonwebtoken');

const checkRolesAndLogout = (allowedRoles) => async (req, res, next) => {
    let token;
    try {
        token = req.headers.authorization.split(' ')[1];
    } catch (err) {
        res.status(403).json(response(403, 'Unauthorized: invalid or missing token'));
        return;
    }

    if (!token) {
        res.status(403).json(response(403, 'Unauthorized: token not found'));
        return;
    }

    jwt.verify(token, baseConfig.auth_secret, async (err, decoded) => {
        if (err) {
            res.status(403).json(response(403, 'Unauthorized: token expired or invalid'));
            return;
        }

        auth = decoded;

        const tokenCheck = await Token.findOne({ where: { token } });

        if (tokenCheck) {
            res.status(403).json(response(403, 'Unauthorized: already logged out'));
            return;
        }

        if (allowedRoles.includes(auth.role)) {
            next();
        } else {
            res.status(403).json(response(403, 'Forbidden: insufficient access rights'));
        }
    });
};
const checkWithPermissions = (allowedPermission) => async (req, res, next) => {
    let token;
    try {
        token = req.headers.authorization.split(' ')[1];
    } catch (err) {
        res.status(403).json(response(403, 'Unauthorized: invalid or missing token'));
        return;
    }

    if (!token) {
        res.status(403).json(response(403, 'Unauthorized: token not found'));
        return;
    }

    jwt.verify(token, baseConfig.auth_secret, async (err, decoded) => {
        if (err) {
            res.status(403).json(response(403, 'Unauthorized: token expired or invalid'));
            return;
        }

        auth = decoded;

        if (auth.userId === 1 || auth.role === 'Super Admin') {
            return next(); //  Super Admin can access all routes
        }

        const userPermission = await User.findOne({
            where: { id: decoded.userId },
            attributes: ['id'],
            include: {
                model: Role,
                include: { model: Permission },
                attributes: ['id', 'name'],
            }
        });


        if (!userPermission) {
            res.status(403).json(response(403, 'Unauthorized: user not found'));
            return;
        }

        const permissions = userPermission.Role.Permissions.map(permission => permission.name);

        const hasPermissions = allowedPermission.some(permission => permissions.includes(permission))
        if (!hasPermissions) {
            res.status(403).json(response(403, 'Forbidden: insufficient access rights'));
        }
        next();
    });
};

const checkRoles = () => async (req, res, next) => {
    let token;
    try {
        token = req.headers.authorization.split(' ')[1];
    } catch (err) {
        res.status(403).json(response(403, 'Unauthorized: invalid or missing token'));
        return;
    }

    jwt.verify(token, baseConfig.auth_secret, async (err, decoded) => {
        auth = decoded;
        next();
    });
};

module.exports = {
    checkRolesAndLogout, checkRoles, checkWithPermissions
};
