const express= require('express');
const path = require('path');
const safetyResourcesController = require("../controllers/safetyResourcesController");
const router= express.Router();

router.post("/adminSafetyResources", async (req,res )=> safetyResourcesController.adminSafetyResources(req,res));
router.put("/updateSafetyResource/:id", async (req,res) => safetyResourcesController.updateSafetyResource(req,res));
router.delete('/deleteSafetyResources/:id', async (req,res) => safetyResourcesController.deleteOneSafetyResources(req,res));
router.get("/getSafetyResource/:id", async (req,res) => safetyResourcesController.getSafetyResource(req,res)); 
router.get('/userSafetyResources', async (req,res) => safetyResourcesController.userSafetyResources(req,res));
module.exports = router;