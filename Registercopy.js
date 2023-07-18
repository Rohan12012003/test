const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

console.log('Trying to connect');
const mongoClient = new MongoClient(process.env.MONGO_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

console.log('Not connected to the database');
const clientPromise = mongoClient.connect();
console.log('Connected to the database');

const handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Not Found' }),
      };
    }

    const { username, email, password } = JSON.parse(event.body);

    // Check if a user with the same email already exists
    const database = (await clientPromise).db(process.env.MONGODB_DATABASE);
    const collection = database.collection(process.env.MONGODB_COLLECTION);
    const existingUser = await collection.findOne({ email });

    if (existingUser) {
      // User with the same email already exists
      // You can perform additional steps here if needed, such as comparing passwords
      const isPasswordValid = existingUser.password === password;

      if (!isPasswordValid) {
        // Password is invalid
        return {
          statusCode: 401,
          body: JSON.stringify({ error: 'Invalid password' }),
        };
      }

      // Authentication successful
      // You can perform any additional actions required for authenticated users here
      // For example, generate a token for session management or return user data
      const currentUserId = existingUser._id;
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Authentication successful' }),
      };
    }

    // Create a new user and save it to the database
    const newUser = {
      username,
      email,
      password,
    };

    const savedUser = await collection.insertOne(newUser);
    const currentUserId = savedUser.insertedId;
    console.log('User saved:', savedUser);
    return {
      statusCode: 200,
      body: JSON.stringify(savedUser), // Send the saved user as the response
    };
  } catch (error) {
    console.error('Error registering user:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};

module.exports = { handler };
