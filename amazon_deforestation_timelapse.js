// Amazon Rainforest Deforestation Timelapse (2000-2025)
// False-color visualization: Vegetation appears BRIGHT RED

// Amazon Rainforest bounding box
var amazonBounds = ee.Geometry.Rectangle([
  -74.0, -15.0,  // West, South
  -44.0, 5.0     // East, North
]);

// Function to mask clouds for Landsat 5 (Collection 2)
function maskCloudsL5(image) {
  var qa = image.select('QA_PIXEL');
  var cloudMask = qa.bitwiseAnd(1 << 3).or(qa.bitwiseAnd(1 << 4));
  return image.updateMask(cloudMask.not());
}

// Function to mask clouds for Landsat 7 (Collection 2)
function maskCloudsL7(image) {
  var qa = image.select('QA_PIXEL');
  var cloudMask = qa.bitwiseAnd(1 << 3).or(qa.bitwiseAnd(1 << 4));
  return image.updateMask(cloudMask.not());
}

// Function to mask clouds for Landsat 8
function maskCloudsL8(image) {
  var qa = image.select('QA_PIXEL');
  var cloudMask = qa.bitwiseAnd(1 << 3).or(qa.bitwiseAnd(1 << 4));
  return image.updateMask(cloudMask.not());
}

// Helper function to get time in milliseconds for a year (mid-year: June 15)
// Calculates milliseconds since Unix epoch (Jan 1, 1970)
function getYearTimeMillis(year) {
  var yearNum = ee.Number(year);
  // Milliseconds from 1970-01-01 to the given year
  var yearsSince1970 = yearNum.subtract(1970);
  // Approximate milliseconds per year (accounting for leap years)
  var msPerYear = 365.25 * 24 * 60 * 60 * 1000;
  // Days from Jan 1 to June 15: Jan(31) + Feb(28) + Mar(31) + Apr(30) + May(31) + 15 = 166 days
  var daysToJune15 = 166;
  var msToJune15 = daysToJune15 * 24 * 60 * 60 * 1000;
  // Calculate total milliseconds
  return yearsSince1970.multiply(msPerYear).add(msToJune15);
}

// Function to create annual composite from Landsat 5
function createL5Composite(year) {
  var yearStr = ee.String(ee.Number(year).format('%d'));
  var startDate = yearStr.cat('-01-01');
  var endDate = yearStr.cat('-12-31');
  var collection = ee.ImageCollection('LANDSAT/LT05/C02/T1_L2')
    .filterBounds(amazonBounds)
    .filterDate(startDate, endDate)
    .map(maskCloudsL5)
    .map(function(image) {
      return image.select(['SR_B4', 'SR_B3', 'SR_B2'], ['NIR', 'Red', 'Green'])
        .multiply(0.0000275).add(-0.2);
    });
  var composite = collection.median();
  var timeMillis = getYearTimeMillis(year);
  return composite.set('year', year).set('system:time_start', timeMillis);
}

// Function to create annual composite from Landsat 7
function createL7Composite(year) {
  var yearStr = ee.String(ee.Number(year).format('%d'));
  var startDate = yearStr.cat('-01-01');
  var endDate = yearStr.cat('-12-31');
  var collection = ee.ImageCollection('LANDSAT/LE07/C02/T1_L2')
    .filterBounds(amazonBounds)
    .filterDate(startDate, endDate)
    .map(maskCloudsL7)
    .map(function(image) {
      return image.select(['SR_B4', 'SR_B3', 'SR_B2'], ['NIR', 'Red', 'Green'])
        .multiply(0.0000275).add(-0.2);
    });
  var composite = collection.median();
  var timeMillis = getYearTimeMillis(year);
  return composite.set('year', year).set('system:time_start', timeMillis);
}

// Function to create annual composite from Landsat 8
function createL8Composite(year) {
  var yearStr = ee.String(ee.Number(year).format('%d'));
  var startDate = yearStr.cat('-01-01');
  var endDate = yearStr.cat('-12-31');
  var collection = ee.ImageCollection('LANDSAT/LC08/C02/T1_L2')
    .filterBounds(amazonBounds)
    .filterDate(startDate, endDate)
    .map(maskCloudsL8)
    .map(function(image) {
      return image.select(['SR_B5', 'SR_B4', 'SR_B3'], ['NIR', 'Red', 'Green'])
        .multiply(0.0000275).add(-0.2);
    });
  var composite = collection.median();
  var timeMillis = getYearTimeMillis(year);
  return composite.set('year', year).set('system:time_start', timeMillis);
}

// Create composites for each year range
var l5Years = ee.List.sequence(2000, 2011);
var l7Years = ee.List([2012]);
var l8Years = ee.List.sequence(2013, 2025);

var l5Images = l5Years.map(createL5Composite);
var l7Images = l7Years.map(createL7Composite);
var l8Images = l8Years.map(createL8Composite);

// Merge all images into one collection and sort by time
var allImages = l5Images.cat(l7Images).cat(l8Images);
var imageCollection = ee.ImageCollection.fromImages(allImages)
  .sort('system:time_start');

// Visualization parameters for false-color (NIR=Red, Red=Green, Green=Blue)
// This makes vegetation appear BRIGHT RED
var visParams = {
  bands: ['NIR', 'Red', 'Green'],
  min: [0.0, 0.0, 0.0],
  max: [0.4, 0.3, 0.3],
  gamma: [1.2, 1.2, 1.2]
};

// Add the most recent image to the map
var latestImage = imageCollection.sort('system:time_start', false).first();
Map.addLayer(latestImage, visParams, 'Latest False-Color Composite');
Map.setCenter(-59.0, -5.0, 6);
Map.setOptions('SATELLITE');

// Create video collection with visualization applied and preserve time properties
var videoCollection = imageCollection.map(function(image) {
  var visImage = image.visualize(visParams);
  return visImage.copyProperties(image, ['year', 'system:time_start']);
}).sort('system:time_start');

// Print timelapse preview in Console
print('Amazon Deforestation Timelapse Preview (2000-2025)');
print(ui.Thumbnail({
  image: videoCollection,
  params: {
    dimensions: 512,
    region: amazonBounds,
    framesPerSecond: 2
  },
  style: {
    position: 'bottom-center',
    stretch: 'both',
    margin: '0px auto',
    maxHeight: '400px'
  }
}));

// Export video to Google Drive
// Using 'dimensions' to limit output size (max width ~10,000 pixels)
// This automatically adjusts scale to fit the region within the dimension limit
Export.video.toDrive({
  collection: videoCollection,
  description: 'Amazon_Deforestation_Timelapse_2000_2025',
  folder: 'EarthEngine',
  fileNamePrefix: 'amazon_deforestation_timelapse',
  region: amazonBounds,
  dimensions: 1920,  // Max width in pixels (Earth Engine limit is ~10,000)
  framesPerSecond: 2,
  maxPixels: 1e13
});

print('Video export task started! Check the Tasks tab to monitor progress.');
print('The video will be exported to your Google Drive in the "EarthEngine" folder.');

