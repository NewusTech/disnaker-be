const { response } = require('../helpers/response.formatter');

const { User, Jabatan, UserProfile, Role } = require('../models');
const Validator = require("fastest-validator");
const v = new Validator();
const { Op, where } = require('sequelize');
const { generatePagination } = require('../pagination/pagination');
const logger = require('../errorHandler/logger');


module.exports = {
  getAccount: async (req, res) => {
    try {
      let { search, status } = req.query;
      const showDeleted = req.query.showDeleted ?? null;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;
      let userGets;
      let totalCount;

      const whereCondition = {};
      const whereSearch = {};

      if (search) {
        whereSearch[Op.or] = [{ name: { [Op.iLike]: `%${search}%` } }, { nik: { [Op.iLike]: `%${search}%` } }];
      }
      if (status) {
        whereCondition.isActive = status === 'active' ? 'true' : 'false';
      }

      if (showDeleted !== null) {
        whereCondition.deletedAt = { [Op.not]: null };
      } else {
        whereCondition.deletedAt = null;
      }


      [userGets, totalCount] = await Promise.all([
        User.scope('withPassword').findAll({
          include: [
            {
              model: Role,
              where: { id: { [Op.notIn]: [2, 3] } }
            },
            {
              model: Jabatan,
              required: false
            },
            {
              model: UserProfile,
              required: false,
              as: 'UserProfile',
              where: whereSearch
            },
          ],
          limit: limit,
          offset: offset,
          attributes: { exclude: ['Role', 'UserProfile'] },
          order: [['id', 'ASC']],
          where: whereCondition,
        }),
        User.count({
          where: {...whereCondition,   role_id: { [Op.notIn]: [2, 3] } }
        })
      ]);

      let formattedUsers = userGets.map(user => {
        return {
          id: user.id,
          slug: user.slug,
          name: user.UserProfile?.name,
          jabatan: user.Jabatan?.name,
          nip: user.Jabatan?.nip,
          email: user.email,
          role_id: user.Role?.id,
          role_name: user.Role?.name,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        };
      });

      const pagination = generatePagination(totalCount, page, limit, '/api/users/get');

      res.status(200).json({
        status: 200,
        message: 'success get',
        data: formattedUsers,
        pagination: pagination
      });

    } catch (err) {
      logger.error(`Error : ${err}`);
      logger.error(`Error message: ${err.message}`);
      res.status(500).json(response(500, 'internal server error', err));
      console.log(err);
    }
  },
  getAccountById: async (req, res) => {
    try {
      const userGet = await User.findOne({
        where: {
          id: req.params.id
        },
        include: [
          {
            model: Role,
            where: { id: { [Op.notIn]: [2, 3] } }
          },
          { model: Jabatan },
          { model: UserProfile, where: { user_id: req.params.id }, },
        ],
        attributes: { exclude: ['Role', 'UserProfile'] },
      });

      res.status(200).json({
        status: 200,
        message: 'success get',
        data: userGet
      });
    } catch (err) {
      logger.error(`Error : ${err}`);
      logger.error(`Error message: ${err.message}`);
      res.status(500).json(response(500, 'internal server error', err));
      console.log(err);
    }
  },
  deleteAccount: async (req, res) => {
    try {
      //mendapatkan data user untuk pengecekan
      let userGet = await User.findOne({
        where: {
          [Op.and]: [
            { id: req.params.id },
            { role_id: { [Op.notIn]: [1, 2, 3] } }
          ]
        }
      })
      if (!userGet) {
        res.status(404).json(response(404, 'account not found'));
        return;
      }

      await User.destroy({
        where: {
          id: req.params.id
        }
      })
      res.status(200).json(response(200, 'success delete account'));
    } catch (err) {
      logger.error(`Error : ${err}`);
      logger.error(`Error message: ${err.message}`);
      res.status(500).json(response(500, 'internal server error', err));
      console.log(err);
    }
  }
}