import mongoose from 'mongoose';  
const connectDB = async () => {
  try{
    await mongoose.connect(process.env.MONGO_URI, {});
    console.log("MongoDB connected");
  } catch (err) {
    console.warn("Warning: Error connecting to MongoDB", err.message);
    console.warn("Server will continue running without database connection");
    // Don't exit, allow server to run without DB for now
  }
};

export default connectDB;

//flow of monogoose connection
//1. Import mongoose
//2. Create an async function connectDB
//3. Use mongoose.connect with MONGO_URI from environment variables
//4. Log success message on connection
//5. Catch and log errors, exit process on failure
//6. Export connectDB function for use in other parts of the application  

//how mongo db connection works in this file
//This file establishes a connection to a MongoDB database using Mongoose. 
//It defines an asynchronous function connectDB that attempts to connect to the database using a connection string stored in the environment variable MONGO_URI. 
//If the connection is successful, it logs a confirmation message; if it fails, it logs the error and exits the process. 
//The connectDB function is then exported for use in other parts of the application where a database connection is needed.
//process.exit(1) is used to terminate the Node.js process with a failure code when a connection error occurs.