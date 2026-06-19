const Listing=require("../models/listing");



//for index
module.exports.index=async(req,res)=>{
 const allListings =await  Listing.find({});
   allListings.sort((a, b) => {
    if (a.category === "Rooms" && b.category !== "Rooms") return -1;
    if (a.category !== "Rooms" && b.category === "Rooms") return 1;
    return 0;
  });
   res.render("listings/index",{allListings,  allListings, selectedCategory: "All"});
};

// FILTER CATEGORY
module.exports.filterCategory = async(req,res)=>{
    let { category } = req.params;
console.log("CATEGORY CLICKED =", category);

    let allListings = await Listing.find({
        category: category
    });
console.log("FOUND =", allListings.length);
    res.render("listings/index.ejs",{allListings, selectedCategory: category });
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
    }  else {
  newListing.geometry = null;
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

module.exports.searchListings = async (req, res) => {
    let { q } = req.query;

    let allListings = await Listing.find({
        $or: [
            { title: { $regex: q, $options: "i" } },
            { location: { $regex: q, $options: "i" } },
            { country: { $regex: q, $options: "i" } }
        ]
    });

    res.render("listings/index.ejs", { allListings,  selectedCategory: "Search", searchQuery: q });
};
module.exports.updateListing = async (req, res) => {
  let { id } = req.params;

  let listing = await Listing.findById(id);

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
    console.log("Geocoding error:", text);
    data = [];
  }
  console.log("LOCATION =", location);
console.log("GEOCODE DATA =", data);

  listing.set(req.body.listing);

  if (data.length > 0) {
    listing.geometry = {
      type: "Point",
      coordinates: [
        parseFloat(data[0].lon),
        parseFloat(data[0].lat),
      ],
    };
  } else {
  listing.geometry = null;
}

//image update
  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
  }

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

