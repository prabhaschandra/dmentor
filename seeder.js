const dotenv = require('dotenv');
const colors = require('colors');

const { connectDB } = require('./Config/db');
const { User } = require('./Models/UserModel');
const { Student } = require('./Models/StudentModel');

dotenv.config();

connectDB();

const createAdmin = async () => {
  try {
    const user = await User.create({
      firstName: 'Admin',
      email: 'admin@dmentors.in',
      password: 'dmentors2021',
      phoneNumber: '1234567890',
      userType: 'Admin',
      isAdmin: true,
    });

    user.password = 'dmentors2021';
    console.log('Done'.green.bold);
  } catch (error) {
    console.log(`${error}`.red.inverse);
    process.exit(1);
  }
};

const updateAdmin = async () => {
  try {
    //most enrolled courses
    const user = await User.findById('60b1cabf9f6f7f501021759f');
    user.password = 'dmentors2021';
    await user.save();
    console.log('Done'.green.bold);
  } catch (error) {
    console.log(`${error}`.red.inverse);
    process.exit(1);
  }
};

const test = async () => {
  try {
    const user = await User.find({});

    console.log('Done'.green.bold);
  } catch (error) {
    console.log(`${error}`.red.inverse);
    process.exit(1);
  }
};

createAdmin();
