// Jorge Omar Lopez Gemigniani 9049992
// Daniel Garrido Quinde 9042293
import mongoose from "mongoose";

const bookSchema = mongoose.Schema({
    title: {type:String, required:true},
    author: {type:String, required:true},
    editor: {type:String, required:true},
    year: {type:Number, required:true},
    price: {type:Number, required:true},
    cover: {type:String, required:true},
    isbn: {type:String, required:true},
    synopsis: { type: String, required: true },
    stock: {type:Number, required:true},
    discount: {type:Number}
}, {timestamps:true});

const bookModel = mongoose.model("book", bookSchema);

export default bookModel;