const { response } = require('../helpers/response.formatter');

const { Artikel, Event, Training, User, Company, UserProfile, Role, UserEducationHistory, EducationLevel } = require('../models');
const { Sequelize } = require('sequelize');
const Validator = require("fastest-validator");
const moment = require('moment-timezone');
const v = new Validator();
const { Op, where } = require('sequelize');
const { generatePagination } = require('../pagination/pagination');
const logger = require('../errorHandler/logger');
const { updateImageProfile } = require('./userprofile.controller');
const { id } = require('date-fns/locale');


module.exports = {
  getDashboard: async (req, res) => {
    try {

      let whereCondition = {};

      [articleCount, eventCount, trainingCount] = await Promise.all([
        Artikel.count({ where: whereCondition }),
        Event.count({ where: whereCondition }),
        Training.count({ where: whereCondition }),
      ]);

      res.status(200).json(response(200, 'success get dashboard', {
        articleCount,
        eventCount,
        trainingCount
      }));
    } catch (err) {
      logger.error(`Error : ${err}`);
      logger.error(`Error message: ${err.message}`);
      res.status(500).json(response(500, 'internal server error', err));
      console.log(err);
    }
  },

  getDashboardDisnaker: async (req, res) => {
    try {
      let { startDate, endDate, dayNow, monthNow, yearNow } = req.query;

      let whereCondition = {};

      if (startDate && endDate) {
        whereCondition.createdAt = { [Op.between]: [moment(startDate).startOf('day').toDate(), moment(endDate).endOf('day').toDate()] };
      } else if (startDate) {
        whereCondition.createdAt = { [Op.gte]: moment(startDate).startOf('day').toDate() };
      } else if (endDate) {
        whereCondition.createdAt = { [Op.lte]: moment(endDate).endOf('day').toDate() };
      }

      if (dayNow) {
        whereCondition.createdAt = { [Op.gte]: moment(dayNow).startOf('day').toDate() };
        whereCondition.startDate = undefined;
        whereCondition.endDate = undefined;
      }

      if (monthNow) {
        whereCondition.createdAt = { [Op.gte]: moment(monthNow).startOf('month').toDate() };
        whereCondition.startDate = undefined;
        whereCondition.endDate = undefined;
      }

      if (yearNow) {
        whereCondition.createdAt = { [Op.gte]: moment(yearNow).startOf('year').toDate() };
        whereCondition.startDate = undefined;
        whereCondition.endDate = undefined;
      }

      [populationData, laborStatisticByEducation, companyCount] = await Promise.all([
        User.findAll({
          include: [
            {
              model: Role,
              where: { name: 'User' },
              attributes: [] // Menghilangkan semua atribut dari Role karena hanya perlu untuk filter
            },
            {
              model: UserProfile,
              attributes: [
                'kecamatan',
                [Sequelize.literal(`SUM(CASE WHEN gender = 'Laki-laki' THEN 1 ELSE 0 END)`), 'male'],
                [Sequelize.literal(`SUM(CASE WHEN gender = 'Perempuan' THEN 1 ELSE 0 END)`), 'female']
              ],
              where: whereCondition,
            }
          ],
          attributes: [], // Tidak memerlukan atribut dari User
          group: ['UserProfile.kecamatan'],
          raw: true
        }),

        User.findAll({
          include: [
            {
              model: Role,
              where: { name: 'User' },
              attributes: [] // Menghilangkan semua atribut dari Role karena hanya perlu untuk filter
            },
            {
              model: UserProfile,
            },
            {
              model: UserEducationHistory,
              include: [
                {
                  model: EducationLevel
                }
              ],
            }
          ],
        }),

        Company.count({ where: whereCondition }),
      ]);

      let educationCount = [
        { education: "SD", count: 0 },
        { education: "SMP", count: 0 },
        { education: "SMA", count: 0 },
        { education: "D1", count: 0 },
        { education: "D3", count: 0 },
        { education: "D4", count: 0 },
        { education: "S1", count: 0 },
        { education: "S2", count: 0 },
        { education: "S3", count: 0 }
      ];

      laborStatisticByEducation.map(item => {
        educationCount.forEach(edu => {
          if (edu.education === item.UserEducationHistories[0]?.EducationLevel?.level) {
            edu.count += 1
          }
        })
      });

      console.log(JSON.stringify(laborStatisticByEducation));
      let totalEmploymentStatus = [
        { status: "Sudah Bekerja", count: 0 },
        { status: "Siap Bekerja", count: 0 },
        { status: "Tidak Bekerja", count: 0 }
      ];

      laborStatisticByEducation.map(item => {
        if (item.UserProfile.employmentStatus === "Sudah Bekerja") {
          totalEmploymentStatus[0].count += 1
        } else if (item.UserProfile.employmentStatus === "Siap Bekerja") {
          totalEmploymentStatus[1].count += 1
        } else if (item.UserProfile.employmentStatus === "Tidak Bekerja") {
          totalEmploymentStatus[2].count += 1
        }
      })


      // Memastikan hasil dalam bentuk array objek
      const result = populationData.map(item => ({
        kecamatan: item['UserProfile.kecamatan'],
        male: parseInt(item['UserProfile.male']),
        female: parseInt(item['UserProfile.female']),
      }));

      const userCount = await User.count({ where: {...whereCondition, role_id: 2} });
      const responseData = {
        laborStatistic: result,
        companyCount: companyCount,
        countUser: userCount,
        LaborByEducation: educationCount,
        totalEmploymentStatus: totalEmploymentStatus,
      }

      res.status(200).json(response(200, 'success get dashboard disnaker', responseData));
    } catch (err) {
      logger.error(`Error : ${err}`);
      logger.error(`Error message: ${err.message}`);
      res.status(500).json(response(500, 'internal server error', err));
      console.log(err);
    }
  }

}