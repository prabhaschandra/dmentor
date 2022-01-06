const express = require('express');

const router = express.Router();

const {
  getACenter,
  getAllCenters,
  getAllCentersNameAddress,
  addACenter,
  deleteACenter,
  editACenter,
} = require('../Controllers/CenterControllers');

router.get('/getAll', getAllCenters);
router.get('/getAllNameAddress', getAllCentersNameAddress);
router.get('/getACenter?', getACenter);

router.post('/add', addACenter);
router.delete('/?', deleteACenter);
router.put('/edit?', editACenter);

module.exports = router;
