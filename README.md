# From Pixels to Decisions

*How computer vision turns satellite imagery into useful information.*

A one-page educational website for an introductory Programming Interactivity course. It explains, step by step and with small interactive demos, how geospatial computer vision turns satellite images into geographic information that people can use to make decisions.

## Overview

A satellite image is only a grid of pixels. Computer vision can find objects in those pixels, such as buildings. Georeferencing then links each detected object to a real place on Earth. The result is geographic data (for example building outlines with longitude and latitude) that can be shown on a map, measured, filtered and combined with other information.

## Workflow shown on the website

1. **Start with satellite imagery.** A large image covers the study area. (Several images may first be combined into one, called mosaicking.)
2. **Divide it into tiles.** Large images are cut into smaller tiles so an AI system can process them.
3. **Use image segmentation.** The AI outlines the exact shape of each object, such as a building, and each shape can be saved as a polygon.
4. **Combine the predictions.** Results from separate tiles are merged and cleaned up (post-processing), especially where a building was cut by a tile edge.
5. **Georeference the results.** Pixel positions are converted to real-world coordinates so the buildings can be displayed on a map.

## Interactive features

- **Step 2, tiling demo:** three buttons switch between the original image, the image with a grid, and four separate tiles.
- **Step 4, combining demo:** one button switches between the separate results for each tile and the combined result.
- **Real satellite image example:** three buttons switch between the plain image, building outlines and filled building polygons, plus a button that shows or hides an 8-tile grid drawn on top.
- **Step 5, georeferencing:** two side-by-side drawings compare a position in the image (pixels) with a position on the map (latitude and longitude), followed by an interactive Leaflet map. It loads a GeoJSON file of 19 building polygons, draws them on satellite background pictures, and shows a building's ID when it is clicked.
- **Case study: Solar Site Identification:** a Leaflet map of multiple buildings coloured by annual energy value, with filters (minimum annual energy, roof material, minimum roof area, solar already installed, building ID search, reset), a button that hides or shows the building outlines, a legend, a building count and a details panel for the clicked building.

## Technologies

- HTML, CSS and JavaScript (no frameworks, no build step)
- [Leaflet](https://leafletjs.com/) 1.9.4, loaded from the unpkg CDN, for the two maps
- GeoJSON files for the building data
- Esri World Imagery tiles as the map background (no API key)

## How to run locally

1. Download or clone this repository and open the folder in VS Code.
2. Install the **Live Server** extension (if you do not have it yet).
3. Right-click `index.html` and choose **Open with Live Server**.

A local server is **required**: the maps load their GeoJSON files with `fetch`, which browsers block when you simply double-click `index.html`. An **internet connection** is also needed for Leaflet and the satellite background pictures. Everything else works offline.

## Limitations

- The demos use **prepared images**. The page does **not** run any AI model, does not cut or process any image, and does not detect buildings itself. Switching views only shows and hides pictures that were made in advance.
- The Step 5 map shows pre-made building polygons stored in a GeoJSON file.
- The Solar Site Identification demo uses **sample data**: its building IDs start with `DEMO-`. Energy values are illustrative only and are not real solar assessments.
- The colour limits in the solar map are fixed numbers chosen for the sample file.

## Project structure

```
index.html      page content
style.css       styling
script.js       all interactions
assets/         images (JPG, SVG)
data/           GeoJSON files used by the two maps
```
