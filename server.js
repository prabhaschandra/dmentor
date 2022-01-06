const express = require('express');
const dotenv = require('dotenv');
const colors = require('colors');
const cors = require('cors');

const { connectDB } = require('./Config/db');
const userRoutes = require('./Routes/UserRoutes');
const batchRoutes = require('./Routes/BatchRoutes');
const centerRoutes = require('./Routes/CenterRoutes');
const courseRoutes = require('./Routes/CourseRoutes');
const couponRoutes = require('./Routes/CouponRoutes');
const enrollmentRoutes = require('./Routes/EnrollmentRoutes');
const galleryVideoRoutes = require('./Routes/GalleryVideoRoutes');
const adminRoutes = require('./Routes/AdminRoutes');
const { notFoundError, errorHandler } = require('./Middleware/ErrorMiddleware.js');
const app = express();

dotenv.config();

connectDB();

app.use(express.json());

app.use(cors());
app.options('*', cors());



app.get('/', (req, res) => {
  res.send('Server is running....');
});

app.use(express.static('public'));

app.use('/api/users', userRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/centers', centerRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/galleryVideos', galleryVideoRoutes);
app.use('/api/admin', adminRoutes);

app.use(notFoundError);
app.use(errorHandler);

const PORT = process.env.PORT || 8080;

app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on Port ${PORT}`.green.bold));
