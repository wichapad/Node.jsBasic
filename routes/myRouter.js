//จัดการ routing
const express = require("express");
const router = express.Router();
const Product = require("../models/products"); // เรียกใช้งาน model

const multer = require("multer"); //upload File

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    //ระบุตำแหน่งที่จะทำการเก็บไฟล์ที่มาจาก Form
    cb(null, "./public/images/products");
  },
  filename: function (req, file, cb) {
    //เปลี่ยนชื่อไฟล์ (เพื่อป้องกันไฟล์ชื่อซ้ำกัน)
    cb(null, Date.now() + ".jpg");
  },
});

// start upload
const upload = multer({
  storage: storage,
});

router.get("/", async (req, res) => {
  //แสดงข้อมูลสินค้าในหน้าแรก ไฟล์ index.ejs
  try {
    //Code By Chat gpt
    const products = await Product.find().exec();
    res.render("index", { products });
  } catch (err) {
    console.log(err);
  }
});

router.get("/addProduct", (req, res) => {
  //แสดงหน้าบันทึกสินค้า ไฟล์ form.ejs
  if (req.session.login) {
    //ถ้าเป็นจริงจะเข้าหน้า form
    res.render("form");
  } else {
    res.render("admin"); //แต่ถ้าเป็น false จะอยู่หน้า login เหมือนเดิม
  }
});
router.get("/manage", async (req, res) => {
  //แสดงรายการสินค้า ไฟล์ manage.ejs
  if (req.session.login) {
    try {
      //Code By Chat gpt
      const products = await Product.find().exec();
      res.render("manage", { products });
    } catch (err) {
      console.log(err);
    }
  } else {
    res.render("admin");
  }
});
//ออกจากระบบ
router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    res.redirect("/manage");
  });
});

router.get("/delete/:id", (req, res) => {
  //ลบสินค้า ไฟล์ manage.ejs
  Product.findByIdAndDelete(req.params.id, { useFindAndModify: false }).exec();
  res.redirect("/manage");
  if (err) console.log(err);
});

router.post("/insert", upload.single("image"), (req, res) => {
  //บันทึกสินค้าลงในฐานข้อมูล ไฟล์ models/products.ejs
  let data = new Product({
    name: req.body.name,
    price: req.body.price,
    image: req.file.filename,
    description: req.body.description,
  });
  data.save();
  res.redirect("/");
  if (err) console.log(err);

  // try { Code By Chat gpt
  //     let data = new Product({
  //         name: req.body.name,
  //         price: req.body.price,
  //         image: req.file.filename,
  //         description: req.body.description
  //     })
  //     await data.save()

  //     res.redirect('/')
  // } catch (err) {
  //     console.log(err);
  // }
});

router.get("/:id", async (req, res) => {
  //รายละเอียดสินค้า product.ejs
  try {
    const doc = await Product.findOne({ _id: req.params.id }).exec();
    res.render("product", { product: doc });
  } catch (err) {
    console.log(err);
  }
});

router.post("/edit", async (req, res) => {
  //edit ข้อมูล ไฟล์ edit.ejs
  const doc = await Product.findOne({ _id: req.body.edit_id }).exec();
  res.render("edit", { product: doc });
});

router.post("/update", (req, res) => {
  //ข้อมูลใหม่ที่ถูกส่งมาจาก form แก้ไข
  const update_id = req.body.update_id;
  let data = {
    name: req.body.name,
    price: req.body.price,
    description: req.body.description,
  };
  //update ข้อมูล
  Product.findByIdAndUpdate(update_id, data, {
    useFindAndModify: false,
  }).exec();
  res.redirect("/manage");
});

router.post("/login", (req, res) => {
  //สร้าง cookie ทำระบบ login admin
  const username = req.body.username;
  const password = req.body.password;
  const timeExpire = 30000; // 10 วินาที หลังจากนั้นจะทำลายตัวเองทิ้ง

  if (username === "admin" && password === "123") {
    //สร้าง session
    req.session.username = username;
    req.session.password = password;
    req.session.login = true;
    req.session.cookie.maxAge = timeExpire;
    res.redirect("/manage");
  } else {
    res.render("404");
  }
});

module.exports = router;
