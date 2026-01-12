# Methodology: Amazon Deforestation Timelapse

This document provides a detailed explanation of the scientific and technical methodology used to create the Amazon deforestation timelapse visualization.

## 1. Study Area

### Geographic Bounds
- **West**: -74.0° longitude
- **East**: -44.0° longitude  
- **South**: -15.0° latitude
- **North**: 5.0° latitude

This region encompasses the core Amazon rainforest basin, covering significant portions of Brazil, Peru, Colombia, and Venezuela.

### Rationale
This bounding box captures:
- Major deforestation hotspots in Brazil (Rondônia, Pará states)
- Transboundary deforestation patterns
- Key river systems and road networks
- Representative sample of Amazon biome

## 2. Satellite Data Selection

### Landsat Timeline
- **Landsat 5 (2000-2011)**: Primary sensor for early 2000s
- **Landsat 7 (2012)**: Transition year (note: scan line corrector failure in 2003, minimal impact on 2012 data)
- **Landsat 8 (2013-2025)**: Modern sensor with improved radiometric resolution

### Collection 2, Tier 1, Level 2
- **Tier 1**: Highest quality, geodetically accurate
- **Level 2**: Surface reflectance (atmospherically corrected)
- **Collection 2**: Latest processing version with improved calibration

### Why These Sensors?
1. **Temporal Continuity**: 25+ years of consistent data
2. **Spatial Resolution**: 30m pixels balance detail and processing efficiency
3. **Spectral Bands**: NIR, Red, Green bands ideal for vegetation analysis
4. **Free & Open**: Publicly available via Google Earth Engine

## 3. Cloud Masking Strategy

### QA_PIXEL Band Analysis
The QA_PIXEL band contains quality assessment flags encoded as bits:

```javascript
// Bits 3 and 4 indicate cloud and cloud shadow
var cloudMask = qa.bitwiseAnd(1 << 3).or(qa.bitwiseAnd(1 << 4));
return image.updateMask(cloudMask.not());
```

### Why This Approach?
- **Automated**: No manual cloud identification needed
- **Consistent**: Same algorithm across all years
- **Reliable**: Based on Landsat Collection 2 quality flags
- **Efficient**: Fast processing in Google Earth Engine

### Limitations
- Some thin clouds may pass through
- Cloud shadows in complex terrain may be missed
- Annual median composite helps mitigate remaining cloud contamination

## 4. Annual Composite Creation

### Median Composite Method
For each year, all cloud-masked images are combined using the **median** value per pixel.

**Why Median?**
- **Noise Reduction**: Eliminates outliers (remaining clouds, sensor errors)
- **Temporal Representation**: Captures typical conditions for the year
- **Robust**: Less sensitive to extreme values than mean
- **Standard Practice**: Widely used in remote sensing

### Processing Steps
1. Filter images by date range (January 1 - December 31)
2. Apply cloud masking to each image
3. Select and calibrate bands (NIR, Red, Green)
4. Apply surface reflectance scaling: `multiply(0.0000275).add(-0.2)`
5. Compute median composite
6. Set temporal metadata (year, system:time_start)

### Band Selection by Sensor

**Landsat 5 & 7:**
- NIR: SR_B4 (0.76-0.90 μm)
- Red: SR_B3 (0.63-0.69 μm)
- Green: SR_B2 (0.52-0.60 μm)

**Landsat 8:**
- NIR: SR_B5 (0.85-0.88 μm)
- Red: SR_B4 (0.64-0.67 μm)
- Green: SR_B3 (0.53-0.59 μm)

*Note: Band numbers differ between sensors, but spectral ranges are similar*

## 5. Surface Reflectance Calibration

### Scaling Factor
```javascript
.multiply(0.0000275).add(-0.2)
```

This converts Landsat Collection 2 surface reflectance values (0-10000) to actual reflectance (0-1), with an offset correction.

### Why Calibrate?
- **True Reflectance**: Enables comparison across sensors
- **Visualization**: Proper scaling for display
- **Analysis**: Accurate spectral values for quantitative work

## 6. False-Color Visualization

### Band Mapping
- **NIR → Red Channel**: Vegetation appears bright red
- **Red → Green Channel**: Soil and water appear green/cyan
- **Green → Blue Channel**: Water and shadows appear blue

### Visualization Parameters
```javascript
{
  bands: ['NIR', 'Red', 'Green'],
  min: [0.0, 0.0, 0.0],
  max: [0.4, 0.3, 0.3],
  gamma: [1.2, 1.2, 1.2]
}
```

### Why False-Color?
1. **Vegetation Highlighting**: NIR strongly reflected by healthy leaves
2. **Deforestation Visibility**: Clear contrast between forest and cleared land
3. **Standard Practice**: Common in forestry and land use mapping
4. **Intuitive**: Red = healthy, Gray = cleared

### Scientific Basis
- **Chlorophyll Absorption**: Red light absorbed, NIR reflected
- **Cell Structure**: Spongy mesophyll in leaves reflects NIR strongly
- **Soil Properties**: Exposed soil reflects red/green more than NIR
- **Water Absorption**: Water absorbs NIR, appears dark

## 7. Temporal Organization

### Time Stamping
Each annual composite is assigned:
- **Year property**: For filtering and labeling
- **system:time_start**: Milliseconds since epoch (June 15 of each year)

### Why June 15?
- **Mid-Year**: Represents typical annual conditions
- **Dry Season**: Amazon dry season (June-August) has less cloud cover
- **Consistent**: Same date across all years for fair comparison

## 8. Video Export

### Export Parameters
- **Dimensions**: 1920px width (auto-calculates height)
- **Frame Rate**: 2 FPS (smooth but not too fast)
- **Format**: MP4 (default)
- **Region**: Amazon bounding box
- **Max Pixels**: 1e13 (allows large area processing)

### Processing Pipeline
1. Apply visualization to each annual composite
2. Sort by time
3. Create video collection
4. Export to Google Drive

## 9. Quality Assurance

### Validation Steps
1. **Visual Inspection**: Check for artifacts, cloud contamination
2. **Temporal Consistency**: Verify smooth transitions between years
3. **Spatial Accuracy**: Confirm geographic alignment
4. **Color Interpretation**: Verify false-color mapping is correct

### Known Limitations
- **Resolution**: 30m pixels miss small clearings (<1 hectare)
- **Cloud Gaps**: Some years may have more cloud contamination
- **Sensor Transitions**: Minor color shifts between Landsat 5/7/8
- **2012 Data**: Landsat 7 scan line corrector issues (minimal impact)

## 10. Reproducibility

### Code Structure
- **Modular Functions**: Separate functions for each sensor
- **Clear Comments**: Explains each step
- **Parameterized**: Easy to adjust dates, regions, visualization

### Requirements
- Google Earth Engine account
- Access to Landsat Collection 2
- Basic JavaScript knowledge

### Expected Processing Time
- **Initial Run**: 5-10 minutes (composite creation)
- **Video Export**: 30-60 minutes (depends on queue)
- **Total**: ~1-2 hours from start to download

## 11. Scientific Accuracy

### Data Quality
- **Source**: Official USGS/NASA Landsat data
- **Processing**: Standard remote sensing techniques
- **Validation**: Consistent with published deforestation studies

### Use Cases
- **Educational**: Teaching remote sensing and deforestation
- **Research**: Baseline for deforestation studies
- **Awareness**: Visualizing environmental change
- **Policy**: Supporting conservation discussions

## 12. Future Improvements

### Potential Enhancements
1. **NDVI Analysis**: Quantitative vegetation index
2. **Change Detection**: Automated deforestation detection
3. **Higher Resolution**: Sentinel-2 (10m) for detail
4. **Monthly Composites**: More granular temporal analysis
5. **Interactive Map**: Web-based exploration tool
6. **Statistics**: Area calculations, loss rates

---

This methodology follows remote sensing best practices and is suitable for educational and research purposes.
