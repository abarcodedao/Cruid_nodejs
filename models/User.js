const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true // Đảm bảo username là duy nhất
    },
    password: {
        type: String,
        required: true
    },
    loginTime: {
        type: Date,
        default: Date.now // Thời gian đăng nhập mặc định là thời điểm hiện tại
    },
    ipAddress: {
        type: String,
        required: true // Địa chỉ IP là bắt buộc
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
