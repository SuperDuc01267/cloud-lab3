const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(express.json());

// 1. Kết nối MongoDB
const dbUrl = process.env.DATABASE_URL;
mongoose.connect(dbUrl)
  .then(() => console.log('>>> DB Connected Successfully!'))
  .catch(err => console.error('>>> DB Connection Error:', err));

// 2. Tạo Schema & Model dữ liệu mẫu
const ItemSchema = new mongoose.Schema({
  name: String,
  createdAt: { type: Date, default: Date.now }
});
const Item = mongoose.model('Item', ItemSchema);

// 3. API đọc danh sách dữ liệu (GET)
app.get('/items', async (req, res) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. API ghi dữ liệu mới (POST)
app.post('/items', async (req, res) => {
  try {
    const newItem = new Item({ name: req.body.name || "Dữ liệu mẫu Lab 3" });
    await newItem.save();
    res.json({ message: "Thêm thành công!", data: newItem });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/', (req, res) => {
  res.send('Server Node.js đang chạy thành công!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));