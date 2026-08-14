const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection failed:', err && err.message ? err.message : err);

    // Common SRV DNS error: ENOTFOUND for _mongodb._tcp.<host>
    if (err && err.message && err.message.includes('querySrv ENOTFOUND')) {
      console.error('\nPossible causes:\n' +
        '- The host in `MONGO_URI` is incorrect. Copy the connection string from MongoDB Atlas (Connect → Connect your application).\n' +
        "- Your network or DNS blocks SRV lookups — try the 'Standard' (mongodb://) connection string from Atlas instead of mongodb+srv://.\n" +
        '- If you want me to, I can convert the URI to a non-SRV template for you (you still need the exact hosts from Atlas).\n');
    }

    // Don't crash the whole process during development — leave the server running
    // so we can iterate while you fix the DB settings. Other routes will error
    // until DB is reachable.
  }
};

module.exports = connectDB;
