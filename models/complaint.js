'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Complaint extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Complaint.belongsTo(models.User, {
        foreignKey: 'user_id'
      });
    }
  }
  Complaint.init({
    user_id: DataTypes.INTEGER,
    submissionNumber:{
      type: DataTypes.STRING,
      unique: true
    },
    title: DataTypes.STRING,
    desc: DataTypes.TEXT,
    response: DataTypes.TEXT,
    file: DataTypes.STRING,
    status: DataTypes.ENUM('Proses','Diterima','Ditutup')
  }, {
    sequelize,
    modelName: 'Complaint',
    hooks: {
      beforeCreate: async (complaint, options) => {
        const lastComplaint = await Complaint.findOne({
          order: [['createdAt', 'DESC']] // Ambil data terakhir berdasarkan waktu pembuatan
        });
  
        let newSubmissionNumber = '001'; // Nomor awal jika belum ada data
  
        if (lastComplaint) {
          // Ekstrak nomor dari submissionNumber terakhir
          const lastSubmissionNumber = lastComplaint.submissionNumber;
          const lastNumber = parseInt(lastSubmissionNumber); // Buang prefix 'SUB' dan jadikan integer
          newSubmissionNumber = String(lastNumber + 1).padStart(3, '0'); // Tambah 1 dan tambahkan padding jika perlu
        }
  
        // Set submissionNumber baru ke complaint yang akan dibuat
        complaint.submissionNumber = newSubmissionNumber;
        complaint.status = 'Proses';
      }
    }
  });
  Complaint.addHook('beforeFind', (options) => {
    if (!options.order) {
      options.order = [['id', 'DESC']];
    }
  });
  return Complaint;
};