const mongoose = require('mongoose');
const express = require('express');
const app = express();
const cors = require('cors');
app.use(express.json());
app.use(cors());

// MongoDB setup and User model definition (similar to your existing code)
mongoose.set('strictQuery', false);

// Replace 'yourDB-name' with your actual database name
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/yourDB-name', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('Connected to the yourDB-name database');

    const userSchema = new mongoose.Schema({
      username: String,
      email: String,
      password: String,
      wishlist: [
        {
          imageurl: String,
          tabHeading: String,
          Hotels: Number,
          flights: Number,
          cars: Number,
          duration: String,
          price: Number
        }
      ],
      bookings: [
        {
          tabHeading: String, // Add the destination field
          hotels: Number,
          flights: Number,
          cars: Number,
          fromDate: Date,
          toDate: Date,
          name1: String,
          name2: String,
          age1: String,
          age2: String,
          email: String,
          phone: String,
          city: String,
          district: String,
          state: String,
          paymentMethod: String,
          totalPayment: Number,
          fromDate: Date,
          toDate: Date,
          request: String,
          price: Number,
          imageurl: String
        }
      ]
    });

    userSchema.methods.comparePassword = function (password) {
      // Implement your password comparison logic here
      // You can use a library like bcrypt for secure password hashing and comparison
      return password === this.password;
    };

    const User = mongoose.model('User', userSchema);

    // Function to handle user registration
    app.post('/Register', async (req, res) => {
      try {
        const { username, email, password } = req.body;

        // Check if a user with the same email already exists in the database
        const existingUser = await User.findOne({ email });

        if (existingUser) {
          // User with the same email already exists
          // You can perform additional steps here if needed, such as comparing passwords
          const isPasswordValid = await existingUser.comparePassword(password);

          if (!isPasswordValid) {
            // Password is invalid
            return res.status(401).json({ error: 'Invalid password' });
          }

          // Authentication successful
          // You can perform any additional actions required for authenticated users here
          // For example, generate a token for session management or return user data
          return res.status(200).json({ message: 'Authentication successful' });
        }

        // Create a new user and save it to the database
        const newUser = new User({
          username,
          email,
          password,
        });

        const savedUser = await newUser.save();
        console.log('User saved:', savedUser);
        res.status(200).json(savedUser); // Send the saved user as the response
      } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });
  })
  .catch((error) => {
    console.error('Error connecting to the database:', error);
  });

module.exports = app;
