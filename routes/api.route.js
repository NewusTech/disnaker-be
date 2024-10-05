
const artikelRoute = require('./artikel.route');
const kategoriartikelRoute = require('./kategoriartikel.route');
const userRoute = require('./user.route');
const roleRoute = require('./role.route');
const permissionRoute = require('./permission.route');
const vacancyRoute = require('./vacancy.route');

module.exports = function (app, urlApi) {
    app.use(urlApi, artikelRoute);
    app.use(urlApi, kategoriartikelRoute);
    app.use(urlApi, userRoute);
    app.use(urlApi, roleRoute);
    app.use(urlApi, permissionRoute);
    app.use(urlApi, vacancyRoute);
}