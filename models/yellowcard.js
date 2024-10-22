'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class YellowCard extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      YellowCard.belongsTo(models.User, {
        foreignKey: 'user_id'
      });
      YellowCard.belongsTo(models.EducationLevel, {
        foreignKey: 'educationLevel_id'
      });
    }
  }
  YellowCard.init({
    user_id: DataTypes.INTEGER,
    residance: DataTypes.TEXT,
    submissionNumber:{
      type: DataTypes.STRING,
      unique: true
    },
    provinsi: DataTypes.STRING,
    kabupaten: DataTypes.STRING,
    kecamatan: DataTypes.STRING,
    kelurahan: DataTypes.STRING,
    educationLevel_id: DataTypes.INTEGER,
    job: DataTypes.STRING,
    skill: DataTypes.TEXT,
    status: DataTypes.ENUM('Pengajuan', 'Proses', 'Terbit', 'Ditolak')
  }, {
    sequelize,
    modelName: 'YellowCard',
    hooks: {
      beforeCreate: async (complaint, options) => {
        const lastYellowCard = await YellowCard.findOne({
          order: [['createdAt', 'DESC']] // Ambil data terakhir berdasarkan waktu pembuatan
        });
  
        let newSubmissionNumber = '001'; // Nomor awal jika belum ada data
  
        if (lastYellowCard) {
          // Ekstrak nomor dari submissionNumber terakhir
          const lastSubmissionNumber = lastYellowCard.submissionNumber;
          const lastNumber = parseInt(lastSubmissionNumber); // Buang prefix 'SUB' dan jadikan integer
          newSubmissionNumber = String(lastNumber + 1).padStart(3, '0'); // Tambah 1 dan tambahkan padding jika perlu
        }
  
        // Set submissionNumber baru ke complaint yang akan dibuat
        complaint.submissionNumber = newSubmissionNumber;
        complaint.status = 'Pengajuan';
      }
    }
  });
  YellowCard.addHook('beforeFind', (options) => {
    if (!options.order) {
      options.order = [['id', 'DESC']];
    }
  });
  return YellowCard;
};