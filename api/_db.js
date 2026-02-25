\
const mongoose = require("mongoose");

let cached = global.__mongoose_cache;
if (!cached) cached = global.__mongoose_cache = { conn: null, promise: null };

async function connect_db() {
  if (cached.conn) return cached.conn;

  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("MONGO_URI missing");

  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, { bufferCommands: false }).then((m) => m);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = { connect_db, mongoose };
