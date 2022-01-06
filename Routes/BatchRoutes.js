const express = require('express');

// const { protect } = require('../Middleware/AuthMiddleware');
const router = express.Router();

const {
  getABatch,
  getAllBatches,
  getAllBatchesByCourse,
  addBatch,
  deleteABatch,
  editABatch,
  getAllName,
  getAllNameByFilters,
  getAllDemoBatchesByCenter,
} = require('../Controllers/BatchControllers');

router.get('/getAll', getAllBatches);
router.get('/getAllName', getAllName);
router.post('/getAllNameByFilters', getAllNameByFilters);
router.get('/getAllBatchesByCourse', getAllBatchesByCourse);
router.get('/getAllDemoBatchesByCenter', getAllDemoBatchesByCenter);
router.get('/getABatch?', getABatch);

router.post('/add', addBatch);
router.delete('/?', deleteABatch);
router.put('/edit?', editABatch);

//classes routes

module.exports = router;
