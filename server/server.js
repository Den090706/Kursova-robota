// Підключення до Express і MySQL
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const PORT = 3000; // Використовуємо один порт для прослуховування
const app = express();

app.use(cors());  // Додає CORS
app.use(express.json()); // Для розбору JSON в тілі запиту

// Підключення до бази даних
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '5555',
  database: 'weapon_store',
  charset: 'utf8mb4'
});

db.query('SET NAMES utf8mb4', (err) => {
  if (err) console.error('Помилка налаштування кодування:', err);
});

db.connect(err => {
  if (err) {
    console.error('Помилка підключення до БД:', err);
  } else {
    console.log('Підключено до MySQL');
  }
});

// Отримання всіх категорій
app.get('/api/categories', (req, res) => {
  const query = 'SELECT * FROM categories'; 
  db.query(query, (err, results) => {
    if (err) {
      console.error('Помилка отримання категорій:', err);
      return res.status(500).json({ error: 'Помилка сервера' });
    }
    res.json(results); // Відправляємо список категорій
  });
});

/////////////// main.html

app.get('/api/products', (req, res) => {
  const { subcategoryId } = req.query;

  if (!subcategoryId) {
    return res.status(400).json({ error: 'Потрібно вказати ID підкатегорії' });
  }

  const query = 'SELECT name, description FROM products WHERE subcategory_id = ?';
  db.query(query, [subcategoryId], (err, results) => {
    if (err) {
      console.error('Помилка отримання товарів:', err);
      return res.status(500).json({ error: 'Помилка сервера' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Товари не знайдені для цієї підкатегорії' });
    }

    res.json(results); // Повертаємо всі товари для підкатегорії
  });
});

// 1. Отримання підкатегорій за category_id
app.get('/api/subcategories/:categoryId', (req, res) => {
  const categoryId = req.params.categoryId;

  const query = 'SELECT * FROM subcategories WHERE category_id = ?'; // Припустимо, у вас є таблиця підкатегорій
  db.query(query, [categoryId], (err, results) => {
    if (err) {
      console.error('Помилка отримання підкатегорій:', err);
      return res.status(500).json({ error: 'Помилка сервера' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Підкатегорії не знайдені' });
    }

    res.json(results);
  });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Маршрут не знайдено' });
});

app.get('/api/subcategories/:categoryId', async (req, res) => {
  const categoryId = req.params.categoryId;

  // Тут ваша логіка отримання підкатегорій з бази даних
  const subcategories = await database.getSubcategoriesByCategoryId(categoryId);

  if (subcategories && subcategories.length > 0) {
      res.json(subcategories);
  } else {
      res.status(404).send('Subcategories not found');
  }
});

/////////////////////////////////////////////////////////////////////////////////////// admin.html
// 2. Додавання нового товару
app.post('/api/products', (req, res) => {
  const { name, category_id, subcategory_id, description } = req.body;

  // Перевірка, чи всі обов'язкові поля заповнені
  if (!name || !category_id || !description) {
    return res.status(400).json({ error: 'Усі поля повинні бути заповнені' });
  }

  // Якщо підкатегорія порожня, заміняємо її на NULL
  const categoryId = category_id;
  const subcategoryId = subcategory_id || null;  // Якщо підкатегорія порожня, ставимо NULL

  // Якщо категорія не вказана
  if (!categoryId) {
    return res.status(400).json({ error: 'Категорія повинна бути обрана' });
  }

  // Запит до бази даних для додавання товару
  const query = 'INSERT INTO products (name, category_id, subcategory_id, description) VALUES (?, ?, ?, ?)';
  db.query(query, [name, categoryId, subcategoryId, description], (err, results) => {
    if (err) {
      console.error('Помилка додавання товару:', err);
      return res.status(500).json({ error: 'Помилка сервера' });
    }
    res.status(201).json({ message: 'Товар успішно додано' });
  });
});

// 3. Редагування товару
// Отримання інформації про товар за ID
app.get('/api/products/:id', (req, res) => {
  const productId = req.params.id;
  const query = 'SELECT * FROM products WHERE id = ?';

  db.query(query, [productId], (err, results) => {
    if (err) {
      console.error('Помилка запиту до бази даних:', err);
      return res.status(500).json({ error: 'Помилка сервера' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Товар не знайдений' });
    }

    res.json(results[0]); // Повертаємо перший знайдений товар
  });
});

// Редагування товару
app.put('/api/products/:id', (req, res) => {
  const productId = req.params.id;
  const { name, category_id, subcategory_id, description } = req.body;

  // Перевірка на обов'язкові поля
  if (!name || !category_id || !description) {
    return res.status(400).json({ error: 'Усі поля повинні бути заповнені' });
  }

  // Перевірка чи товар існує в базі
  const checkProductQuery = 'SELECT * FROM products WHERE id = ?';
  db.query(checkProductQuery, [productId], (err, results) => {
    if (err) {
      console.error('Помилка перевірки товару:', err);
      return res.status(500).json({ error: 'Помилка сервера' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Товар не знайдений' });
    }

    // Оновлення товару
    const query = 'UPDATE products SET name = ?, category_id = ?, subcategory_id = ?, description = ? WHERE id = ?';
    db.query(query, [name, category_id, subcategory_id || null, description, productId], (err, result) => {
      if (err) {
        console.error('Помилка редагування товару:', err);
        return res.status(500).json({ error: 'Помилка сервера' });
      }

      // Перевірка, чи були оновлені дані
      if (result.affectedRows === 0) {
        return res.status(400).json({ error: 'Товар не було оновлено, можливо, зміни не були знайдені' });
      }

      res.json({ message: 'Товар оновлено' });
    });
  });
});


// 4. Видалення товару
app.delete('/api/products/:id', (req, res) => {
  const productId = req.params.id;  
  db.query('DELETE FROM products WHERE id = ?', [productId], (err, result) => {  // Використовуємо productId
    if (err) {
      console.error('Помилка видалення товару:', err);
      res.status(500).json({ error: 'Помилка сервера' });
    } else {
      res.json({ message: 'Продукт видалено' });
    }
  });
});
//////////////////////////////////////////////////////////////////////////////////////////// admin.html

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер працює на http://localhost:${PORT}`);
});
