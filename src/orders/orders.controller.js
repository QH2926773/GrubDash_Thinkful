const path = require("path");
// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass
function create(req,res,next){
  const {data:{deliverTo,mobileNumber,status,dishes}={}}=req.body
  const newOrder={
    id:nextId(),
    deliverTo,
    mobileNumber,
    status,
    dishes,    
  }
  orders.push(newOrder)
  res.status(201).json({data:newOrder})
}

function bodyNeedDeliverTo(req,res,next){
  const {data: {deliverTo}}=req.body
  if(!deliverTo){
    next({
       status: 400,
       message: "order needs deliverTo",
     });
  } return next()
}
function bodyNeedMobileNumber(req,res,next){
  const {data: {mobileNumber}}=req.body
  if(!mobileNumber){
    next({
       status: 400,
       message: "order needs mobileNumber",
     });
  } return next()
}
function bodyNeedStatus(req,res,next){
  const {data: {status}}=req.body
  if(status&& (status==="pending"|| status==="preparing"||status==="out-for-delivery"||status==="delivered")){
    return next()
  }
    next({
       status: 400,
       message: "order needs status",
     });
  }
function bodyNeedDishes(req,res,next){
  const {data:{dishes}}=req.body
  if(!dishes || !Array.isArray(dishes) || !dishes.length){
    next({
       status: 400,
       message: "order needs dishes",
     });
  } 
  res.locals.dishes=dishes
  next()
}

function orderStatusIsPending(req, res, next) {
  const { order } = res.locals;
  if (order.status === "pending") {
    next();
  }
  next({
    status: 400,
    message: "An order cannot be deleted unless it is pending",
  });
}

function dishQuantity(req, res, next) {
  const dishes=res.locals.dishes;
 
  for (let i = 0; i < dishes.length; i++) {
    if (
      !dishes[i].quantity ||
      (dishes[i].quantity <= 0) ||
      !Number.isInteger(dishes[i].quantity)
    ) {
      return next({
        status: 400,
        message: `Dish ${i} must have a quantity that is an integer greater than 0`,
      });
    }
  }
    next()

}


// const validateBody = (req, res, next)=>{
//   const {data: { deliverTo, mobileNumber,status, dishes } = {} }=req.body
//   if (!deliverTo || deliverTo === "") {
//     return next({
//       status: 400,
//       message: "deliverTo",
//     });
//   }else if (!mobileNumber || mobileNumber === "") {
//     return next({
//       status: 400,
//       message: "mobileNumber",
//     });

//   }
//   else if(!status || status==="" || !status.includes("pending","preparing","out-for-delivery","delivered")){
//     return next({
//       status: 400,
//       message: "status",
//     });

//   }
//     else if(!dishes || typeof(dishes)!=="array" ||dishes===""){
//     return next({
//       status: 400,
//       message: "dish",
//     });
//   }
//   else if(!dishes.quantity || dishes.quantity<=0 || NaN(dishes.quantity)){
//     return next({
//       status: 400,
//       message: `${dishes.quantity}`,
//     });
//   }
// }
// function bodyDataHas(propertyName) {
//   return function (req, res, next) {
//     const { data = {} } = req.body;
//     if (data[propertyName]) {
//       return next();
//     }
//     next({
//         status: 400,
//         message: `${propertyName}`
//     });
//   };
// }

function read(req,res){
  res.json({data:res.locals.order})
}
function list(req,res){
  res.json({data:orders})
}

function update(req,res,next){
  const orderId=req.params.orderId;
  const foundOrder=orders.find((order)=>order.id===orderId)
  const { data: { id,deliverTo, mobileNumber,status, dishes} = {} } = req.body;
  foundOrder.deliverTo=deliverTo;
  foundOrder.mobileNumber=mobileNumber;
  foundOrder.status=status;
  foundOrder.dishes=dishes; 
  res.json({data:foundOrder})
}


function orderExisted(req,res,next){
  const orderId=req.params.orderId
  const foundOrder=orders.find((order)=>order.id===orderId)
  if(foundOrder){ 
   res.locals.order=foundOrder
    return next()
  }next({
      status:404,  
      message:`${orderId}`
    })
}
function orderIdAbsentOrMatches(req, res, next) {
  const {data: { id }} = req.body;
  const orderId = req.params.orderId;
  if (!id || orderId === id) {
    return next();
  }
  next({
    status: 400,
    message: `Order id does not match route id. Order: ${id}, Route: ${orderId}`,
  });
}

function destroy(req,res,next){
  
  const orderId=req.params.orderId
 const index = orders.findIndex((order) =>order.id ===orderId);
 orders.splice(index, 1);
 res.sendStatus(204)

}



module.exports={
  create:[ 
     bodyNeedDeliverTo,
    bodyNeedMobileNumber,
    bodyNeedDishes,
    dishQuantity,
      create,
  ],
  list,
  orderExisted,
  update: [
    orderExisted,
    orderIdAbsentOrMatches,
    bodyNeedDeliverTo,
    bodyNeedMobileNumber,
    bodyNeedStatus,
    bodyNeedDishes,
   dishQuantity,
    update,
  ],
  read: [orderExisted,read],
  delete: [orderExisted, orderStatusIsPending,destroy],
}