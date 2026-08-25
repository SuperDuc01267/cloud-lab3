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

// === GIAO DIỆN WEB UI CHO TRANG CHỦ (/) ===
app.get('/', async (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'Connected 🟢' : 'Disconnected 🔴';
  
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Cloud Computing - Student Management Lab 4</title>
      <style>
        :root { --primary: #4f46e5; --primary-hover: #4338ca; --bg: #f8fafc; --card: #ffffff; --text: #1e293b; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: var(--bg); color: var(--text); margin: 0; padding: 20px; }
        .container { max-width: 900px; margin: 0 auto; }
        header { background: linear-gradient(135deg, #4f46e5, #3b82f6); color: white; padding: 25px; border-radius: 12px; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2); margin-bottom: 25px; }
        h1 { margin: 0 0 8px 0; font-size: 24px; }
        .meta { display: flex; justify-content: space-between; align-items: center; font-size: 14px; opacity: 0.9; }
        .badge { background: rgba(255, 255, 255, 0.2); padding: 5px 12px; border-radius: 20px; font-weight: 600; }
        .card { background: var(--card); padding: 25px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); margin-bottom: 25px; }
        h2 { font-size: 18px; margin-top: 0; color: #334155; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px; }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr 1fr auto; gap: 12px; align-items: end; }
        @media(max-width: 768px) { .form-grid { grid-template-columns: 1fr; } }
        .form-group label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 5px; color: #64748b; }
        .form-control { width: 100%; padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 14px; box-sizing: border-box; }
        .form-control:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1); }
        .btn { background-color: var(--primary); color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: background 0.2s; height: 41px; }
        .btn:hover { background-color: var(--primary-hover); }
        .btn-danger { background-color: #ef4444; padding: 6px 12px; font-size: 12px; height: auto; }
        .btn-danger:hover { background-color: #dc2626; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { padding: 12px 15px; text-align: left; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
        th { background-color: #f8fafc; font-weight: 600; color: #475569; }
        tr:hover { background-color: #f8fafc; }
        .empty-state { text-align: center; color: #94a3b8; padding: 20px; font-style: italic; }
      </style>
    </head>
    <body>
      <div class="container">
        <header>
          <h1>☁️ Cloud Computing - Quản Lý Sinh Viên</h1>
          <div class="meta">
            <span>Lab 4 Deployment & UI Integration</span>
            <span class="badge">Database: ${dbStatus}</span>
          </div>
        </header>

        <div class="card">
          <h2>➕ Thêm Sinh Viên Mới</h2>
          <form id="studentForm" onsubmit="addStudent(event)">
            <div class="form-grid">
              <div class="form-group">
                <label>Mã Sinh Viên (studentId)</label>
                <input type="text" id="studentId" class="form-control" placeholder="VD: B20DCCN001" required>
              </div>
              <div class="form-group">
                <label>Họ và Tên (fullName)</label>
                <input type="text" id="fullName" class="form-control" placeholder="VD: Nguyễn Văn A" required>
              </div>
              <div class="form-group">
                <label>Mã Lớp (classCode)</label>
                <input type="text" id="classCode" class="form-control" placeholder="VD: D20CQCN01-V" required>
              </div>
              <button type="submit" class="btn">Thêm mới</button>
            </div>
          </form>
        </div>

        <div class="card">
          <h2>📋 Danh Sách Sinh Viên</h2>
          <div style="overflow-x: auto;">
            <table>
              <thead>
                <tr>
                  <th>Mã SV</th>
                  <th>Họ và Tên</th>
                  <th>Lớp</th>
                  <th>Thời gian tạo</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody id="studentTableBody">
                <tr><td colspan="5" class="empty-state">Đang tải dữ liệu...</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <script>
        async function fetchStudents() {
          try {
            const res = await fetch('/api/students');
            const result = await res.json();
            const tbody = document.getElementById('studentTableBody');
            
            if (result.status === 'success' && result.data.length > 0) {
              tbody.innerHTML = result.data.map(s => \`
                <tr>
                  <td><strong>\${s.studentId}</strong></td>
                  <td>\${s.fullName}</td>
                  <td>\${s.classCode}</td>
                  <td>\${new Date(s.createdAt).toLocaleString('vi-VN')}</td>
                  <td><button class="btn btn-danger" onclick="deleteStudent('\${s.studentId}')">Xóa</button></td>
                </tr>
              \`).join('');
            } else {
              tbody.innerHTML = '<tr><td colspan="5" class="empty-state">Chưa có dữ liệu sinh viên nào.</td></tr>';
            }
          } catch (err) {
            console.error(err);
          }
        }

        async function addStudent(e) {
          e.preventDefault();
          const studentId = document.getElementById('studentId').value;
          const fullName = document.getElementById('fullName').value;
          const classCode = document.getElementById('classCode').value;

          const res = await fetch('/api/students', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ studentId, fullName, classCode })
          });

          const data = await res.json();
          if (res.ok) {
            document.getElementById('studentForm').reset();
            fetchStudents();
          } else {
            alert('Lỗi: ' + data.message);
          }
        }

        async function deleteStudent(id) {
          if (!confirm('Bạn có chắc muốn xóa sinh viên này?')) return;
          const res = await fetch('/api/students/' + id, { method: 'DELETE' });
          if (res.ok) {
            fetchStudents();
          } else {
            alert('Không thể xóa sinh viên');
          }
        }

        fetchStudents();
      </script>
    </body>
    </html>
  `;
  res.send(htmlContent);
});

// === CÁC ENDPOINT REST API ===

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