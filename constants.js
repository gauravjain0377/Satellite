/**
 * Constants for Amazon Deforestation Timelapse Project
 * Google Earth Engine Script
 */

// Amazon Rainforest bounding box [West, South, East, North]
var AMAZON_BOUNDS = ee.Geometry.Rectangle([
  -74.0, -15.0,  // West, South
  -44.0, 5.0     // East, North
]);

// Temporal configuration
var START_YEAR = 2000;
var END_YEAR = 2025;
var LANDSAT5_START = 2000;
var LANDSAT5_END = 2011;
var LANDSAT7_YEAR = 2012;
var LANDSAT8_START = 2013;
var LANDSAT8_END = 2025;

// Landsat Collection 2 dataset IDs
var LANDSAT5_COLLECTION = 'LANDSAT/LT05/C02/T1_L2';
var LANDSAT7_COLLECTION = 'LANDSAT/LE07/C02/T1_L2';
var LANDSAT8_COLLECTION = 'LANDSAT/LC08/C02/T1_L2';

// Band mappings by sensor
var LANDSAT5_BANDS = {
  NIR: 'SR_B4',
  RED: 'SR_B3',
  GREEN: 'SR_B2'
};

var LANDSAT7_BANDS = {
  NIR: 'SR_B4',
  RED: 'SR_B3',
  GREEN: 'SR_B2'
};

var LANDSAT8_BANDS = {
  NIR: 'SR_B5',
  RED: 'SR_B4',
  GREEN: 'SR_B3'
};

// Surface reflectance scaling factors
var SCALE_FACTOR = 0.0000275;
var OFFSET = -0.2;

// Cloud masking configuration
var QA_BAND = 'QA_PIXEL';
var CLOUD_BIT = 3;
var SHADOW_BIT = 4;

// Visualization parameters
var VIS_PARAMS = {
  bands: ['NIR', 'Red', 'Green'],
  min: [0.0, 0.0, 0.0],
  max: [0.4, 0.3, 0.3],
  gamma: [1.2, 1.2, 1.2]
};

// Export configuration
var EXPORT_DIMENSIONS = 1920;
var EXPORT_FPS = 2;
var EXPORT_MAX_PIXELS = 1e13;
var EXPORT_FOLDER = 'EarthEngine';
var EXPORT_PREFIX = 'amazon_deforestation_timelapse';

// Map center and zoom
var MAP_CENTER = [-59.0, -5.0];
var MAP_ZOOM = 6;

// Time calculation (mid-year: June 15)
var DAYS_TO_JUNE_15 = 166;
var MS_PER_DAY = 24 * 60 * 60 * 1000;
var MS_PER_YEAR = 365.25 * MS_PER_DAY;
