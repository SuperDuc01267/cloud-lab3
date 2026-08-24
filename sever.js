const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const DATABASE_URL = process.env.DATABASE_URL;

// Middleware chuyển đổi dữ liệu JSON và URL-encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Khai báo Mongoose Schema & Model Quản lý Sinh viên
const StudentSchema = new mongoose.Schema({
  studentId: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  classCode: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Student = mongoose.model('Student', StudentSchema);

// Kết nối Cơ sở dữ liệu MongoDB
if (DATABASE_URL) {
  mongoose.connect(DATABASE_URL)
    .then(() => console.log('Kết nối MongoDB Atlas / Local thành công!'))
    .catch((err) => console.error('Lỗi kết nối MongoDB:', err.message));
} else {
  console.warn('CẢNH BÁO: Chưa cấu hình biến môi trường DATABASE_URL!');
}

// === CÁC ENDPOINT REST API ===

// 1. Route kiểm tra trạng thái dịch vụ (Healthcheck)
app.get('/', async (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
  res.json({
    status: 'success',
    message: 'Chào mừng bạn đến với Cloud Computing Student Management API',
    database_status: dbStatus,
    timestamp: new Date().toISOString()
  });
});

// 2. Lấy danh sách sinh viên
app.get('/api/students', async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    res.json({ status: 'success', count: students.length, data: students });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// 3. Thêm sinh viên mới
app.post('/api/students', async (req, res) => {
  try {
    const { studentId, fullName, classCode } = req.body;
    if (!studentId || !fullName || !classCode) {
      return res.status(400).json({ 
        status: 'fail', 
        message: 'Vui lòng điền đủ: studentId, fullName, classCode' 
      });
    }
    const newStudent = new Student({ studentId, fullName, classCode });
    await newStudent.save();

    res.status(201).json({ status: 'success', data: newStudent });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

// 4. Xóa sinh viên theo Mã sinh viên
app.delete('/api/students/:id', async (req, res) => {
  try {
    const deleted = await Student.findOneAndDelete({ studentId: req.params.id });
    if (!deleted) {
      return res.status(404).json({ status: 'fail', message: 'Không tìm thấy sinh viên' });
    }
    res.json({ status: 'success', message: 'Xóa sinh viên thành công' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Khởi chạy Server
app.listen(PORT, () => {
  console.log(`Server đang chạy trên Port: ${PORT}`);
});