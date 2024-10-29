const { response } = require('../helpers/response.formatter');

const { Artikel, Event, Training, Complaint, User, Company, SurveyKepuasan, UserProfile, Role, UserEducationHistory, EducationLevel, YellowCard, Transmigration } = require('../models');
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

      [yellowCardAcceptedCount, yellowCardRejectedCount, transmigrationAccepted, transmigrationRejected] =
        await Promise.all([
          YellowCard.count({ where: { status: 'Terbit' } }),
          YellowCard.count({ where: { status: 'Ditolak' } }),
          Transmigration.count({ where: { status: 'Terbit' } }),
          Transmigration.count({ where: { status: 'Ditolak' } }),
        ])

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
        if (item.UserProfile?.employmentStatus === "Sudah Bekerja") {
          totalEmploymentStatus[0].count += 1
        } else if (item.UserProfile?.employmentStatus === "Siap Bekerja") {
          totalEmploymentStatus[1].count += 1
        } else if (item.UserProfile?.employmentStatus === "Tidak Bekerja") {
          totalEmploymentStatus[2].count += 1
        }
      })


      // Memastikan hasil dalam bentuk array objek
      const result = populationData.map(item => ({
        kecamatan: item['UserProfile.kecamatan'],
        male: parseInt(item['UserProfile.male']),
        female: parseInt(item['UserProfile.female']),
      }));

      const userCount = await User.count({ where: { ...whereCondition, role_id: 2 } });
      const responseData = {
        laborStatistic: result,
        companyCount: companyCount,
        countUser: userCount,
        LaborByEducation: educationCount,
        totalEmploymentStatus: totalEmploymentStatus,
        yellowCardAcceptedCount: yellowCardAcceptedCount,
        yellowCardRejectedCount: yellowCardRejectedCount,
        transmigrationAccepted: transmigrationAccepted,
        transmigrationRejected: transmigrationRejected
      }

      res.status(200).json(response(200, 'success get dashboard disnaker', responseData));
    } catch (err) {
      logger.error(`Error : ${err}`);
      logger.error(`Error message: ${err.message}`);
      res.status(500).json(response(500, 'internal server error', err));
      console.log(err);
    }
  },

  getDashboardPengaduan: async (req, res) => {
    try {
      let { year } = req.query;
      let whereCondition = {};

      if (year) {
        whereCondition.createdAt = {
          [Op.gte]: new Date(`${year}-01-01`),
          [Op.lte]: new Date(`${year}-12-31`),
        };
      }
      const complaints = await Complaint.findAll({
        where: whereCondition,
      });

      const chartData = [
        { month: "Januari", pengaduan: 0 },
        { month: "Februari", pengaduan: 0 },
        { month: "Maret", pengaduan: 0 },
        { month: "April", pengaduan: 0 },
        { month: "Mei", pengaduan: 0 },
        { month: "Juni", pengaduan: 0 },
        { month: "Juli", pengaduan: 0 },
        { month: "Agustus", pengaduan: 0 },
        { month: "September", pengaduan: 0 },
        { month: "Oktober", pengaduan: 0 },
        { month: "November", pengaduan: 0 },
        { month: "Desember", pengaduan: 0 }
      ];

      complaints.forEach(complaint => {
        const bulan = moment(complaint.timestamp).format('MMMM');
        const bulanData = chartData.find(item => item.month === bulan);

        if (bulanData) {
          bulanData.pengaduan += 1;
        }
      });

      console.log(chartData);


      res.status(200).json(response(200, 'success get dashboard pengaduan', chartData));
    }
    catch (err) {
      logger.error(`Error : ${err}`);
      logger.error(`Error message: ${err.message}`);
      res.status(500).json(response(500, 'internal server error', err));
      console.log(err);
    }
  },
  getDashboardIndeksKepuasan: async (req, res) => {
    try {
      let { yearNow, monthNow } = req.query;
      let whereCondition = {};
      const now = new Date().getFullYear();
      const monthnow = new Date().getMonth() + 1;
      whereCondition.createdAt = {
        [Op.gte]: new Date(`${now}-${monthnow}-01`),
        [Op.lte]: new Date(`${now}-${monthnow}-31`),
      };

      if (yearNow) {
        whereCondition.createdAt = {
          [Op.gte]: new Date(`${yearNow}-01-01`),
          [Op.lte]: new Date(`${yearNow}-12-31`),
        };
      }

      // console.log(now);
      // console.log(monthnow);
      let dataSurvey = {};
      let totalPercentageEasyUse = 0;
      let totalPercentageServiceTransparency = 0;
      
      const surveyKepuasan = await SurveyKepuasan.findAll({
        where: whereCondition
      });
      
      surveyKepuasan.forEach(element => {
        totalPercentageEasyUse += Number(element.isEasyUse);
        totalPercentageServiceTransparency += Number(element.serviceTransparency);
      });
      
      // Hitung persentase untuk isEasyUse dan serviceTransparency
      dataSurvey.isEasyUse = totalPercentageEasyUse ?  ((totalPercentageEasyUse / surveyKepuasan.length) * 20).toFixed(1) : 0; // Persentase dari isEasyUse
      dataSurvey.serviceTransparency = totalPercentageServiceTransparency ? ((totalPercentageServiceTransparency / surveyKepuasan.length) * 20).toFixed(1): 0; // Persentase dari serviceTransparency

      res.status(200).json(response(200, 'success get dashboard indeks kepuasan', dataSurvey));
    } catch (error) {
      console.log(error);
      logger.error(`Error : ${error}`);
      logger.error(`Error message: ${error.message}`);
      res.status(500).json(response(500, 'internal server error', error));
    }
  }

}