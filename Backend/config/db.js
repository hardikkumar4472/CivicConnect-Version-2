import mongoose from 'mongoose';
const connectDB=async()=>{
    try{
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB is connected Successfully");
    }
    catch (err){
        console.log("Error while connected mongoDB", err.message);
    }
}
export default connectDB;
