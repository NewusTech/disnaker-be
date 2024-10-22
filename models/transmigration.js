'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Transmigration extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Transmigration.hasMany(models.TransmigrationMember, {
        foreignKey: 'transmigration_id'
      });
      Transmigration.belongsTo(models.User, {
        foreignKey: 'user_id'
      })
    }
  }
  
  Transmigration.init({
    user_id: DataTypes.INTEGER,
    submissionNumber: {
      type: DataTypes.STRING,
      unique: true
    },
    domicile: DataTypes.TEXT,
    provinsi: DataTypes.STRING,
    kabupaten: DataTypes.STRING,
    kecamatan: DataTypes.STRING,
    kelurahan: DataTypes.STRING,
    status: DataTypes.ENUM('Pengajuan', 'Proses', 'Terbit', 'Diterima', 'Ditolak'),
    kk: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Transmigration',
    hooks: {
      beforeCreate: async (complaint, options) => {
        const lastTransmigration = await Transmigration.findOne({
          order: [['createdAt', 'DESC']] // Ambil data terakhir berdasarkan waktu pembuatan
        });
  
        let newSubmissionNumber = '001'; // Nomor awal jika belum ada data
  
        if (lastTransmigration) {
          // Ekstrak nomor dari submissionNumber terakhir
          const lastSubmissionNumber = lastTransmigration.submissionNumber;
          const lastNumber = parseInt(lastSubmissionNumber); // Buang prefix 'SUB' dan jadikan integer
          newSubmissionNumber = String(lastNumber + 1).padStart(3, '0'); // Tambah 1 dan tambahkan padding jika perlu
        }
  
        // Set submissionNumber baru ke complaint yang akan dibuat
        complaint.submissionNumber = newSubmissionNumber;
        complaint.status = 'Pengajuan';
      }
    }
  });
  Transmigration.addHook('beforeFind', (options) => {
    if (!options.order) {
      options.order = [['id', 'DESC']];
    }
  });
  return Transmigration;
};