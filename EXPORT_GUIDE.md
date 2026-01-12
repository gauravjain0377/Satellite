# Export Guide: Creating Your Own Timelapse

This guide provides step-by-step instructions for exporting the Amazon deforestation timelapse video from Google Earth Engine.

## Prerequisites

1. **Google Account**: You need a Google account (Gmail, Google Workspace, etc.)
2. **Earth Engine Access**: Sign up at [earthengine.google.com](https://earthengine.google.com/)
   - Approval is usually instant for personal accounts
   - Educational/research accounts may take 1-2 days
3. **Google Drive**: Ensure you have space (videos can be 100-500 MB)

## Step-by-Step Instructions

### Step 1: Access Google Earth Engine

1. Go to [Google Earth Engine Code Editor](https://code.earthengine.google.com/)
2. Sign in with your Google account
3. If prompted, accept the terms of service

### Step 2: Open the Script

1. In the code editor, click **New** → **File**
2. Name it `amazon_deforestation_timelapse.js`
3. Copy the entire contents of `amazon_deforestation_timelapse.js` from this repository
4. Paste into the editor

### Step 3: Review the Script

The script is ready to run, but you can customize:

**Region (Optional):**
```javascript
var amazonBounds = ee.Geometry.Rectangle([
  -74.0, -15.0,  // West, South
  -44.0, 5.0     // East, North
]);
```
Change these coordinates to focus on a specific area.

**Export Resolution (Optional):**
```javascript
dimensions: 1920,  // Change to 1280, 2560, or 3840 for different resolutions
```

**Frame Rate (Optional):**
```javascript
framesPerSecond: 2,  // Change to 1, 3, or 4
```

### Step 4: Run the Script

1. Click the **Run** button (or press `Ctrl+Enter`)
2. Wait for processing (5-10 minutes)
3. Check the **Console** tab for progress messages
4. You should see: "Video export task started!"

### Step 5: Monitor the Export Task

1. Click the **Tasks** tab (right panel)
2. Find the task: `Amazon_Deforestation_Timelapse_2000_2025`
3. Status will show:
   - **READY**: Waiting to start
   - **RUNNING**: Currently processing
   - **COMPLETED**: Finished successfully
   - **FAILED**: Error occurred (check details)

### Step 6: Start the Export

1. In the **Tasks** tab, click **RUN** next to your task
2. A dialog will appear
3. Click **RUN** again to confirm
4. The task will move to "RUNNING" status

### Step 7: Wait for Completion

- **Processing Time**: 30-60 minutes (depends on server load)
- **You can close the browser**: The task runs on Google's servers
- **Check back later**: Refresh the Tasks tab to see status

### Step 8: Download the Video

1. Once status shows **COMPLETED**:
   - Go to [Google Drive](https://drive.google.com)
   - Navigate to the **EarthEngine** folder
   - Find: `amazon_deforestation_timelapse.mp4`
2. Right-click → **Download**
3. The video will be saved to your computer

## Troubleshooting

### Task Fails Immediately

**Possible Causes:**
- **Quota Exceeded**: You've hit daily export limits
  - **Solution**: Wait 24 hours or request quota increase
- **Invalid Region**: Coordinates are incorrect
  - **Solution**: Check bounding box values
- **Script Error**: Syntax or logic error
  - **Solution**: Check Console for error messages

### Task Stuck on "READY"

**Solution:**
- Click **RUN** manually in Tasks tab
- Sometimes tasks need manual start

### Video is Too Large

**Solution:**
- Reduce `dimensions` parameter (e.g., 1280 instead of 1920)
- Reduce `framesPerSecond` (e.g., 1 instead of 2)
- Crop the region to a smaller area

### Video Quality is Poor

**Solution:**
- Increase `dimensions` (e.g., 2560 or 3840)
- Check visualization parameters (min/max values)
- Ensure good cloud masking

### No Video in Google Drive

**Possible Causes:**
- Task still processing (check Tasks tab)
- Wrong Google account (check which account is signed in)
- Drive folder not created (check root of Drive)

**Solution:**
- Wait for task completion
- Check all Google accounts
- Search Drive for "amazon_deforestation"

## Advanced Customization

### Change Time Range

```javascript
// Edit these lines:
var l5Years = ee.List.sequence(2000, 2011);  // Change years
var l7Years = ee.List([2012]);
var l8Years = ee.List.sequence(2013, 2025);  // Change years
```

### Change Visualization Colors

```javascript
var visParams = {
  bands: ['NIR', 'Red', 'Green'],
  min: [0.0, 0.0, 0.0],      // Adjust for darker/brighter
  max: [0.4, 0.3, 0.3],      // Adjust contrast
  gamma: [1.2, 1.2, 1.2]     // Adjust brightness curve
};
```

### Export as Images Instead of Video

Replace the `Export.video.toDrive()` section with:

```javascript
// Export each year as a separate image
var years = ee.List.sequence(2000, 2025);
years.getInfo().forEach(function(year) {
  var yearImage = imageCollection
    .filter(ee.Filter.eq('year', year))
    .first();
  
  Export.image.toDrive({
    image: yearImage.visualize(visParams),
    description: 'Amazon_' + year,
    folder: 'EarthEngine',
    fileNamePrefix: 'amazon_' + year,
    region: amazonBounds,
    dimensions: 1920,
    maxPixels: 1e13
  });
});
```

### Export to Google Cloud Storage

Replace `Export.video.toDrive()` with:

```javascript
Export.video.toCloudStorage({
  collection: videoCollection,
  description: 'Amazon_Deforestation_Timelapse_2000_2025',
  bucket: 'your-bucket-name',
  fileNamePrefix: 'amazon_deforestation_timelapse',
  region: amazonBounds,
  dimensions: 1920,
  framesPerSecond: 2,
  maxPixels: 1e13
});
```

## Best Practices

1. **Test First**: Run with a smaller region or fewer years to test
2. **Check Quotas**: Monitor your daily export quota in Earth Engine
3. **Be Patient**: Large exports take time, don't cancel prematurely
4. **Save Script**: Keep a copy of your working script
5. **Document Changes**: Note any customizations you make

## Export Limits

Google Earth Engine has daily quotas:
- **Video Exports**: ~5-10 per day (varies by account type)
- **Image Exports**: ~1000 per day
- **Compute Time**: Varies by account type

**Tip**: Plan your exports and don't run multiple large exports simultaneously.

## Getting Help

If you encounter issues:

1. **Check Console**: Look for error messages
2. **Review Script**: Ensure all code is correct
3. **Earth Engine Forum**: [gis.stackexchange.com](https://gis.stackexchange.com/questions/tagged/google-earth-engine)
4. **Documentation**: [developers.google.com/earth-engine](https://developers.google.com/earth-engine)

## Next Steps

After exporting:

1. **Convert Format** (if needed): Use FFmpeg or online converters
2. **Add Labels**: Use video editing software to add year labels
3. **Create GIF**: Convert MP4 to GIF for web use
4. **Share**: Upload to YouTube, Vimeo, or your website

---

**Happy Exporting!** 🚀

For questions about the methodology, see [METHODOLOGY.md](METHODOLOGY.md)
