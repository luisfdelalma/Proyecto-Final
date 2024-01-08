import mongoose from "mongoose"
import mongoosePaginate from "mongoose-paginate-v2"

const productsCollection = "products"
const productsSchema = mongoose.Schema({
    title: { type: String, index: true },
    BId: Number,
    description: String,
    code: String,
    price: Number,
    status: { type: Boolean, default: true },
    stock: Number,
    category: String,
    thumbnail: String,
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "aut-users", default: "admin" }
})

productsSchema.plugin(mongoosePaginate)

export default mongoose.model(productsCollection, productsSchema)