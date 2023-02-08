const path = require("path");
// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));
// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass
function create(req,res){
  const {data:{name,description,price,image_url}={}}=req.body
  const newDish={
    id: dishes.length+1,
    name,
    description,
    price,
    image_url,
  }
  dishes.push(newDish)
  res.status(201).json({data:newDish})
}

function bodyDataHas(propertyName) {
  return function (req, res, next) {
    const { data = {} } = req.body;
    if (data[propertyName]) {
      return next();
    }
    next({
        status: 400,
        message: `${propertyName}`
    });
  };
}
function checkPrice(req, res, next) {
  const { data: { price } = {} } = req.body;

  if (price>0&&typeof(price)==="number") {
    return next();
  }
  next({ status: 400, message: "${price}"});
}

function read(req,res){
 res.json({data:res.locals.dish})
}

function dishExisted(req,res,next){
  const dishId=req.params.dishId
  const foundDish=dishes.find((dish)=>dish.id===dishId)
  if(foundDish){ 
   res.locals.dish=foundDish
    return next()
  }next({
      status:404,  
      message:`undefined`
    })
}
function dishIdAbsentOrMatches(request, response, next) {
  const {data: {id}={}} = request.body;
  const dishId = request.params.dishId;
  if (!id || dishId === id) {
    return next();
  }
  next({
    status: 400,
    message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`,
  });
}   

function list(req,res){
  res.json({data:dishes})
}
function update(req,res,next){
  const dishId=req.params.dishId
  const foundDish=dishes.find((dish)=>dish.id===dishId)
  const { data: { name, description, price, image_url } = {} } = req.body;
  foundDish.name=name;
  foundDish.description=description;
  foundDish.price=price;
  foundDish.image_url=image_url;
  res.json({data:foundDish})
}
module.exports={
  create: [
      checkPrice,
      bodyDataHas("name"),
      bodyDataHas("description"),
      bodyDataHas("price"),
      bodyDataHas("image_url"),
      create,
    ],
  list,
  dishExisted,
  read: [dishExisted,read],
  update:[
    dishExisted,
    dishIdAbsentOrMatches,
    checkPrice,
    bodyDataHas("name"),
      bodyDataHas("description"),
      bodyDataHas("price"),
      bodyDataHas("image_url"),
      update,
  ],
}