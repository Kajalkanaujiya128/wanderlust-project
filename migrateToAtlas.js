require("dotenv").config();

const mongoose = require("mongoose");
const Listing = require("./models/listing");

const localDB = "mongodb://127.0.0.1:27017/wanderlust";
const atlasDB = process.env.ATLASDB_URL;

async function migrate() {
  try {
    // Local DB
    const localConn = await mongoose.createConnection(localDB).asPromise();
    const LocalListing = localConn.model("Listing", Listing.schema);

    const listings = await LocalListing.find({});
    console.log("Local listings found:", listings.length);

    // Atlas DB
    const atlasConn = await mongoose.createConnection(atlasDB).asPromise();
    const AtlasListing = atlasConn.model("Listing", Listing.schema);

    let count = 0;

    for (let listing of listings) {
      const obj = listing.toObject();

      // original _id bhi preserve rahe
      await AtlasListing.updateOne(
        { _id: obj._id },
        obj,
        { upsert: true }
      );

      count++;
    }

    console.log(`${count} listings migrated successfully`);

    process.exit(0);

  } catch (err) {
    console.log(err);
    process.exit(1);
  }
}

migrate();