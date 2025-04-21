const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationControllers');

router.get('/sehirler', locationController.getSehirler);
router.get('/ilceler', locationController.getIlceler);
router.get('/mahalleler', locationController.getMahalleler);
router.get('/koyler', locationController.getKoyler);
router.get('/sokaklar', locationController.getSokaklar);
router.get('/isp', locationController.getIsp);
router.get('/isp_struct', locationController.getIspStruct);
router.get('/isp_struct_type', locationController.getIspStructType);
router.post('/isp-struct-data', locationController.saveIspStructData);
router.get('/isp-struct-data', locationController.getIspStructData);

module.exports = router;