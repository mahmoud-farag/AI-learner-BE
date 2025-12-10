import mongoose  from 'mongoose';


const connectToDB = async () => {
  try {

    const connection = await mongoose.connect(process.env.MONGO_URI);

    console.log(` DB connectio established client: ${connection.connection.host}`)
  } catch(error) {
    console.log('Error while connecting to the DB client', error);

    throw new Error('Error while connecting to the DB client');
  }
}

export default connectToDB;


