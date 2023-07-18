const mongoose = require('mongoose');
require('dotenv').config();

const express = require('express');
const app = express();

mongoose.set('strictQuery', false);

const cors = require('cors');
app.use(express.json());
app.use(cors());
let currentUserId = null;

//'mongodb://localhost:27017/travloDB'
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
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

    app.get('/', (req, res) => {
      res.send('App is Working');
      console.log("on homepage");
    });

    app.post('/Register', async (req, res) => {
      try {


        const { username, email, password } = req.body;

        // Check if a user with the same email already exists
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
          currentUserId = existingUser._id;
          return res.status(200).json({ message: 'Authentication successful' });
        }

        // Create a new user and save it to the database
        const newUser = new User({
          username,
          email,
          password,
        });

        const savedUser = await newUser.save();
        currentUserId = savedUser._id;
        console.log('User saved:', savedUser);
        res.status(200).json(savedUser); // Send the saved user as the response
      } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    app.get('/MyAccount', (req, res) => {
      // Retrieve the user data from the database based on the user ID
      // Assuming you have a User model and the user ID is stored in req.user.id
      //currentUserId="64aa61c870faa0425f4218ef";
      User.findById(currentUserId)
        .then(user => {
          if (!user) {
            return res.status(404).json({ error: 'User not found' });
          }
          // Send the user data as the response
          res.status(200).json(user);
          console.log("found user");
          console.log(user);
        })
        .catch(error => {
          console.error('Error fetching user data:', error);
          res.status(500).json({ error: 'Internal server error' });
        });
    });

    app.get("/wishlist", (req, res) => {
      // Retrieve the wishlist data from the database based on the user ID
      // Assuming you have a User model and the user ID is stored in currentUserId
      User.findById(currentUserId)
        .then((user) => {
          if (!user) {
            return res.status(404).json({ error: "User not found" });
          }
          // Send the wishlist data as the response
          res.status(200).json(user.wishlist);
        })
        .catch((error) => {
          console.error("Error fetching wishlist data:", error);
          res.status(500).json({ error: "Internal server error" });
        });
    });
    
    

    app.put('/wishlist', (req, res) => {
      const newItem = req.body.wishlist[0]; // Assuming a single item is sent in the wishlist array
    
      // Assuming you have a User model and the user ID is stored in currentUserId
      User.findByIdAndUpdate(
        currentUserId,
        { $push: { wishlist: newItem } }, // Use $push to append the new item to the wishlist array
        { new: true }
      )
        .then((user) => {
          if (!user) {
            return res.status(404).json({ error: 'User not found' });
          }
          res.status(200).json(user.wishlist);
        })
        .catch((error) => {
          console.error('Error updating wishlist:', error);
          res.status(500).json({ error: 'Internal server error' });
        });
    });
    
    
    app.get("/bookings", (req, res) => {
      // Retrieve the bookings data from the database based on the user ID
      // Assuming you have a User model and the user ID is stored in currentUserId
      User.findById(currentUserId)
        .then((user) => {
          if (!user) {
            return res.status(404).json({ error: "User not found" });
          }
          // Send the bookings data as the response
          res.status(200).json(user.bookings);
        })
        .catch((error) => {
          console.error("Error fetching bookings data:", error);
          res.status(500).json({ error: "Internal server error" });
        });
    });
    

    app.post('/booking', (req, res) => {
      const bookingData = req.body;
    
      // Assuming you have a User model and the user ID is stored in currentUserId
      User.findByIdAndUpdate(
        currentUserId,
        { $push: { bookings: bookingData } }, // Use $push to append the new booking data to the bookings array
        { new: true }
      )
        .then((user) => {
          if (!user) {
            return res.status(404).json({ error: 'User not found' });
          }
          res.status(200).json({ message: 'Booking data saved successfully' });
        })
        .catch((error) => {
          console.error('Error saving booking data:', error);
          res.status(500).json({ error: 'Internal server error' });
        });
    });
    
    app.post('/logout',(req,res)=>{
      currentUserId=null;
      res.status(200).json({ message: 'Logout successful' });
    })



  })
  .catch((error) => {
    console.error('Error connecting to the database:', error);
  });

const port = 5000||process.env.PORT;
app.listen(port, () => {
  console.log(`App is listening on port ${port}`);
});