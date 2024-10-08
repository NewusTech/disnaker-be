
const artikelRoute = require('./artikel.route');
const kategoriartikelRoute = require('./kategoriartikel.route');
const userRoute = require('./user.route');
const roleRoute = require('./role.route');
const permissionRoute = require('./permission.route');
const vacancyRoute = require('./vacancy.route');
const applicationRoute  = require('./application.route');
const userprofileRoute = require('./userprofile.route');
const uservacancyRoute = require('./uservacancy.route');
const userapplcationRoute = require('./userapplication.route');
const usereducationRoute = require('./usereducation.route');
const userorganizationRoute = require('./userorganization.route');
const userexperienceRoute = require('./userexperience.route');
const usercertificateRoute = require('./usercertificate.route');
const userskillRoute = require('./userskill.route');
const userlinkRoute = require('./userlink.route');

module.exports = function (app, urlApi) {
    app.use(urlApi, artikelRoute);
    app.use(urlApi, kategoriartikelRoute);
    app.use(urlApi, userRoute);
    app.use(urlApi, roleRoute);
    app.use(urlApi, permissionRoute);
    app.use(urlApi, vacancyRoute);
    app.use(urlApi, applicationRoute);
    app.use(urlApi, userprofileRoute);
    app.use(urlApi, uservacancyRoute);
    app.use(urlApi, userapplcationRoute);
    app.use(urlApi, usereducationRoute);
    app.use(urlApi, userorganizationRoute);
    app.use(urlApi, userexperienceRoute);
    app.use(urlApi, usercertificateRoute);
    app.use(urlApi, userskillRoute);
    app.use(urlApi, userlinkRoute);
}