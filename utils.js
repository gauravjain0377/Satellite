/**
 * Utility Functions for Amazon Deforestation Timelapse
 * Google Earth Engine Helper Functions
 */

/**
 * Get time in milliseconds for a year (mid-year: June 15)
 * @param {ee.Number} year - The year
 * @returns {ee.Number} Milliseconds since Unix epoch
 */
function getYearTimeMillis(year) {
  var yearNum = ee.Number(year);
  var yearsSince1970 = yearNum.subtract(1970);
  var msPerYear = 365.25 * 24 * 60 * 60 * 1000;
  var daysToJune15 = 166;
  var msToJune15 = daysToJune15 * 24 * 60 * 60 * 1000;
  return yearsSince1970.multiply(msPerYear).add(msToJune15);
}

/**
 * Mask clouds for Landsat 5 (Collection 2)
 * @param {ee.Image} image - Landsat 5 image
 * @returns {ee.Image} Cloud-masked image
 */
function maskCloudsL5(image) {
  var qa = image.select('QA_PIXEL');
  var cloudMask = qa.bitwiseAnd(1 << 3).or(qa.bitwiseAnd(1 << 4));
  return image.updateMask(cloudMask.not());
}

/**
 * Mask clouds for Landsat 7 (Collection 2)
 * @param {ee.Image} image - Landsat 7 image
 * @returns {ee.Image} Cloud-masked image
 */
function maskCloudsL7(image) {
  var qa = image.select('QA_PIXEL');
  var cloudMask = qa.bitwiseAnd(1 << 3).or(qa.bitwiseAnd(1 << 4));
  return image.updateMask(cloudMask.not());
}

/**
 * Mask clouds for Landsat 8 (Collection 2)
 * @param {ee.Image} image - Landsat 8 image
 * @returns {ee.Image} Cloud-masked image
 */
function maskCloudsL8(image) {
  var qa = image.select('QA_PIXEL');
  var cloudMask = qa.bitwiseAnd(1 << 3).or(qa.bitwiseAnd(1 << 4));
  return image.updateMask(cloudMask.not());
}

/**
 * Apply surface reflectance scaling to Landsat image
 * @param {ee.Image} image - Landsat image
 * @returns {ee.Image} Scaled image
 */
function applyScaling(image) {
  return image.multiply(0.0000275).add(-0.2);
}

/**
 * Select and rename bands for Landsat 5
 * @param {ee.Image} image - Landsat 5 image
 * @returns {ee.Image} Image with renamed bands
 */
function selectBandsL5(image) {
  return image.select(['SR_B4', 'SR_B3', 'SR_B2'], ['NIR', 'Red', 'Green']);
}

/**
 * Select and rename bands for Landsat 7
 * @param {ee.Image} image - Landsat 7 image
 * @returns {ee.Image} Image with renamed bands
 */
function selectBandsL7(image) {
  return image.select(['SR_B4', 'SR_B3', 'SR_B2'], ['NIR', 'Red', 'Green']);
}

/**
 * Select and rename bands for Landsat 8
 * @param {ee.Image} image - Landsat 8 image
 * @returns {ee.Image} Image with renamed bands
 */
function selectBandsL8(image) {
  return image.select(['SR_B5', 'SR_B4', 'SR_B3'], ['NIR', 'Red', 'Green']);
}

/**
 * Create annual composite from Landsat 5
 * @param {number} year - Year to create composite for
 * @param {ee.Geometry} bounds - Region bounds
 * @returns {ee.Image} Annual composite
 */
function createL5Composite(year, bounds) {
  var yearStr = ee.String(ee.Number(year).format('%d'));
  var startDate = yearStr.cat('-01-01');
  var endDate = yearStr.cat('-12-31');
  
  var collection = ee.ImageCollection('LANDSAT/LT05/C02/T1_L2')
    .filterBounds(bounds)
    .filterDate(startDate, endDate)
    .map(maskCloudsL5)
    .map(function(image) {
      return applyScaling(selectBandsL5(image));
    });
  
  var composite = collection.median();
  var timeMillis = getYearTimeMillis(year);
  return composite.set('year', year).set('system:time_start', timeMillis);
}

/**
 * Create annual composite from Landsat 7
 * @param {number} year - Year to create composite for
 * @param {ee.Geometry} bounds - Region bounds
 * @returns {ee.Image} Annual composite
 */
function createL7Composite(year, bounds) {
  var yearStr = ee.String(ee.Number(year).format('%d'));
  var startDate = yearStr.cat('-01-01');
  var endDate = yearStr.cat('-12-31');
  
  var collection = ee.ImageCollection('LANDSAT/LE07/C02/T1_L2')
    .filterBounds(bounds)
    .filterDate(startDate, endDate)
    .map(maskCloudsL7)
    .map(function(image) {
      return applyScaling(selectBandsL7(image));
    });
  
  var composite = collection.median();
  var timeMillis = getYearTimeMillis(year);
  return composite.set('year', year).set('system:time_start', timeMillis);
}

/**
 * Create annual composite from Landsat 8
 * @param {number} year - Year to create composite for
 * @param {ee.Geometry} bounds - Region bounds
 * @returns {ee.Image} Annual composite
 */
function createL8Composite(year, bounds) {
  var yearStr = ee.String(ee.Number(year).format('%d'));
  var startDate = yearStr.cat('-01-01');
  var endDate = yearStr.cat('-12-31');
  
  var collection = ee.ImageCollection('LANDSAT/LC08/C02/T1_L2')
    .filterBounds(bounds)
    .filterDate(startDate, endDate)
    .map(maskCloudsL8)
    .map(function(image) {
      return applyScaling(selectBandsL8(image));
    });
  
  var composite = collection.median();
  var timeMillis = getYearTimeMillis(year);
  return composite.set('year', year).set('system:time_start', timeMillis);
}

/**
 * Create complete image collection for all years
 * @param {ee.Geometry} bounds - Region bounds
 * @param {number} startYear - Start year
 * @param {number} endYear - End year
 * @returns {ee.ImageCollection} Sorted image collection
 */
function createImageCollection(bounds, startYear, endYear) {
  var l5Years = ee.List.sequence(2000, 2011);
  var l7Years = ee.List([2012]);
  var l8Years = ee.List.sequence(2013, 2025);
  
  var l5Images = l5Years.map(function(year) {
    return createL5Composite(year, bounds);
  });
  
  var l7Images = l7Years.map(function(year) {
    return createL7Composite(year, bounds);
  });
  
  var l8Images = l8Years.map(function(year) {
    return createL8Composite(year, bounds);
  });
  
  var allImages = l5Images.cat(l7Images).cat(l8Images);
  return ee.ImageCollection.fromImages(allImages).sort('system:time_start');
}
