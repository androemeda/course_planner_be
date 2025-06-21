const express = require('express');
const app = express();
const cors = require('cors');
app.use(express.json());
app.use(cors());
const PORT = 3000;

const sequelize = require('./db');

const { Op } = require('sequelize');

const Courses = require('./models/course');

const Prerequisites = require('./models/prerequisite');

const { topoSort } = require('./logic');

app.get('/', (req, res) => {
  res.send('hello');
});

app.get('/courses', async (req, res) => {
  const courses = await Courses.findAll();
  res.json(courses);
});

app.get('/prereqs', async (req, res) => {
  const prereqs = await Prerequisites.findAll();
  res.json(prereqs);
});

app.post('/addCourse', async (req, res) => {
  const { id, name } = req.body;
  try {
    const course = await Courses.create({ id, name });
    res.status(201).json(course);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/addPrereq', async (req, res) => {
  const { courseId, prerequisiteId } = req.body;
  try {
    const prereq = await Prerequisites.create({ courseId, prerequisiteId });
    res.status(201).json(prereq);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/courseOrder', async (req, res) => {
  try {
    const { hasCycle, order } = await topoSort();
    if (hasCycle) {
      return res
        .status(400)
        .json({ error: 'Cycle detected. No valid course order.' });
    }
    res.json({ order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/deleteCourse/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await Prerequisites.destroy({
      where: {
        [Op.or]: [{ courseId: id }, { prerequisiteId: id }],
      },
    });

    const deleted = await Courses.destroy({ where: { id } });

    if (deleted) {
      res.json({ message: `Course with ID ${id} deleted.` });
    } else {
      res.status(404).json({ error: 'Course not found.' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/deletePrereq', async (req, res) => {
  const { courseId, prerequisiteId } = req.body;
  try {
    const deleted = await Prerequisites.destroy({
      where: { courseId, prerequisiteId },
    });

    if (deleted) {
      res.json({
        message: `Prerequisite (${prerequisiteId} → ${courseId}) deleted.`,
      });
    } else {
      res.status(404).json({ error: 'Prerequisite relation not found.' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

sequelize
  .sync() // creates tables if they don't exist
  .then(() => {
    console.log('✅ DB synced');
    app.listen(PORT, () => {
      console.log('🚀 Server running on http://localhost:3000');
    });
  })
  .catch((err) => {
    console.error('❌ Failed to sync DB:', err);
  });
