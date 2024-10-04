const express = require('express');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const bodyParser = require('body-parser');
const courseRoutes = require('./routes/courseRoutes');
const User = require('./models/User'); // Import User model
const session = require('express-session'); // Thêm middleware session

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect('mongodb+srv://vthien562004:vanthien562004@cluster0.cepmq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Connected to MongoDB successfully!');
}).catch((err) => {
    console.error('Error connecting to MongoDB:', err.message);
});

// Middleware
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static('public'));

// Thiết lập session
app.use(session({
    secret: 'your_secret_key', // Thay đổi thành một khóa bí mật thực sự
    resave: false,
    saveUninitialized: true
}));

// Route for login
app.get('/login', (req, res) => {
    res.render('login', { pageTitle: 'Login' });
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    // Kiểm tra thông tin đăng nhập
    if (username === 'admin' && password === '12345') {
        // Lưu thông tin người dùng vào session
        req.session.user = { username }; // Lưu thông tin người dùng vào session

        // Lấy địa chỉ IP của người dùng
        const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

        // Kiểm tra xem người dùng đã tồn tại trong cơ sở dữ liệu chưa
        let user = await User.findOne({ username });
        
        if (!user) {
            // Nếu không tồn tại, tạo mới
            user = new User({
                username,
                loginTime: new Date(), // Thời gian đăng nhập
                ipAddress // Địa chỉ IP
            });
            await user.save(); // Lưu vào cơ sở dữ liệu
        } else {
            // Nếu đã tồn tại, có thể cập nhật thông tin (nếu cần)
            user.loginTime = new Date();
            user.ipAddress = ipAddress;
            await user.save(); // Cập nhật vào cơ sở dữ liệu
        }

        res.redirect('/'); // Redirect to the main page
    } else {
        res.status(401).send('Unauthorized'); // Handle incorrect login
    }
});

// Routes
app.use('/', courseRoutes);

// Middleware kiểm tra đăng nhập
const checkAuthenticated = (req, res, next) => {
    if (req.session.user) {
        return next(); // Nếu đã đăng nhập, tiếp tục đến trang yêu cầu
    }
    res.redirect('/login'); // Nếu chưa đăng nhập, chuyển hướng đến trang đăng nhập
};

// Sử dụng middleware kiểm tra đăng nhập cho tất cả các route sau
app.use('/index', checkAuthenticated); // Đảm bảo kiểm tra xác thực cho trang index

// Error handling middleware
app.use((req, res, next) => {
    res.status(404).render('404', { pageTitle: 'Page Not Found' }); // Create a 404.ejs file to display when the page is not found
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
