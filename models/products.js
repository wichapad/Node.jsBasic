// ใช้งาน mongoose
const mongoose = require('mongoose')

// connect MongoDB
const dbUrl = 'mongodb://127.0.0.1:27017/productDB' //จัดเก็บตำแหน่งฐานข้อมูลที่จะสร้างขึ้นมา
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).catch(err => console.log(err))

/// ออกแบบ Schema
let productSchema = mongoose.Schema({
    name: String,
    price: Number,
    image: String,
    description: String
})

//create model
let Product = mongoose.model('products', productSchema)

//ส่งออก model
module.exports = Product

//ออกแบบ method function สำหรับ บันทึกข้อมูล

module.exports.saveProduct = function (model, data) {
    model.save(data)
}
