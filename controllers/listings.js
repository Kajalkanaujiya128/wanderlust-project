const Listing=require("../models/listing");
// const fetch = require("node-fetch");


//for index
module.exports.index=async(req,res)=>{
 const allListings =await  Listing.find({});
   res.render("listings/index",{allListings});
};

// FILTER CATEGORY
module.exports.filterCategory = async(req,res)=>{
    let { category } = req.params;

    let allListings = await Listing.find({
        category: category
    });

    res.render("listings/index.ejs",{allListings});
};

//for new
module.exports.renderNewForm=(req,res)=>{
    res.render("listings/new.ejs");
};

//for show
module.exports.showListing=async(req,res,next)=>{
  try{
    let {id}=req.params;
 const listing=  await  Listing.findById(id)
 .populate({
    path:"reviews",
    populate:{
        path:"author",
    },
 }).populate("owner");
 if(!listing){
    req.flash("error","listing you requested for does not exist");
  return res.redirect("/listings");
 }
//  return res.render("listings/show");
console.log(listing.title);
console.log(listing.geometry);
return res.render("listings/show.ejs",{listing});
}catch(err){
  next(err);
}
};

//for create
// module.exports.createListing = async (req, res, next) => {
//   try {

//     const location = req.body.listing.location;

//     const response = await fetch(
//       `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`,
//       {
//         headers: { "User-Agent": "wanderlust-app" }
//       }
//     );

//     const data = await response.json();

//     const newListing = new Listing(req.body.listing);

//     if (data.length > 0) {
//       newListing.geometry = {
//         type: "Point",
//         coordinates: [
//           parseFloat(data[0].lon),
//           parseFloat(data[0].lat),
//         ],
//       };
//     }

//     newListing.owner = req.user._id;

//     if (req.file) {
//       newListing.image = {
//         url: req.file.path,
//         filename: req.file.filename,
//       };
//     }

//     await newListing.save();

//     req.flash("success", "new listing created");
//     return res.redirect("/listings");

//   } catch (err) {
//     next(err);
//   }
// };
module.exports.createListing = async (req, res, next) => {
  try {
    const location = req.body.listing.location;

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=1`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "wanderlust-app (kajalkanaujiya@gmail.com)"
      }
    });

    // SAFE PARSING (IMPORTANT)
    const text = await response.text();

    let data = [];
    try {
      data = JSON.parse(text);
    } catch (err) {
      console.log("❌ Geocoding response not JSON:", text);
      data = [];
    }

    // CREATE LISTING
    const newListing = new Listing(req.body.listing);

    // GEO DATA ONLY IF AVAILABLE
    if (data.length > 0) {
      newListing.geometry = {
        type: "Point",
        coordinates: [
          parseFloat(data[0].lon),
          parseFloat(data[0].lat)
        ]
      };
    } 

    newListing.owner = req.user._id;

    // IMAGE UPLOAD
    if (req.file) {
      newListing.image = {
        url: req.file.path,
        filename: req.file.filename
      };
    }

    await newListing.save();

    req.flash("success", "New listing created successfully");
    return res.redirect("/listings");

  } catch (err) {
    console.error("Create listing error:", err);
    next(err);
  }
};
//for edit
module.exports.renderEditForm=async(req,res)=>{
    let {id}=req.params;
 const listing=  await  Listing.findById(id);
 if(!listing){
    req.flash("error","listing you requested for does not exist");
  return  res.redirect("/listings");
 }
 let originalImageUrl=listing.image.url;
 originalImageUrl=originalImageUrl.replace("/upload","/upload/w_250,h_180,c_fill");
 res.render("listings/edit.ejs",{listing,originalImageUrl});

};

//for update
// module.exports.updateListing=async(req,res)=>{
//  let {id}=req.params;
// let listing= await Listing.findByIdAndUpdate(id,{...req.body.listing});
// if(typeof req.file !=="undefined"){
//     let url=req.file.path;
//     let filename=req.file.filename;
//  listing.image={url,filename};
//  await listing.save();
// }
//  req.flash("success","listing updated");
//  res.redirect(`/listings/${id}`);
// };
module.exports.updateListing = async (req, res) => {
  let { id } = req.params;

  let listing = await Listing.findById(id);

  // location se naye coordinates nikaalo
  const location = req.body.listing.location;

  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`,
    {
      headers: {
        "User-Agent": "wanderlust-app"
      }
    }
  );

  const data = await response.json();

  // form ke saare fields update karo
  listing.set(req.body.listing);

  // geometry bhi update karo
  if (data.length > 0) {
    listing.geometry = {
      type: "Point",
      coordinates: [
        parseFloat(data[0].lon),
        parseFloat(data[0].lat),
      ],
    };
  }

  // image update
  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
  }
console.log("UPDATE ROUTE HIT");
console.log(req.body.listing.location);
  await listing.save();

  req.flash("success", "listing updated");
  res.redirect(`/listings/${id}`);
};

//for delete
module.exports.destroyListing=async(req,res)=>{
     let {id}=req.params;
    let deletedListing=await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
     req.flash("success"," listing deleted");
    res.redirect("/listings");
};

