// logic.js
const sequelize = require('./db');
const Courses = require('./models/course');
const Prerequisites = require('./models/prerequisite');

async function buildGraph() {
  const courses = await Courses.findAll();
  const prereqs = await Prerequisites.findAll();

  const graph = {};
  const indegree = {};

  for (const course of courses) {
    graph[course.id] = [];
    indegree[course.id] = 0;
  }

  for (const { courseId, prerequisiteId } of prereqs) {
    graph[prerequisiteId].push(courseId);
    indegree[courseId]++;
  }

  return { graph, indegree };
}

async function topoSort() {
  const { graph, indegree } = await buildGraph();
  const queue = [];
  const order = [];

  for (const node in indegree) {
    if (indegree[node] === 0) queue.push(parseInt(node));
  }

  while (queue.length > 0) {
    const node = queue.shift();
    order.push(node);
    for (const neighbor of graph[node]) {
      indegree[neighbor]--;
      if (indegree[neighbor] === 0) queue.push(neighbor);
    }
  }

  const totalCourses = Object.keys(indegree).length;
  if (order.length < totalCourses) {
    return { hasCycle: true, order: [] };
  }

  return { hasCycle: false, order };
}

module.exports = { topoSort };
