
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
const educationLevelRoute = require('./educationlevel.route');
const regionRoute = require('./region.route');
const skillRoute = require('./skill.route');
const reportRoute = require('./report.route');
const skmRoute = require('./skm.route');
const snkRoute = require('./snk.route');
const trainingRoute = require('./training.route');
const certificationRoute = require('./certification.route');
const accountRoute = require('./account.route');

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
    app.use(urlApi, educationLevelRoute);
    app.use(urlApi, regionRoute);
    app.use(urlApi, skillRoute);
    app.use(urlApi, reportRoute);
    app.use(urlApi, skmRoute);
    app.use(urlApi, snkRoute);
    app.use(urlApi, trainingRoute);
    app.use(urlApi, certificationRoute);
    app.use(urlApi, accountRoute);
}