// Підключення до Express і MySQL
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const PORT = 3001;
const app = express();

app.use(cors());  // Додає CORS

app.use(express.json()); // Для розбору JSON в тілі запиту

// Твій код для обробки запитів...
app.listen(3000, () => {
  console.log('Сервер працює на http://localhost:3000');
});

// Підключення до бази даних
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '!@rootf0rk_r5589#$',
  database: 'weapon_store'
});

db.connect(err => {
  if (err) {
    console.error('Помилка підключення до БД:', err);
  } else {
    console.log('Підключено до MySQL');
  }
});

// 1. Отримання категорій
app.get('/api/categories', (req, res) => {
  db.query('SELECT * FROM categories', (err, results) => {
    if (err) {
      console.error('Помилка отримання категорій:', err);
      res.status(500).send('Помилка сервера');
    } else {
      res.json(results);
    }
  });
});

// 2. Додавання нової категорії
// Додавання нового товару
app.post('/api/products', (req, res) => {
  const { name, category_id, description } = req.body;
  
  if (!name || !category_id || !description) {
    return res.status(400).send('Усі поля повинні бути заповнені');
  }

  const query = 'INSERT INTO products (name, category_id, description) VALUES (?, ?, ?)';
  db.query(query, [name, category_id, description], (err, results) => {
    if (err) {
      console.error('Помилка додавання товару:', err);
      return res.status(500).send('Помилка сервера');
    }
    res.status(201).json({ message: 'Товар успішно додано' });
  });
});


// 3. Редагування категорії
app.put('/api/categories/:id', (req, res) => {
  const categoryId = req.params.id;
  const { categoryName } = req.body;
  db.query('UPDATE categories SET name = ? WHERE id = ?', [categoryName, categoryId], (err, result) => {
    if (err) {
      console.error('Помилка редагування категорії:', err);
      res.status(500).send('Помилка сервера');
    } else {
      res.send('Категорію оновлено');
    }
  });
});

// 4. Видалення категорії
app.delete('/api/categories/:id', (req, res) => {
  const categoryId = req.params.id;
  db.query('DELETE FROM categories WHERE id = ?', [categoryId], (err, result) => {
    if (err) {
      console.error('Помилка видалення категорії:', err);
      res.status(500).send('Помилка сервера');
    } else {
      res.send('Категорію видалено');
    }
  });
});


// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущено на http://localhost:${PORT}`);
});
