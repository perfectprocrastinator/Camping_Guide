var mongoose=require('mongoose');
//mongooose.connect("mongodb://localhost/yelp_camp");
var commentSchema=mongoose.Schema({
    text:String,
    author:String
})
module.exports=mongoose.model("Comment",commentSchema);