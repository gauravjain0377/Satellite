# 🌳 Amazon Rainforest Deforestation Timelapse (2000–2025)

**Google Earth Engine analysis** visualizing vegetation loss via Landsat false-color composites.

[![Timelapse](amazon-deforestation.gif)](amazon-deforestation.gif)

**What you see**: Healthy forest = **bright red** (NIR reflectance). Deforested areas = **gray/brown** (exposed soil). [web:30]

## Latest frame (2025)
![2025 False-Color][file:46]

## How to recreate
1. Open [Google Earth Engine](https://code.earthengine.google.com/)
2. Paste `gee-script.js` → Run → Export video (Tasks tab)

## Key stats
| Year Range | Forest Loss Visible | Hotspots |
|------------|---------------------|----------|
| 2000–2010  | Moderate            | Rondônia |
| 2010–2020  | Rapid (soy/roads)   | Pará     |
| 2020–2025  | Ongoing             | Peru border |

**Tech**: Landsat 5/7/8, JavaScript (EE API), Cloud masking, Median composites.

⭐ Star if useful! | [YourName] | [LinkedIn/Portfolio]
