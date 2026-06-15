// const mongoose = require("mongoose");
// const Listing = require("../models/listing");

// // const mongo_url = "mongodb://127.0.0.1:27017/wanderlust";
// const dbUrl=process.env.ATLASDB_URL;
// async function main() {
//   await mongoose.connect(dbUrl);
//   console.log("Connected to DB");

//   const listings = await Listing.find({});

//   for (let listing of listings) {

//     if (
//       listing.geometry &&
//       listing.geometry.coordinates &&
//       listing.geometry.coordinates.length === 2
//     ) {
//       continue;
//     }

//     const location = `${listing.location}, ${listing.country}`;

//     try {
//       const response = await fetch(
//         `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`,
//         {
//           headers: {
//             "User-Agent": "wanderlust-app"
//           }
//         }
//       );

//       const data = await response.json();

//       if (data.length > 0) {

//         listing.geometry = {
//           type: "Point",
//           coordinates: [
//             parseFloat(data[0].lon),
//             parseFloat(data[0].lat)
//           ]
//         };

//         await listing.save();

//         console.log("Updated:", listing.title);
//       } else {
//         console.log("No coordinates found:", listing.title);
//       }

//     } catch (err) {
//       console.log("Error:", listing.title);
//       console.log(err);
//     }
//   }

//   mongoose.connection.close();
//   console.log("Done!");
// }

// main();

require("dotenv").config();
const mongoose = require("mongoose");
const Listing = require("../models/listing");

const dbUrl = process.env.ATLASDB_URL;

async function main() {
  await mongoose.connect(dbUrl);
  console.log("Connected to Atlas");

  const result = await Listing.updateMany(
    {},
    {
      owner: "6a301fb0526feb97c0309084",
    }
  );

  console.log(result);
  console.log("All listings owner updated!");

  mongoose.connection.close();
}

main();