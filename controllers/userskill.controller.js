const { response } = require('../helpers/response.formatter');

const { User, Skill, UserEducationHistory, sequelize ,UserSkill } = require('../models');

const Validator = require("fastest-validator");
const v = new Validator();
const { Op, where } = require('sequelize');
const { generatePagination } = require('../pagination/pagination');

const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const logger = require('../errorHandler/logger');
const vacancy = require('../models/vacancy');

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  useAccelerateEndpoint: true
});

module.exports = {
  createUserSkill: async (req, res) => {
      const { skills } = req.body; 
      try {
        // Cek apakah user ada
        const user = await User.findByPk(auth.userId);
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }

        const userskills = {};

        for (const skillId of skills) {
          let skill = await Skill.findOne({ where: { id: skillId } });
        
          // Jika skill belum ada, kirimkan response bahwa skill tidak ditemukan
          if (!skill) {
            return res.status(404).json({ message: 'Skill not found' });
          }
        
          userskills.push({
            user_id: auth.userId,
            skill_id: skill.id
          });
        }

        // Hapus semua skill lama dari UserSkill
        await UserSkill.destroy({ where: { user_id: user.id } });

        // Tambahkan skill baru ke UserSkill
        for (const skillId of skillIds) {
          await UserSkills.create({ user_id: userId, skill_id: skillId });
        }

        return res.status(200).json({ message: 'User skills updated successfully' });
      } catch (error) {
        logger.error(`Error : ${error}`);
        logger.error(`Error message: ${error.message}`);
        console.error('Error updating user skills:', error);
        return res.status(500).json({ message: 'Internal server error' });
      }
    },
  getUserSkill: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      // Kondisi where untuk pencarian dan filter
      const whereCondition = {
        user_id: auth.userId
      };

      // Menggunakan Promise.all untuk mendapatkan data dan total count secara paralel
      const [usereducationGets, totalCount] = await Promise.all([
        UserEducationHistory.findAll({
          where: whereCondition,
          limit: limit,
          offset: offset
        }),
        UserEducationHistory.count({
          where: whereCondition
        })
      ]);

      if (usereducationGets.length === 0) {
        return res.status(404).json(response(404, 'user education not found'));
      }

      // Buat pagination
      const pagination = generatePagination(totalCount, page, limit, '/api/usereducation/get');

      res.status(200).json({
        status: 200,
        message: 'success get user education',
        data: usereducationGets,
        pagination: pagination
      });
    } catch (err) {
      logger.error(`Error : ${err}`);
      logger.error(`Error message: ${err.message}`);
      res.status(500).json(response(500, 'internal server error', err));
    }
  }

}