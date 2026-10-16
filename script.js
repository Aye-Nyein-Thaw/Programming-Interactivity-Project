// ===== Interaction 1 (Step 2): original image -> grid -> tiles =====

// Find the three buttons, the three views and the status text
var originalButton = document.getElementById("original-button");
var gridButton = document.getElementById("grid-button");
var tilesButton = document.getElementById("tiles-button");

var originalView = document.getElementById("original-view");
var gridView = document.getElementById("grid-view");
var tilesView = document.getElementById("tiles-view");

var tilingStatus = document.getElementById("tiling-status");

// This helper does the work for all three buttons:
// 1. hide all three views and switch all three buttons "off"
// 2. show only the chosen view and switch its button "on"
function showTilingView(viewToShow, buttonToSelect, message) {
  originalView.classList.add("hidden");
  gridView.classList.add("hidden");
  tilesView.classList.add("hidden");

  originalButton.setAttribute("aria-pressed", "false");
  gridButton.setAttribute("aria-pressed", "false");
  tilesButton.setAttribute("aria-pressed", "false");

  viewToShow.classList.remove("hidden");
  buttonToSelect.setAttribute("aria-pressed", "true");
  tilingStatus.textContent = message;
}

// One small function for each button
function showOriginalView() {
  showTilingView(
    originalView,
    originalButton,
    "Showing: the original large image.",
  );
}

function showGridView() {
  showTilingView(
    gridView,
    gridButton,
    "Showing: the same image with a grid. The grid shows where it will be divided.",
  );
}

function showTilesView() {
  showTilingView(
    tilesView,
    tilesButton,
    "Showing: four separate tiles cut from the same image.",
  );
}

// Run the matching function when a button is clicked
originalButton.addEventListener("click", showOriginalView);
gridButton.addEventListener("click", showGridView);
tilesButton.addEventListener("click", showTilesView);

// ===== Interaction 2 (Step 4): separate tile results -> combined results =====

var combineResultsButton = document.getElementById("combine-results-button");
var tileResultsView = document.getElementById("tile-results-view");
var combinedResultsView = document.getElementById("combined-results-view");
var resultsStatus = document.getElementById("results-status");

// This variable remembers which view is showing
var areResultsCombined = false;

function toggleResults() {
  if (areResultsCombined === false) {
    // Show the combined results, hide the separate tile results
    tileResultsView.classList.add("hidden");
    combinedResultsView.classList.remove("hidden");
    combineResultsButton.textContent = "Show separate results";
    combineResultsButton.setAttribute("aria-pressed", "true");
    resultsStatus.textContent = "Showing: combined results for the whole area.";
    areResultsCombined = true;
  } else {
    // Go back to the separate results
    combinedResultsView.classList.add("hidden");
    tileResultsView.classList.remove("hidden");
    combineResultsButton.textContent = "Combine results";
    combineResultsButton.setAttribute("aria-pressed", "false");
    resultsStatus.textContent = "Showing: separate results for each tile.";
    areResultsCombined = false;
  }
}

// Run the function every time the button is clicked
combineResultsButton.addEventListener("click", toggleResults);

// ===== Interaction 3 (real example, between Step 4 and Step 5): one real satellite scene, three prepared views =====

// Find the three buttons, the three images and the status text
var scenePlainButton = document.getElementById("scene-plain-button");
var sceneOutlineButton = document.getElementById("scene-outline-button");
var sceneFilledButton = document.getElementById("scene-filled-button");

var scenePlain = document.getElementById("scene-plain");
var sceneOutline = document.getElementById("scene-outline");
var sceneFilled = document.getElementById("scene-filled");

var sceneStatus = document.getElementById("scene-status");

// Same idea as showTilingView above:
// hide all three images, switch all buttons "off",
// then show the chosen image and switch its button "on"
function showScene(imageToShow, buttonToSelect, message) {
  scenePlain.classList.add("hidden");
  sceneOutline.classList.add("hidden");
  sceneFilled.classList.add("hidden");

  scenePlainButton.setAttribute("aria-pressed", "false");
  sceneOutlineButton.setAttribute("aria-pressed", "false");
  sceneFilledButton.setAttribute("aria-pressed", "false");

  imageToShow.classList.remove("hidden");
  buttonToSelect.setAttribute("aria-pressed", "true");
  sceneStatus.textContent = message;
}

function showPlainScene() {
  showScene(
    scenePlain,
    scenePlainButton,
    "Showing: the satellite image without any drawing.",
  );
}

function showOutlineScene() {
  showScene(
    sceneOutline,
    sceneOutlineButton,
    "Showing: building outlines (polygons) drawn on the image.",
  );
}

function showFilledScene() {
  showScene(
    sceneFilled,
    sceneFilledButton,
    "Showing: building polygons filled in, so you can see the area each building covers.",
  );
}

scenePlainButton.addEventListener("click", showPlainScene);
sceneOutlineButton.addEventListener("click", showOutlineScene);
sceneFilledButton.addEventListener("click", showFilledScene);

// ----- Tile grid on top of the scene (on / off) -----

var gridToggleButton = document.getElementById("grid-toggle-button");
var sceneGrid = document.getElementById("scene-grid");

// This variable remembers whether the grid is showing
var isGridVisible = false;

function toggleTileGrid() {
  if (isGridVisible === false) {
    sceneGrid.classList.remove("hidden");
    gridToggleButton.textContent = "Hide tile grid";
    gridToggleButton.setAttribute("aria-pressed", "true");
    isGridVisible = true;
  } else {
    sceneGrid.classList.add("hidden");
    gridToggleButton.textContent = "Show tile grid";
    gridToggleButton.setAttribute("aria-pressed", "false");
    isGridVisible = false;
  }
}

gridToggleButton.addEventListener("click", toggleTileGrid);

// ===== Interaction 4 (Step 5): building polygons on a real map =====
// Uses Leaflet, a small map library loaded in index.html (the "L" below is Leaflet).

var mapStatus = document.getElementById("map-status");
var geoJsonFile = "data/data_for_georeference_section.geojson";

// Look at the GeoJSON data before drawing it.
// Returns "" if everything is fine, or a short message that explains the problem.
function checkGeoJson(data) {
  if (data.type !== "FeatureCollection") {
    return "the file is not a GeoJSON FeatureCollection.";
  }
  if (!Array.isArray(data.features) || data.features.length === 0) {
    return "the file contains no buildings (no features).";
  }

  // GeoJSON should use longitude/latitude (WGS 84). Old files may say which
  // coordinate system they use in a "crs" entry; only accept lon/lat ones.
  if (data.crs) {
    var crsName = "an unknown coordinate system";
    if (data.crs.properties && data.crs.properties.name) {
      crsName = data.crs.properties.name;
    }
    if (crsName.indexOf("CRS84") === -1 && crsName.indexOf("4326") === -1) {
      return (
        "the coordinates are in " +
        crsName +
        ", not longitude/latitude. Re-export the file as GeoJSON in EPSG:4326."
      );
    }
  }

  // Check every building and every corner point
  for (var i = 0; i < data.features.length; i++) {
    var geometry = data.features[i].geometry;

    if (
      !geometry ||
      (geometry.type !== "Polygon" && geometry.type !== "MultiPolygon")
    ) {
      return "building number " + (i + 1) + " is not a polygon.";
    }

    var rings = getRings(geometry);
    for (var r = 0; r < rings.length; r++) {
      for (var p = 0; p < rings[r].length; p++) {
        var longitude = rings[r][p][0];
        var latitude = rings[r][p][1];
        // Longitude must be between -180 and 180, latitude between -90 and 90.
        // Image pixel positions (for example 462, 405) fail this test.
        if (typeof longitude !== "number" || typeof latitude !== "number") {
          return (
            "building number " + (i + 1) + " has a point without two numbers."
          );
        }
        if (
          longitude < -180 ||
          longitude > 180 ||
          latitude < -90 ||
          latitude > 90
        ) {
          return (
            "building number " +
            (i + 1) +
            " has a point [" +
            longitude +
            ", " +
            latitude +
            "] that is not a longitude/latitude. These may be image pixel positions; convert them to geographic coordinates first."
          );
        }
      }
    }
  }

  return "";
}

// A Polygon is a list of rings (lists of points).
// A MultiPolygon is a list of Polygons, so we collect all of their rings.
function getRings(geometry) {
  if (geometry.type === "Polygon") {
    return geometry.coordinates;
  }
  var rings = [];
  for (var i = 0; i < geometry.coordinates.length; i++) {
    for (var j = 0; j < geometry.coordinates[i].length; j++) {
      rings.push(geometry.coordinates[i][j]);
    }
  }
  return rings;
}

// Show the building ID when a building is clicked
function addBuildingPopup(feature, layer) {
  if (feature.properties && feature.properties.building_id) {
    layer.bindPopup("Building ID: " + feature.properties.building_id);
  }
}

function setUpMap() {
  // 1. Create the map inside <div id="building-map">.
  //    Scroll-wheel zoom is off so the page still scrolls normally.
  var buildingMap = L.map("building-map", { scrollWheelZoom: false });

  // Start with a view of the whole world until the buildings are loaded
  buildingMap.setView([20, 0], 2);

  // 2. Add the background map: satellite pictures from Esri "World Imagery".
  //    The address has no API key in it. {z}, {y} and {x} are filled in by Leaflet
  //    (zoom level, tile row, tile column). Esri asks us to show the credit text below,
  //    and Leaflet displays it in the corner of the map.
  var backgroundTiles = L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    {
      maxZoom: 19,
      attribution:
        "Tiles &copy; Esri &mdash; Source: Esri, Vantor, Earthstar Geographics, and the GIS User Community",
    },
  ).addTo(buildingMap);

  // If the satellite pictures cannot be loaded, show a message (the buildings are still drawn)
  var tileWarning = document.getElementById("map-tile-warning");
  backgroundTiles.on("tileerror", function () {
    tileWarning.classList.remove("hidden");
  });

  // 3. Load the GeoJSON file, check it, then draw the buildings
  fetch(geoJsonFile)
    .then(function (response) {
      if (!response.ok) {
        throw new Error("the file " + geoJsonFile + " was not found");
      }
      return response.json();
    })
    .then(function (data) {
      var problem = checkGeoJson(data);
      if (problem !== "") {
        mapStatus.textContent = "The buildings cannot be shown: " + problem;
        return;
      }

      // Draw all buildings with a red outline and a see-through red fill
      var buildingLayer = L.geoJSON(data, {
        style: {
          color: "#e63946",
          weight: 2,
          fillColor: "#e63946",
          fillOpacity: 0.35,
        },
        onEachFeature: addBuildingPopup,
      }).addTo(buildingMap);

      // 4. Zoom the map so that all buildings fit inside it
      buildingMap.fitBounds(buildingLayer.getBounds(), { padding: [20, 20] });

      mapStatus.textContent =
        "Showing " +
        data.features.length +
        " buildings at their real locations.";
    })
    .catch(function (error) {
      mapStatus.textContent =
        "The map data could not be loaded (" +
        error.message +
        "). Open the page with Live Server, not by double-clicking index.html.";
    });
}

// Only build the map if Leaflet loaded (it needs an internet connection)
if (typeof L === "undefined") {
  mapStatus.textContent =
    "The map library (Leaflet) could not load. Check the internet connection.";
} else {
  setUpMap();
}

// ===== Interaction 5 (Case study): solar site map with colors, filters and details =====
// Uses Leaflet (the "L") and the checkGeoJson() function from Interaction 4 above.

var solarDataFile = "data/buildings_area_3.geojson";

// Find the page elements we need
var solarCount = document.getElementById("solar-count");
var solarTileWarning = document.getElementById("solar-tile-warning");
var solarOverlayButton = document.getElementById("solar-overlay-button");

var energyFilter = document.getElementById("energy-filter");
var energyFilterValue = document.getElementById("energy-filter-value");
var materialDropdown = document.getElementById("material-dropdown");
var materialSummary = document.getElementById("material-summary");
var materialOptions = document.getElementById("material-options");
var roofAreaFilter = document.getElementById("roof-area-filter");
var installedFilter = document.getElementById("installed-filter");
var idFilter = document.getElementById("id-filter");
var resetFiltersButton = document.getElementById("reset-filters-button");

var detailsEmpty = document.getElementById("details-empty");
var detailsList = document.getElementById("details-list");

// Energy color limits (kWh per year), chosen from the n buiding values in the sample file:
// 1.56 to 1.88 million for five buildings, then 3.47 and 4.72 million.
var lowEnergyLimit = 1700000; // 1700000
var highEnergyLimit = 3000000; // 3000000

// Variables that remember the state of the map
var solarMap; // the Leaflet map
var visibleBuildings; // group with only the buildings that match the filters
var allBuildings = []; // every building: { feature: ..., layer: ... }
var selectedBuilding = null; // the building that was clicked last
var areOutlinesShown = true; // is the building layer on the map?

// Turns a value from the file into a number.
// Returns null if it is missing, not a number, or negative
// (energy, roof area and height can never be below zero).
// Note: roof_area and building_height are stored as text, for example "13548.011".
function readNumber(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  var number = Number(value);
  if (isNaN(number) || number < 0) {
    return null;
  }
  return number;
}

// Picks the fill color from the annual energy value
function getEnergyColor(energy) {
  if (energy === null) {
    return "#9e9e9e"; // grey: missing or invalid
  } else if (energy < lowEnergyLimit) {
    return "#2e9e44"; // green: lower
  } else if (energy < highEnergyLimit) {
    return "#f4a300"; // orange: medium
  } else {
    return "#d62828"; // red: higher
  }
}

// roof_material is text, for example "asphalt, metal".
// Split it at the commas to get a list: ["asphalt", "metal"].
function getMaterials(text) {
  if (!text) {
    return [];
  }
  var parts = text.split(",");
  var materials = [];
  for (var i = 0; i < parts.length; i++) {
    var material = parts[i].trim();
    if (material !== "") {
      materials.push(material);
    }
  }
  return materials;
}

// Nicer names for the materials, for the dropdown and the details panel
function materialName(material) {
  if (material === "no_info") {
    return "No information";
  }
  return material.charAt(0).toUpperCase() + material.slice(1);
}

// The style (colors and line) of one building on the map.
// The fill color always comes from the building's own energy value.
function buildingStyle(item) {
  var energy = readNumber(item.feature.properties.annual_energy);
  var energyColor = getEnergyColor(energy);
  // The outline has the same color as the fill, and is thick,
  // so even small buildings are easy to see when the map is zoomed out
  var style = {
    color: energyColor,
    weight: 4,
    fillColor: energyColor,
    fillOpacity: 0.6,
  };
  if (item === selectedBuilding) {
    style.color = "#1e88e5"; // thick blue outline for the selected building
    style.weight = 5;
  }
  return style;
}

// ----- Roof material dropdown -----

// Creates one checkbox for every material that appears in the data
function buildMaterialOptions(features) {
  var materials = [];
  for (var i = 0; i < features.length; i++) {
    var list = getMaterials(features[i].properties.roof_material);
    for (var j = 0; j < list.length; j++) {
      if (materials.indexOf(list[j]) === -1) {
        materials.push(list[j]);
      }
    }
  }
  materials.sort();

  for (var k = 0; k < materials.length; k++) {
    var label = document.createElement("label");
    var checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = materials[k];
    checkbox.addEventListener("change", applySolarFilters);
    label.appendChild(checkbox);
    label.appendChild(
      document.createTextNode(" " + materialName(materials[k])),
    );
    materialOptions.appendChild(label);
  }
}

// Returns the list of ticked materials, for example ["metal", "concrete"]
function getSelectedMaterials() {
  var checkboxes = materialOptions.querySelectorAll("input");
  var selected = [];
  for (var i = 0; i < checkboxes.length; i++) {
    if (checkboxes[i].checked) {
      selected.push(checkboxes[i].value);
    }
  }
  return selected;
}

// ----- Filters -----

// Returns true if one building passes ALL active filters (AND logic).
// A filter that is not set lets every building through.
// Missing values never count as zero: if a filter is set and the value is missing, the building does not match.
function buildingMatches(properties) {
  // 1. Minimum annual energy (the slider at its lowest position means "any")
  var minEnergy = Number(energyFilter.value);
  if (minEnergy > Number(energyFilter.min)) {
    var energy = readNumber(properties.annual_energy);
    if (energy === null || energy < minEnergy) {
      return false;
    }
  }

  // 2. Roof material: the building needs ANY of the ticked materials
  var selectedMaterials = getSelectedMaterials();
  if (selectedMaterials.length > 0) {
    var buildingMaterials = getMaterials(properties.roof_material);
    var hasMaterial = false;
    for (var i = 0; i < buildingMaterials.length; i++) {
      if (selectedMaterials.indexOf(buildingMaterials[i]) !== -1) {
        hasMaterial = true;
      }
    }
    if (hasMaterial === false) {
      return false;
    }
  }

  // 3. Minimum roof area (empty box means "any")
  if (roofAreaFilter.value !== "") {
    var minArea = Number(roofAreaFilter.value);
    var roofArea = readNumber(properties.roof_area);
    if (roofArea === null || roofArea < minArea) {
      return false;
    }
  }

  // 4. Solar panels already installed: "all", "yes" or "no"
  if (installedFilter.value !== "all") {
    var installed = String(properties.solar_already_installed).toLowerCase();
    if (installed !== installedFilter.value) {
      return false;
    }
  }

  // 5. Building ID: the ID must contain the typed text (upper/lower case does not matter)
  var searchText = idFilter.value.trim().toLowerCase();
  if (searchText !== "") {
    var buildingId = String(properties.building_id || "").toLowerCase();
    if (buildingId.indexOf(searchText) === -1) {
      return false;
    }
  }

  return true;
}

// Shows the slider value as text, for example "At least 2,000,000 kWh/year"
function updateEnergyLabel() {
  var value = Number(energyFilter.value);
  if (value <= Number(energyFilter.min)) {
    energyFilterValue.textContent = "Any";
  } else {
    energyFilterValue.textContent =
      "At least " + value.toLocaleString("en-GB") + " kWh/year";
  }
}

// Shows which materials are ticked in the closed dropdown
function updateMaterialSummary() {
  var selected = getSelectedMaterials();
  if (selected.length === 0) {
    materialSummary.textContent = "Any material";
  } else {
    var names = [];
    for (var i = 0; i < selected.length; i++) {
      names.push(materialName(selected[i]));
    }
    materialSummary.textContent = names.join(", ");
  }
}

// Runs every time a filter changes: puts only the matching buildings on the map
function applySolarFilters() {
  updateEnergyLabel();
  updateMaterialSummary();

  // Leaflet not loaded or data not loaded yet: nothing to filter
  if (!visibleBuildings) {
    return;
  }

  visibleBuildings.clearLayers();
  var matchCount = 0;

  for (var i = 0; i < allBuildings.length; i++) {
    if (buildingMatches(allBuildings[i].feature.properties)) {
      visibleBuildings.addLayer(allBuildings[i].layer);
      matchCount = matchCount + 1;
    } else if (allBuildings[i] === selectedBuilding) {
      // The selected building no longer matches, so it is no longer selected
      clearSelection();
    }
  }

  if (matchCount === 0) {
    solarCount.textContent = "No buildings match these filters.";
  } else {
    solarCount.textContent =
      "Showing " + matchCount + " of " + allBuildings.length + " buildings.";
  }
  if (areOutlinesShown === false) {
    solarCount.textContent =
      solarCount.textContent + " (Building outlines are hidden.)";
  }
}

function resetSolarFilters() {
  energyFilter.value = energyFilter.min;
  var checkboxes = materialOptions.querySelectorAll("input");
  for (var i = 0; i < checkboxes.length; i++) {
    checkboxes[i].checked = false;
  }
  roofAreaFilter.value = "";
  installedFilter.value = "all";
  idFilter.value = "";
  applySolarFilters();
}

// ----- Show / hide the building outlines -----

function toggleSolarOverlay() {
  if (areOutlinesShown === true) {
    solarMap.removeLayer(visibleBuildings); // the background map stays
    solarOverlayButton.textContent = "Show building outlines";
    solarOverlayButton.setAttribute("aria-pressed", "false");
    areOutlinesShown = false;
  } else {
    solarMap.addLayer(visibleBuildings);
    solarOverlayButton.textContent = "Hide building outlines";
    solarOverlayButton.setAttribute("aria-pressed", "true");
    areOutlinesShown = true;
  }
  applySolarFilters(); // updates the count text
}

// ----- Selecting a building and showing its details -----

// Formats a number for the details panel, or says why it is not available
function formatValue(value, unit, decimals) {
  var number = readNumber(value);
  if (number === null) {
    if (value === null || value === undefined || value === "") {
      return "Not available";
    }
    return "Not available (invalid value in data: " + value + ")";
  }
  return (
    number.toLocaleString("en-GB", { maximumFractionDigits: decimals }) +
    " " +
    unit
  );
}

function formatText(value) {
  if (value === null || value === undefined || value === "") {
    return "Not available";
  }
  return String(value);
}

function showBuildingDetails(properties) {
  var materials = getMaterials(properties.roof_material);
  var materialNames = [];
  for (var i = 0; i < materials.length; i++) {
    materialNames.push(materialName(materials[i]));
  }

  var installed = String(properties.solar_already_installed).toLowerCase();
  var installedText = "Not available";
  if (installed === "yes") {
    installedText = "Yes";
  } else if (installed === "no") {
    installedText = "No";
  }

  document.getElementById("detail-id").textContent = formatText(
    properties.building_id,
  );
  document.getElementById("detail-area").textContent = formatText(
    properties.area_name,
  );
  document.getElementById("detail-energy").textContent = formatValue(
    properties.annual_energy,
    "kWh/year",
    0,
  );
  document.getElementById("detail-material").textContent =
    materialNames.length > 0 ? materialNames.join(", ") : "Not available";
  document.getElementById("detail-roof-area").textContent = formatValue(
    properties.roof_area,
    "m²",
    0,
  );
  document.getElementById("detail-height").textContent = formatValue(
    properties.building_height,
    "m",
    1,
  );
  document.getElementById("detail-installed").textContent = installedText;

  detailsEmpty.classList.add("hidden");
  detailsList.classList.remove("hidden");
}

function selectBuilding(item) {
  var previous = selectedBuilding;
  selectedBuilding = item;

  // Give the old selection its normal style back, then highlight the new one
  if (previous !== null) {
    previous.layer.setStyle(buildingStyle(previous));
  }
  item.layer.setStyle(buildingStyle(item));
  item.layer.bringToFront();

  // The buildings are far apart, so zoom in to the clicked building if the map is zoomed out
  if (solarMap.getZoom() < 16) {
    solarMap.fitBounds(item.layer.getBounds(), {
      maxZoom: 17,
      padding: [40, 40],
    });
  }

  showBuildingDetails(item.feature.properties);
}

function clearSelection() {
  var previous = selectedBuilding;
  selectedBuilding = null;
  if (previous !== null) {
    previous.layer.setStyle(buildingStyle(previous));
  }
  detailsList.classList.add("hidden");
  detailsEmpty.classList.remove("hidden");
}

// ----- Extra data check: are lat/lon properties next to the polygon? -----
// If they are far apart, latitude and longitude may have been swapped somewhere.
function checkLatLonProperties(features) {
  for (var i = 0; i < features.length; i++) {
    var properties = features[i].properties;
    var firstPoint = getRings(features[i].geometry)[0][0]; // [longitude, latitude]
    if (
      typeof properties.lon === "number" &&
      typeof properties.lat === "number"
    ) {
      var lonDifference = Math.abs(firstPoint[0] - properties.lon);
      var latDifference = Math.abs(firstPoint[1] - properties.lat);
      if (lonDifference > 0.01 || latDifference > 0.01) {
        return (
          "Warning: building " +
          properties.building_id +
          " has lat/lon values far from its outline. Check whether latitude and longitude are swapped."
        );
      }
    }
  }
  return "";
}

// ----- Build the map -----

function setUpSolarMap() {
  solarMap = L.map("solar-map", { scrollWheelZoom: false });
  solarMap.setView([20, 0], 2);

  // Same satellite background as the map in Step 5
  var solarBackground = L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    {
      maxZoom: 19,
      attribution:
        "Tiles &copy; Esri &mdash; Source: Esri, Vantor, Earthstar Geographics, and the GIS User Community",
    },
  ).addTo(solarMap);
  solarBackground.on("tileerror", function () {
    solarTileWarning.classList.remove("hidden");
  });

  // This group holds the buildings that pass the filters. It is what the toggle button hides.
  visibleBuildings = L.featureGroup().addTo(solarMap);

  fetch(solarDataFile)
    .then(function (response) {
      if (!response.ok) {
        throw new Error("the file " + solarDataFile + " was not found");
      }
      return response.json();
    })
    .then(function (data) {
      var problem = checkGeoJson(data);
      if (problem !== "") {
        solarCount.textContent = "The buildings cannot be shown: " + problem;
        return;
      }

      // L.geoJSON turns every feature into a map shape (a "layer").
      // For each one we remember it in allBuildings and listen for clicks.
      var allLayers = L.geoJSON(data, {
        onEachFeature: function (feature, layer) {
          var item = { feature: feature, layer: layer };
          allBuildings.push(item);
          layer.setStyle(buildingStyle(item));
          layer.on("click", function () {
            selectBuilding(item);
          });
        },
      });

      buildMaterialOptions(data.features);
      applySolarFilters();

      // Zoom so that all buildings fit on the map
      solarMap.fitBounds(allLayers.getBounds(), { padding: [30, 30] });

      var warning = checkLatLonProperties(data.features);
      if (warning !== "") {
        solarCount.textContent = solarCount.textContent + " " + warning;
      }
    })
    .catch(function (error) {
      solarCount.textContent =
        "The map data could not be loaded (" +
        error.message +
        "). Open the page with Live Server, not by double-clicking index.html.";
    });
}

// Connect the filters and buttons to the functions above
energyFilter.addEventListener("input", applySolarFilters);
roofAreaFilter.addEventListener("input", applySolarFilters);
installedFilter.addEventListener("change", applySolarFilters);
idFilter.addEventListener("input", applySolarFilters);
resetFiltersButton.addEventListener("click", resetSolarFilters);
solarOverlayButton.addEventListener("click", toggleSolarOverlay);

// Close the material dropdown when the user clicks somewhere else on the page
document.addEventListener("click", function (event) {
  if (materialDropdown.open && !materialDropdown.contains(event.target)) {
    materialDropdown.open = false;
  }
});

// Only build the map if Leaflet loaded
if (typeof L === "undefined") {
  solarCount.textContent =
    "The map library (Leaflet) could not load. Check the internet connection.";
  solarOverlayButton.disabled = true;
} else {
  setUpSolarMap();
}
