const { response } = require('../helpers/response.formatter');

const { Vacancy, SavedVacancy, User, Skill , EducationLevel, Company, VacancyCategory} = require('../models');

const Validator = require("fastest-validator");
const v = new Validator();
const { Op, where } = require('sequelize');

const moment = require('moment-timezone');
const logger = require('../errorHandler/logger');

module.exports = {
  savevacancy: async (req, res) => {
    try {

      //membuat schema untuk validasi
      const schema = {
        user_id: { type: "number", min: 1, optional: false },
        vacancy_id: { type: "number", min: 1, optional: false }
      }

      //buat object savedVacancy
      let savedVacancyCreateObj = {
        user_id: auth.userId,
        vacancy_id: parseInt(req.body.vacancy_id),
      }

      //validasi menggunakan module fastest-validator
      const validate = v.validate(savedVacancyCreateObj, schema);
      if (validate.length > 0) {
        res.status(400).json(response(400, 'validation failed', validate));
        return;
      }

      //buat savedVacancy
      let savedVacancyCreate = await SavedVacancy.create(savedVacancyCreateObj);

      //response menggunakan helper response.formatter
      res.status(201).json(response(201, 'success create savedVacancy', savedVacancyCreate));
    } catch (err) {
      logger.error(`Error : ${err}`);
      logger.error(`Error message: ${err.message}`);
      res.status(500).json(response(500, 'internal server error', err));
    }
  },

  unsavevacancy: async (req, res) => {
    try {
      //mendapatkan data savedVacancy untuk pengecekan
      let savedVacancyGet = await SavedVacancy.findOne({
        where: {
          user_id: auth.userId,
          vacancy_id: Number(req.body.vacancy_id)
        }
      });

      //cek apakah savedVacancy ada atau tidak
      if (!savedVacancyGet) {
        res.status(404).json(response(404, 'savedVacancy not found'));
      }

      let savedVacancyDelete = await SavedVacancy.destroy({
        where: {
          user_id: auth.userId,
          vacancy_id: req.body.vacancy_id
        }
      });

      //response menggunakan helper response.formatter
      res.status(200).json(response(200, 'success delete savedVacancy', savedVacancyDelete));
    } catch (err) {
      logger.error(`Error : ${err}`);
      logger.error(`Error message: ${err.message}`);
      res.status(500).json(response(500, 'internal server error', err));
    }
  },

  getsavedVacancy: async (req, res) => {
    try {
      const savedVacancyGets = await SavedVacancy.findAll({
        where: {
          user_id: auth.userId
        },
        include: [{ model: Vacancy }]
      });

      //response menggunakan helper response.formatter
      res.status(200).json(response(200, 'success get savedVacancy', savedVacancyGets));
    } catch (err) {
      logger.error(`Error : ${err}`);
      logger.error(`Error message: ${err.message}`);
      res.status(500).json(response(500, 'internal server error', err));
    }
  },

  getRecommendation: async (req, res) => {
    try {
      // Dapatkan keterampilan pengguna
      const userSkills = await User.findOne({
        where: { id: auth.userId }, // Pastikan auth.userId adalah id pengguna yang sedang login
        include: [{ model: Skill, attributes: ['id', 'name'] }]
      });

      // Cek apakah userSkills ditemukan dan memiliki keterampilan (skills)
      if (!userSkills || userSkills.Skills.length === 0) {
        return res.status(404).json(response(404, 'User does not have any skills'));
      }

      // Map skill_id dari userSkills.Skills
      const userSkillIds = userSkills.Skills.map(skill => skill.id);

      const recommendedVacancies = await Vacancy.findAll({
        attributes: ['id', 'title', 'slug', 'workLocation', 'jobType', 'desc', 'applicationDeadline', 'salary', 'location', 'isPublished', 'createdAt', 'updatedAt'],
        include: [
          { model: EducationLevel, attributes: ['id', 'level'] },
          { model: Company, attributes: ['id', 'name', 'imageLogo'] },
          { model: VacancyCategory, attributes: ['id', 'name']},
          {
            model: Skill,
            where: {
              id: { [Op.in]: userSkillIds }
            },
            through: { attributes: [] }
          }
        ]
      });

    // Responkan rekomendasi lowongan pekerjaan
    return res.status(200).json(response(200, 'Success get recommended vacancies', recommendedVacancies));
  } catch(error) {
    console.error('Error fetching recommended vacancies:', error);
    return res.status(500).json(response(500, 'Internal Server Error'));
  }
},

  getVacancyUrgent: async (req, res) => {
    try {

      const urgentDate = moment().add(14, 'day').format('YYYY-MM-DD');

      const urgentVacancies = await Vacancy.findAll({
        attributes: ['id', 'title', 'slug', 'workLocation', 'jobType', 'desc', 'applicationDeadline', 'salary', 'location', 'isPublished', 'createdAt', 'updatedAt'],
        include: [
          { model: EducationLevel, attributes: ['id', 'level'] },
          { model: Company, attributes: ['id', 'name', 'imageLogo'] },
          { model: VacancyCategory, attributes: ['id', 'name']},
          {
            model: Skill,
            through: { attributes: [] }
          }
        ],
        where: {
          applicationDeadline: {
            [Op.lt]: urgentDate // Filter berdasarkan applicationDeadline kurang dari 1 bulan dari sekarang
          }
        }
      });

      // Responkan rekomendasi lowongan pekerjaan
      return res.status(200).json(response(200, 'Success get recommended vacancies', urgentVacancies));
    } catch (error) {
      console.error('Error fetching recommended vacancies:', error);
      return res.status(500).json(response(500, 'Internal Server Error'));
    }
  }
}  