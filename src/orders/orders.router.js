const path = require("path");
const router = require("express").Router();
const controller = require("./orders.controller");
const methodsNotAllowed = require(path.resolve("src/errors/methodNotAllowed"))

// TODO: Implement the /orders routes needed to make the tests pass


router
  .route("/:orderId")
  .get(controller.read)
  .put(controller.update)
  .delete(controller.delete)
  .all(methodsNotAllowed)

router
  .route("/").get(controller.list).post(controller.create).all(methodsNotAllowed)

  



module.exports = router;

