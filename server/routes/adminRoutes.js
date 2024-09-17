const express= require('express');
const path = require('path');
const adminController= require("../controllers/adminController");
const { deleteOneSafetyResources } = require("../controllers/adminController");
const router= express.Router();

router.post("/adminSafetyResources", async (req,res )=> adminController.adminSafetyResources(req,res));
router.put("/updateSafetyResource/:id", async (req,res) => adminController.updateSafetyResource(req,res));
router.delete('/deleteSafetyResources/:id', deleteOneSafetyResources);

module.exports = router;