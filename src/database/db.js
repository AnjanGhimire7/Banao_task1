import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";
const connectDB = async () => {
  try {
    const connectionInstancs = await mongoose.connect(
      `${process.env.MONGO_DB_URI}/${DB_NAME}`
    );
    console.log(
      `MongoDb connected !! dbhost:${connectionInstancs.connection.host}`
    );
  } catch (error) {
    console.log("MongoDb connection failed!!!");
    process.exit(1);
  }
};
export default connectDB;
