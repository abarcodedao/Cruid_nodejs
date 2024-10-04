const express = require('express');
const router = express.Router();
const Course = require('../models/Course');

// Middleware kiểm tra đăng nhập
const checkAuthenticated = (req, res, next) => {
    if (req.session.user) {
        return next(); // Nếu đã đăng nhập, tiếp tục đến trang yêu cầu
    }
    res.redirect('/login'); // Nếu chưa đăng nhập, chuyển hướng đến trang đăng nhập
};

// Bảo vệ tất cả các route trong courseRoutes
router.use(checkAuthenticated);

// GET all courses
router.get('/', async (req, res) => {
    try {
        const courses = await Course.find();
        res.render('index', { courses }); // Render trang index với danh sách khóa học
    } catch (err) {
        console.error('Error fetching courses:', err);
        res.status(500).send('Internal Server Error'); // Xử lý lỗi nếu không thể lấy danh sách khóa học
    }
});

// GET form to create a new course
router.get('/new', (req, res) => {
    res.render('edit', { course: {} }); // Render form để tạo khóa học mới
});

// POST a new course
router.post('/', async (req, res) => {
    try {
        const course = new Course(req.body); // Tạo một khóa học mới từ dữ liệu yêu cầu
        await course.save(); // Lưu khóa học vào cơ sở dữ liệu
        res.redirect('/'); // Chuyển hướng về trang danh sách khóa học
    } catch (err) {
        console.error('Error saving course:', err);
        res.status(500).send('Internal Server Error'); // Xử lý lỗi nếu không thể lưu khóa học
    }
});

// GET form to edit a course
router.get('/:id/edit', async (req, res) => {
    try {
        const course = await Course.findById(req.params.id); // Tìm khóa học theo ID
        res.render('edit', { course }); // Render form để chỉnh sửa khóa học
    } catch (err) {
        console.error('Error fetching course:', err);
        res.status(500).send('Internal Server Error'); // Xử lý lỗi nếu không thể tìm khóa học
    }
});

// PUT to update a course
router.put('/:id', async (req, res) => {
    try {
        await Course.findByIdAndUpdate(req.params.id, req.body); // Cập nhật khóa học theo ID
        res.redirect('/'); // Chuyển hướng về trang danh sách khóa học
    } catch (err) {
        console.error('Error updating course:', err);
        res.status(500).send('Internal Server Error'); // Xử lý lỗi nếu không thể cập nhật khóa học
    }
});

// DELETE a course
router.delete('/:id', async (req, res) => {
    try {
        await Course.findByIdAndDelete(req.params.id); // Xóa khóa học theo ID
        res.redirect('/'); // Chuyển hướng về trang danh sách khóa học
    } catch (err) {
        console.error('Error deleting course:', err);
        res.status(500).send('Internal Server Error'); // Xử lý lỗi nếu không thể xóa khóa học
    }
});

module.exports = router;
