const { response } = require('../helpers/response.formatter');

const { User, Skill, UserEducationHistory, sequelize, UserSkill } = require('../models');

const Validator = require("fastest-validator");
const v = new Validator();
const { Op, where } = require('sequelize');
const { generatePagination } = require('../pagination/pagination');

const { S3Client, PutObjectCommand, InventoryIncludedObjectVersions } = require("@aws-sdk/client-s3");
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
      const user = await User.findByPk(auth.userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const tempSkills = [];

      for (const skillId of skills) {
        let skill = await Skill.findOne({ where: { id: skillId } });

        if (!skill) {
          return res.status(404).json({ message: 'Skill not found' });
        }

        tempSkills.push({
          user_id: auth.userId,
          skill_id: skill.id
        });
      }

      await UserSkill.destroy({
        where: { user_id: auth.userId }
      });

      for (const tempSkill of tempSkills) {
        await UserSkill.create({ user_id: tempSkill.user_id, skill_id: tempSkill.skill_id });
      }

      return res.status(200).json(response(200, 'success save user skill'));

    } catch (error) {
      logger.error(`Error : ${error}`);
      logger.error(`Error message: ${error.message}`);
      console.error('Error updating user skills:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  },
  getUserSkill: async (req, res) => {
    try {

      const user = await User.findOne({
        where: { id: auth.userId },
        include: [{ model: Skill }],
      });

      if (!user) {
        return res.status(404).json(response(404, 'user not found'));
      }

      const userSkills = user.Skills;

      res.status(200).json({
        status: 200,
        message: 'success get user skills',
        data: userSkills,
      });
    } catch (err) {
      logger.error(`Error : ${err}`);
      logger.error(`Error message: ${err.message}`);
      res.status(500).json(response(500, 'internal server error', err));
    }
  }

}