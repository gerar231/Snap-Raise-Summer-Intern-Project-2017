$(document).ready(function () {

  //------------- Get Sales Rep Database Files -------------//

  // global variable storing Array parsed from rep-locations-db.csv
  var repData;

  // initializes object for mapbox geocoding queries (only necesarry if rep data does not have longitude and latitude)
  L.mapbox.accessToken = 'pk.eyJ1IjoiZ2VyYXJkLXNuYXAtcmFpc2UiLCJhIjoiY2o1Ymo0ZWJ6MGtlYTMybzdhYXRyd3RueCJ9.XAGnOF5eHz-P4xpIOU0b1w';
  var geocoder = L.mapbox.geocoder("mapbox.places");


  repData = [
    ["name", "long", "lat", "city", "state", "region", "image_url", "bio_url"],
    ["Remote Sales Rep", "", "", "", "", "Remote", "https://productionsnapraise.s3.amazonaws.com/uploads/user/12/cole.jpg", "https://snap-raise.com/team"],
    ["Snap Raise HQ", "-124.3855", "47.9504", "Forks,", "Washington", "West", "https://productionsnapraise.s3.amazonaws.com/uploads/user/12/cole.jpg", "https://snap-raise.com/team"],
    ["Snap Raise HQ", "-122.34074", "47.628251", "Seattle,", "Washington", "West", "https://productionsnapraise.s3.amazonaws.com/uploads/user/12/cole.jpg", "https://snap-raise.com/team"],
    ["Snap Raise HQ v2", "-122.34074", "47.628251", "Seattle,", "Washington", "West", "https://productionsnapraise.s3.amazonaws.com/uploads/user/12/cole.jpg", "https://snap-raise.com/team"],
    ["Snap Raise HQ v3", "-122.34074", "47.628251", "Seattle,", "Washington", "West", "https://productionsnapraise.s3.amazonaws.com/uploads/user/12/cole.jpg", "https://snap-raise.com/team"],
    ["Snap Raise HQ v4", "-122.34074", "47.628251", "Seattle,", "Washington", "West", "https://productionsnapraise.s3.amazonaws.com/uploads/user/12/cole.jpg", "https://snap-raise.com/team"],
    ["Snap Raise HQ", "-120.5059", "46.6021", "Yakima,", "Washington", "West", "https://productionsnapraise.s3.amazonaws.com/uploads/user/12/cole.jpg", "https://snap-raise.com/team"],
    ["Snap Raise HQ", "-117.421084", "47.66052", "Spokane,", "Washington", "West", "https://productionsnapraise.s3.amazonaws.com/uploads/user/12/cole.jpg", "https://snap-raise.com/team"],
    ["Snap Raise HQ", "-95.359582", "29.753004", "Houston,", "Texas", "Southwest", "https://productionsnapraise.s3.amazonaws.com/uploads/user/12/cole.jpg", "https://snap-raise.com/team"],
    ["Snap Raise HQ", "-87.624305", "41.875825", "Chicago,", "Illinois", "Midwest", "https://productionsnapraise.s3.amazonaws.com/uploads/user/12/cole.jpg", "https://snap-raise.com/team"],
    ["Snap Raise HQ", "-80.185412", "25.774396", "Miami,", "Florida", "Southeast", "https://productionsnapraise.s3.amazonaws.com/uploads/user/12/cole.jpg", "https://snap-raise.com/team"],
    ["Snap Raise HQ v2", "-80.185412", "25.774396", "Miami,", "Florida", "Southeast", "https://productionsnapraise.s3.amazonaws.com/uploads/user/12/cole.jpg", "https://snap-raise.com/team"],
    ["Snap Raise HQ", "-73.997449", "40.730733", "New York,", "New York", "Northeast", "https://productionsnapraise.s3.amazonaws.com/uploads/user/12/cole.jpg", "https://snap-raise.com/team"]
  ];

  //------------- Create Array Containing Rep Location objects -------------//

  // constructor for salesRep object
  function salesRep(name, longi, lat, city, state, region, image_url, bio_url) {
    this.type = "Feature";
    this.properties = new properties(name, city, state, region, image_url, bio_url);
    this.geometry = new geometry(longi, lat);
  }


  // constructor for properties object
  function properties(name, city, state, region, image_url, bio_url) {
    this.name = name;
    this.city = city;
    this.state = state;
    this.region = region;
    this.image_url = image_url;
    this.bio_url = bio_url;
  }

  // constructor for geometry object
  function geometry(longi, lat) {
    this.coordinates = [longi, lat];
    this.type = "Point";
  }

  // array will be implemented as a queue storing salesRep objects
  var repsFinal = new Array();

  // set containing states where reps are located, need additional set for remote rep population to be functional 
  // for simultaneous mobile and desktop use.
  var repStates = new Set();

  // function to recursively populate repsFinal and repStates in the case that longitude and latitude are not provided
  /* function createLocations(i) {
    if (i < repData.length) {
      var first;
      var last;
      var city;
      var state;
      var region;
      var zip;
      var image_url;
      var rep_profile_url;
      geocoder.query({
        query: zip,
        limit: 1,
        types: "postcode"
      }, function(err,res) {
        var newRep = new salesRep(first + " " + last, res.results.features[0].center[0], 
          res.results.features[0].center[1], city, state, region, image_url, rep_profile_url);
        repsFinal.push(newRep);
        if (!repStates.has(state)) {
          repStates.add(state);
        }
        createLocations(i + 1);
      });
    }
  } */

  // loop populating repsFinal and repStates with salesRep objects created from repData array
  for (i = 2; i < repData.length; i++) {
    var stateName = repData[i][4]
    repsFinal.push(new salesRep(repData[i][0], repData[i][1], repData[i][2], repData[i][3], stateName,
      repData[i][5], repData[i][6], repData[i][7]));
    if (!repStates.has(stateName)) {
      repStates.add(stateName);
    }
  }

  //------------- CREATE JSON for Rep Locations -------------//

  // Object containing layer information for desktop
  var repLocationsDesktop = {
    "id": "rep-locations-test-script",
    "type": "symbol",
    "source": {
      "type": "geojson",
      "data": {
        "type": "FeatureCollection",
        "features": repsFinal
      }
    },
    "filter": ["in", "state", ""],
    "layout": {
      "icon-image": "image2vector%20(1)",
      "icon-allow-overlap": true,
      "icon-size": .4
    }
  }

  // Object containing layer information for mobile
  var repLocationsMobile = {
    "id": "rep-locations-test-script",
    "type": "symbol",
    "source": {
      "type": "geojson",
      "data": {
        "type": "FeatureCollection",
        "features": repsFinal
      }
    },
    "filter": ["in", "state", ""],
    "layout": {
      "icon-image": "image2vector%20(1)",
      "icon-allow-overlap": true,
      "icon-size": .4
    }
  }

  // if clause only loads one map (desktop or mobile)
  if ($('.lp_desktop').is(':visible')) {
    //################################################# DESKTOP MAP #################################################//


    //------------- CREATION OF THE MAP -------------//
    mapboxgl.accessToken = 'pk.eyJ1Ijoic25hcHJhaXNlIiwiYSI6ImNqNHJpdHR4bDE2aWkzMnE2bnh3cXFvYWUifQ.tTcezBjKKLCQz0ss4lVvPA';
    var map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/gerard-snap-raise/cj5wof2hl4nlr2sp2jdemhb5h',
      zoom: 2.7200121,
      center: [-96.477, 38.111],
      attributionControl: false,
      trackResize: true,
      interactive: false
    });

    //------------- STYLE ADJUSTMENTS -------------//

    $(".mapboxgl-ctrl-bottom-left").css("display", "none"); // make sure legal issues are good with this on enterprise account
    $(".mapboxgl-canvas").css("position", "static"); // fix mapbox display
    $(".mapboxgl-map").css("overflow", "visible"); // allow rep pin popups to overflow map
    $(".mapboxgl-canvas").css("outline", "none"); // removes faint outline on canvas focus


    //------------- CLICK & HOVER FUNCTIONALITY -------------//

    map.on('load', function () {

      map.addLayer(repLocationsDesktop);

      // sets the desktop map to initially show all continental US
      map.setFilter("lake-states", ["in", "region_cod", "west", "southwest", "midwest", "southeast", "northeast", "pacific"]);
      map.setFilter("lake-states-borders", ["in", "region_cod", "west", "southwest", "midwest", "southeast", "northeast", "pacific"]);

      // show hawaii on load
      map.setFilter("hawaii_inset", ["in", "show", "true"]);

      // when the user moves their mouse over the states-fill layer, update the filter in
      // the lake-states-hover layer to only show the matching state, thus making a hover effect.
      map.on("mousemove", "lake-states", function (e) {
        map.setFilter("lake-states-hover", ["all", ["in", "name", e.features[0].properties.name],
          ["in", "adm0_a3", "USA"],
          ["!in", "name", "Alaska"]
        ]);
      });

      // reset the lake-states-hover layer's filter when the mouse leaves the layer.
      map.on("mouseleave", "lake-states-hover", function () {
        map.setFilter("lake-states-hover", ["all", ["in", "name", ""],
          ["in", "adm0_a3", "USA"],
          ["!in", "name", "Alaska"]
        ]);
      });

      // when the user moves over the hawaii_inset layer, show the hover layer
      map.on("mousemove", "hawaii_inset", function (e) {
        map.setFilter("hawaii_inset_hover", ["in", "show", "true"]);
      });

      map.on("mouseleave", "hawaii_inset_hover", function (e) {
        map.setFilter("hawaii_inset_hover", ["in", "show", "false"]);
      });

      // on click function designed specifically for Hawaii inset
      map.on("click", "hawaii_inset_hover", function (e) {
        // gets Hawaii feature from map
        var feature = map.querySourceFeatures("composite", {
          sourceLayer: "snap_ne_10m_states_provinces_-3vk29t",
          filter: ["in", "name", "Hawaii"]
        })[0];
        mapZoom(feature);
      });

      // update layer filters on click
      map.on("click", "lake-states", function (e) {
        mapZoom(e.features[0]);
      });



      // popup variable scope must be outside of on click function to be removed when zooming out
      var popup;

      // renders rep profile popup if the user clicks a rep point
      map.on('click', 'rep-locations-test-script', function (e) {
        var features = e.features;

        var feature = features[0]; // gets popup feature

        var centerLat = map.getCenter().lat;

        var pointLat = feature.geometry.coordinates[1];

        if (pointLat > centerLat) {
          options = {
            anchor: "top"
          }
        } else {
          options = {
            anchor: "bottom"
          }
        }


        popup = new mapboxgl.Popup(options) // create popup
          .setLngLat(feature.geometry.coordinates)
          .setHTML("<div id='desktopPopup'></div>")
          .addTo(map);

        // set popup display properties based on number of reps at a location
        if (!features.length) {
          return;
        } else if (features.length == 1) {
          $(".mapboxgl-popup-content").css("overflow", "hidden");
          $(".mapboxgl-popup-content").css("max-height", "none");
        } else {
          $(".mapboxgl-popup-content").css("overflow", "scroll");
          $(".mapboxgl-popup-content").css("overflow-x", "hidden");
          $(".mapboxgl-popup-content").css("max-height", "250px");
          $("#desktopPopup").css("flex-direction", "column");
        }

        // populate the popup with rep information
        for (i = 0; i < features.length; i++) {
          feature = features[i];
          $("#desktopPopup").append("<div style='text-align:center; padding: 5px;'> <div style='text-align:center; margin-top:10px; margin-bottom:10px; margin-left:auto; margin-right:auto; position:relative; width:100px; height:100px; border-radius:50%; overflow:hidden; object-fit:cover;'><img alt='Full 307b3a4' src='" + feature.properties.image_url + "'></div><h5 class='profile__name'>" + feature.properties.name + "</h5><h6 class='profile__title' style='margin-top:5px; margin-bottom:5px;'> SALES REP - " + feature.properties.city + " " + feature.properties.state + "</h6><a target='_blank' href='" + feature.properties.bio_url + "' style='text-decoration:none;'><div style='width: 75%; margin: auto; margin-top: 10px; text-align: center; text-decoration: none; background: #98C60C; border-radius: 5px; padding-top: 10px; padding-bottom: 10px;'><font style='text-decoration:none; color:#ffffff; font-size: 15px;'>SEE PROFILE</font></div></a></div>");
        }
        $("#desktopPopup").css("display", "flex");
      });

      // change color of undo button on hover
      $("#undo-button").hover(function () {
        $("#change-color").css("fill", "#00C4FF")
      }, function () {
        $("#change-color").css("fill", "#FFFFFF")
      });

      // reset map view on click
      $("#undo-button").click(function () {
        // remove any popup displayed on screen
        if (popup) {
          popup.remove();
        }
        // physical features
        map.setFilter("lake-states", ["in", "region_cod", "west", "southwest", "midwest", "southeast", "northeast", "pacific"]);
        map.setFilter("lake-states-borders", ["in", "region_cod", "west", "southwest", "midwest", "southeast", "northeast", "pacific"]);
        map.setFilter("hawaii_inset", ["in", "show", "true"]);
        // state label
        map.setFilter("state-label-lg", ["in", "name", ""]);
        // rep location pins
        map.setFilter("rep-locations-test-script", ["in", "state", ""]);
        // show hover layer
        map.setLayoutProperty("lake-states-hover", "visibility", "visible");
        // reset hover layer
        map.setFilter("lake-states-hover", ["all", ["in", "name", ""],
          ["in", "adm0_a3", "USA"],
          ["!in", "name", "Alaska"]
        ]);

        map.flyTo({
          // These options control the ending camera position: centered at
          // the target, at zoom level 9, and north up.
          center: [-96.477, 38.111],
          zoom: 2.7200121,
          bearing: 0,

          // These options control the flight curve, making it move
          // slowly and zoom out almost completely before starting
          // to pan.
          speed: 1, // make the flying slow
          curve: .8, // change the speed at which it zooms out

          // This can be any easing function: it takes a number between
          // 0 and 1 and returns another number between 0 and 1.
          easing: function (t) {
            return t;
          }
        });
        $("#undo-button").css("display", "none");
      });


      // Change mouse to point on hover over states and rep locations
      map.on('mousemove', function (e) {
        var features = map.queryRenderedFeatures(e.point, {
          layers: ["rep-locations-test-script", "lake-states-hover", "hawaii_inset_hover"] // replace this with the name of the layer
        });
        map.getCanvas().style.cursor = features.length ? 'pointer' : '';
      });
    });

    function mapZoom(feature) {
      // get clicked state name
      var stateName = feature.properties.name;
      // physical features 
      map.setFilter("lake-states", ["all", ["in", "name", stateName],
        ["in", "adm0_a3", "USA"]
      ]);
      map.setFilter("lake-states-borders", ["all", ["in", "name", stateName],
        ["in", "adm0_a3", "USA"]
      ]);
      map.setFilter("hawaii_inset", ["in", "show", "false"]);
      map.setFilter("hawaii_inset_hover", ["in", "show", "false"]);
      // state label
      map.setFilter("state-label-lg", ["in", "name", stateName]);
      // rep location pins
      map.setFilter("rep-locations-test-script", ["in", "state", stateName]);
      // hide hover layer
      map.setLayoutProperty("lake-states-hover", "visibility", "none");
      // fit map to state
      var bbox = turf.extent(feature);
      map.fitBounds(bbox, {
        padding: {
          top: 5,
          bottom: 5,
          left: 5,
          right: 5
        }
      });

      $("#undo-button").css("display", "block");


      // get centroid of clicked state
      var centroid = turf.centroid(feature).geometry.coordinates;

      // if current state has no rep then add a pin for remote rep
      if (!repStates.has(stateName)) {
        var source = map.getSource("rep-locations-test-script");
        var newRep = new salesRep(repData[1][0], centroid[0], centroid[1], repData[1][3], stateName, repData[1][5], repData[1][6], repData[1][7]);
        source._data.features.push(newRep);
        source.setData({
          "type": "FeatureCollection",
          "features": source._data.features
        });
        repStates.add(stateName);
      }
    }

    //------------- DEBUGGING FUNCTIONS -------------//

    // tracks x,y & lng,lat coordinates of mouse, gives map zoom level and map view center
    /* map.on('mousemove', function (e) {
        document.getElementById('info').innerHTML =
        // e.point is the x, y coordinates of the mousemove event relative
        // to the top-left corner of the map
        JSON.stringify(e.point) + '<br />' +
        // e.lngLat is the longitude, latitude geographical position of the event
        JSON.stringify(e.lngLat) + '<br />' + map.getZoom() 
        + '<br />' + map.getCenter();
    }); */
  } else {
    //################################################# MOBILE MAP #################################################//


    //------------- CREATION OF THE MAP -------------//

    mapboxgl.accessToken = 'pk.eyJ1Ijoic25hcHJhaXNlIiwiYSI6ImNqNHJpdHR4bDE2aWkzMnE2bnh3cXFvYWUifQ.tTcezBjKKLCQz0ss4lVvPA';

    // Map for default zoom 
    var defaultZoom = new Map();
    defaultZoom.set("west", 2.0);
    defaultZoom.set("southwest", 3.0);
    defaultZoom.set("midwest", 2.5);
    defaultZoom.set("northeast", 3.0);
    defaultZoom.set("southeast", 3.0);

    // Map for default center coordinate
    var defaultCenter = new Map();
    defaultCenter.set("west", [-113.384, 39.667]);
    defaultCenter.set("southwest", [-99.0149, 31.686]);
    defaultCenter.set("midwest", [-91.009, 42.656]);
    defaultCenter.set("northeast", [-73.754, 42.496]);
    defaultCenter.set("southeast", [-83.408, 32.149]);

    // Map for default max bounds for each map
    var defaultMaxBounds = new Map();
    defaultMaxBounds.set("west", [
      [-132.534, 21.279],
      [-96.251, 53.248]
    ]);
    defaultMaxBounds.set("southwest", [
      [-117.326, 14.445],
      [-80.646, 46.707]
    ]);
    defaultMaxBounds.set("midwest", [
      [-125.983, 10.452],
      [-57.646, 63.038]
    ]);
    defaultMaxBounds.set("northeast", [
      [-87.941, 30.865],
      [-60.313, 52.108]
    ]);
    defaultMaxBounds.set("southeast", [
      [-105.691, 12.285],
      [-63.251, 49.203]
    ]);

    // Map for default bounds used in resizing function
    var defaultBounds = new Map();
    defaultBounds.set("west", [
      [-126.384, 28.400],
      [-100.339, 49.299]
    ]);
    defaultBounds.set("southwest", [
      [-109.383, 21.962],
      [-88.536, 40.490]
    ]);
    defaultBounds.set("midwest", [
      [-104.768, 30.896],
      [-77.140, 52.131]
    ]);
    defaultBounds.set("northeast", [
      [-80.708, 36.867],
      [-66.727, 47.628]
    ]);
    defaultBounds.set("southeast", [
      [-92.590, 23.648],
      [-74.162, 39.877]
    ]);

    var regionsMap = new mapboxgl.Map({
      container: 'west',
      style: 'mapbox://styles/gerard-snap-raise/cj5wof2hl4nlr2sp2jdemhb5h',
      minZoom: defaultZoom.get(document.getElementsByClassName("selected-region")[0].innerHTML),
      center: defaultCenter.get(document.getElementsByClassName("selected-region")[0].innerHTML),
      attributionControl: false,
      interactive: false
    });

    //------------- STYLE ADJUSTMENTS -------------//

    $(".mapboxgl-ctrl-bottom-left").css("display", "none"); // removes all mapbox logos
    $("#regionMap").css("outline", "none"); //remove outline from mobile map
    $(".mapboxgl-canvas").css("outline", "none"); // removes faint outline on canvas focus
    $(".mapboxgl-canvas").css("position", "relative"); // fixed positioning in browser



    //------------- CLICK & HOVER FUNCTIONALITY -------------//

    // variable for current map, used in resize functions that are not necesarily called on click
    var currentMap;

    // popup variable scope must be outside of on click and on load function to be removed when zooming out using mapChange()
    var popup;

    // need bounding box for popup function and overallResize
    var bbox;

    regionsMap.on("load", function () {

      regionsMap.addLayer(repLocationsMobile);

      // No need to initially set filter because it is handled by the "mapChange" function

      // show hawaii on load
      regionsMap.setFilter("hawaii_inset", ["in", "show", "true"]);

      // When the user moves their mouse over the states-fill layer, update the filter in
      // the lake-states-hover layer to only show the matching state, thus making a hover effect.
      regionsMap.on("mousemove", "lake-states", function (e) {
        regionsMap.setFilter("lake-states-hover", ["all", ["in", "name", e.features[0].properties.name],
          ["in", "adm0_a3", "USA"],
          ["!in", "name", "Alaska"]
        ]);
      });

      // Reset the lake-states-hover layer's filter when the mouse leaves the layer.
      regionsMap.on("mouseleave", "lake-states-hover", function () {
        regionsMap.setFilter("lake-states-hover", ["all", ["in", "name", ""],
          ["in", "adm0_a3", "USA"],
          ["!in", "name", "Alaska"]
        ]);
      });

      // When the user moves over the hawaii_inset layer, show the hover layer
      regionsMap.on("mousemove", "hawaii_inset", function (e) {
        regionsMap.setFilter("hawaii_inset_hover", ["in", "show", "true"]);
      });

      regionsMap.on("mouseleave", "hawaii_inset_hover", function (e) {
        regionsMap.setFilter("hawaii_inset_hover", ["in", "show", "false"]);
      });



      // on click function designed specifically for mobile Hawaii inset
      regionsMap.on("click", "hawaii_inset_hover", function (e) {
        // gets Hawaii feature from map
        bbox = [-160.235595703125, 18.906286495910905, -154.8193359375, 22.228090416784482];
        regionsMap.fitBounds(bbox, {
          padding: {
            top: 5,
            bottom: 5,
            left: 5,
            right: 5
          }
        });
        // gets hawaii feature mid zoom so that it exists in the source
        var zoomFired = false;
        regionsMap.on("move", function hawaiiZoom() {
          if (((regionsMap.getZoom() <= 2.5) || (regionsMap.getCenter().lng <= -140)) && !zoomFired) {
            var feature = regionsMap.querySourceFeatures("composite", {
              sourceLayer: "snap_ne_10m_states_provinces_-3vk29t",
              filter: ["in", "name", "Hawaii"]
            })[0];
            if (feature != null) {
              zoomFired = true;
              regionsMapZoom(feature);
              regionsMap.off("move", hawaiiZoom);
            }
          }
        });
      });

      // on click function designed specifically for mobile Hawaii inset
      regionsMap.on("click", "hawaii_inset", function (e) {
        // gets Hawaii feature from map
        bbox = [-160.235595703125, 18.906286495910905, -154.8193359375, 22.228090416784482];
        regionsMap.fitBounds(bbox, {
          padding: {
            top: 5,
            bottom: 5,
            left: 5,
            right: 5
          }
        });
        // gets hawaii feature mid zoom so that it exists in the source
        var zoomFired = false;
        regionsMap.on("move", function hawaiiZoom() {
          if (((regionsMap.getZoom() <= 2.5) || (regionsMap.getCenter().lng <= -140)) && !zoomFired) {
            var feature = regionsMap.querySourceFeatures("composite", {
              sourceLayer: "snap_ne_10m_states_provinces_-3vk29t",
              filter: ["in", "name", "Hawaii"]
            })[0];
            if (feature != null) {
              zoomFired = true;
              regionsMapZoom(feature);
              regionsMap.off("move", hawaiiZoom);
            }
          }
        });
      });


      // update layers and zoom on click
      regionsMap.on("click", "lake-states", function (e) {
        regionsMapZoom(e.features[0]);
      });

      // renders rep profile popup if the user clicks a rep point
      regionsMap.on('click', 'rep-locations-test-script', function (e) {
        var features = e.features

        if (!features.length) {
          return;
        } else if (features.length == 1) { // determine modal display options based on number of reps at a location
          $("#popup-modal").css("overflow", "hidden");
          $("#popup-modal").css("justify-content", "center");
          $("#popup-modal").css("max-height", "300px");
        } else {
          $("#popup-modal").css("overflow", "scroll");
          $("#popup-modal").css("overflow-x", "hidden");
          $("#popup-modal").css("justify-content", "flex-start");
          $("#popup-modal").css("max-height", "400px");
        }

        for (i = 0; i < features.length; i++) {
          feature = features[i];
          // creates popup modal
          $("#popup-modal").append("<div style='text-align:center; padding: 5px; width:100%;'><div style='text-align:center; margin-top:10px; margin-bottom:10px; margin-left:auto; margin-right:auto; position:relative; width:50%; height:50%; min-width:100px; border-radius:50%; overflow:hidden; object-fit:cover;'><img alt='Full 307b3a4' src='" + feature.properties.image_url + "'></div><h5 class='profile__name' style='font-size:calc(10px + 1.5vw);'>" + feature.properties.name + "</h5><h6 class='profile__title' style='margin-top:5px; margin-bottom:5px; font-size:calc(10px + 1.5vw);'> SALES REP - " + feature.properties.city + " " + feature.properties.state + "</h6><a target='_blank' href='" + feature.properties.bio_url + "' style='text-decoration:none;'><div style='width: 75%; margin: auto; margin-top: 10px; text-align: center; text-decoration: none; background: #98C60C; border-radius: 5px; padding-top: 10px; padding-bottom: 10px;'><font style='text-decoration:none; color:#ffffff; font-size: 15px;'>SEE PROFILE</font></div></a></div>");
        }
        $("#popup-modal").css("display", "flex");
        $("#popup-modal").append("<button class='mapboxgl-popup-close-button' style='z-index:1;' type='button' aria-label='Close popup'>×</button>")
        $(".mapboxgl-popup-close-button").click(function () {
          regionsMap.fitBounds(bbox, {
            padding: {
              top: 5,
              bottom: 5,
              left: 5,
              right: 5
            }
          });
          $("#popup-modal").css("display", "none");
          $("#popup-modal").html("");
        });
      });

      // Change mouse to point on hover over states and rep locations
      regionsMap.on('mousemove', function (e) {
        var features = regionsMap.queryRenderedFeatures(e.point, {
          layers: ["rep-locations-test-script", "lake-states-hover", "hawaii_inset_hover"] // replace this with the name of the layer
        });
        regionsMap.getCanvas().style.cursor = features.length ? 'pointer' : '';
      });
    });

    function regionsMapZoom(feature) {
      // get clicked state name
      var stateName = feature.properties.name;
      // physical features 
      regionsMap.setFilter("lake-states", ["all", ["in", "name", stateName],
        ["in", "adm0_a3", "USA"]
      ]);
      regionsMap.setFilter("lake-states-borders", ["all", ["in", "name", stateName],
        ["in", "adm0_a3", "USA"]
      ]);
      regionsMap.setFilter("hawaii_inset", ["in", "show", "false"]);
      regionsMap.setFilter("hawaii_inset_hover", ["in", "show", "false"]);
      // state label
      regionsMap.setFilter("state-label-lg", ["in", "name", stateName]);
      // rep location pins
      regionsMap.setFilter("rep-locations-test-script", ["in", "state", stateName]);
      // hide hover layer
      regionsMap.setLayoutProperty("lake-states-hover", "visibility", "none");
      // fit map to state
      bbox = turf.extent(feature);
      regionsMap.fitBounds(bbox, {
        padding: {
          top: 5,
          bottom: 5,
          left: 5,
          right: 5
        }
      });

      // display undo button when a state is selected
      $("#undo-button-mobile").css("display", "block");

      // get centroid of clicked state
      var centroid = turf.centroid(feature).geometry.coordinates;

      // if current state has no rep then add a pin for remote rep
      if (!repStates.has(stateName)) {
        var source = regionsMap.getSource("rep-locations-test-script");
        var newRep = new salesRep(repData[1][0], centroid[0], centroid[1], repData[1][3], stateName, repData[1][5], repData[1][6], repData[1][7]);
        source._data.features.push(newRep);
        source.setData({
          "type": "FeatureCollection",
          "features": source._data.features
        });
        repStates.add(stateName);
      }
    }

    function mapChange() {
      currentMap = $(this).text();

      // remove any popup displayed on screen if they exist
      $(".mapboxgl-popup-close-button").click();

      // remove undo button if it exists
      $("#undo-button-mobile").css("display", "none");

      // set regionsMap to show the selected region
      regionsMap.setFilter("lake-states", ["in", "region_cod", currentMap, "pacific"]);
      regionsMap.setFilter("lake-states-borders", ["in", "region_cod", currentMap, "pacific"]);

      if (currentMap == "west") {
        regionsMap.setFilter("hawaii_inset", ["in", "show", "true"]);
        regionsMap.setFilter("hawaii_inset_hover", ["in", "show", "false"]);
      } else {
        regionsMap.setFilter("hawaii_inset", ["in", "show", "false"]);
        regionsMap.setFilter("hawaii_inset_hover", ["in", "show", "false"]);
      }

      // reset state labels and rep location pin visibility if necesarry
      regionsMap.setFilter("state-label-lg", ["in", "name", ""]);
      regionsMap.setFilter("rep-locations-test-script", ["in", "state", ""]);

      // reset hover layer
      regionsMap.setFilter("lake-states-hover", ["all", ["in", "name", ""],
        ["in", "adm0_a3", "USA"],
        ["!in", "name", "Alaska"]
      ]);
      /* set new zoom, center and maxbounds (optional when using flyTo function)
      regionsMap.setZoom(defaultZoom.get(text));
      regionsMap.setCenter(defaultCenter.get(text)); */

      // slowly fly to new region
      regionsMap.flyTo({
        // These options control the ending camera position: centered at
        // the target, at zoom level 9, and north up.
        center: defaultCenter.get(currentMap),
        zoom: defaultZoom.get(currentMap),
        bearing: 0,

        // These options control the flight curve, making it move
        // slowly and zoom out almost completely before starting
        // to pan.
        speed: .5, // make the flying slow
        curve: 2, // change the speed at which it zooms out

        // This can be any easing function: it takes a number between
        // 0 and 1 and returns another number between 0 and 1.
        easing: function (t) {
          return t;
        }
      });

      // ensure hover layer is visible (in case disabled by clicking a state)
      regionsMap.setLayoutProperty("lake-states-hover", "visibility", "visible");

      // optional to set max bounds when interactivty is not enabled
      // regionsMap.setMaxBounds(defaultMaxBounds.get(text));
    }

    // on-click function initialization
    $(".region").click(mapChange);
    $(".region").click(regionMapResize);
    $(".region").click(overallResize);

    // change color of undo button on hover
    $("#undo-button-mobile").hover(function () {
      $("#change-color-mobile").css("fill", "#00C4FF")
    }, function () {
      $("#change-color-mobile").css("fill", "#FFFFFF")
    });
    // reset map view on click
    $("#undo-button-mobile").click(function () {
      // execute actions equivalent to clicking the tab of the currently selected region
      $(".selected-region").click();
    });

    //------------- MAP RESIZING FUNCTIONS -------------//


    // resizing the mapbox margins to match margins of navigation tabs
    var regionMapsDiv = document.getElementsByClassName("region-maps")[0];
    var regionTabsDiv = document.getElementsByClassName("region-tabs")[0];

    function marginResize() {
      regionMapsDiv.style.marginLeft = window.getComputedStyle(regionTabsDiv).marginLeft;
      regionMapsDiv.style.marginRight = window.getComputedStyle(regionTabsDiv).marginRight;
    }

    // function to change selected map via tabs and resize canvas when map is changed
    function regionMapResize() {
      $(this).addClass('selected-region');
      $(this).siblings().removeClass('selected-region');
      regionsMap.resize();
    }

    // handles resizing when the window is resized
    function overallResize() {
      marginResize();
      if (regionsMap.getLayoutProperty("lake-states-hover", "visibility") == "none") {
        regionsMap.fitBounds(bbox, {
          padding: {
            top: 5,
            bottom: 5,
            left: 5,
            right: 5
          }
        });
      } else {
        regionsMap.fitBounds(defaultBounds.get(currentMap));
      }
    };

    //------------- WINDOW LISTENER & LOAD FUNCTIONS -------------//

    window.addEventListener("resize", overallResize);
    document.addEventListener("fullscreenchange", overallResize);
    $(".region").ready(function () {
      regionsMap.on("load", function () {
        $(".selected-region").click();
        $(".selected-region").click();
      });
    });

    //------------- DEBUGGING FUNCTIONS -------------//

    // $(".region").click(mapTracker); // debugging function commented out

    // tracks x,y & lng,lat coordinates of mouse, gives map zoom level and map view center
    /* function mapTracker() {
      regionsMap.on('mousemove', function (e) {
        document.getElementById('info').innerHTML =
        // e.point is the x, y coordinates of the mousemove event relative
        // to the top-left corner of the map
        JSON.stringify(e.point) + '<br />' +
        // e.lngLat is the longitude, latitude geographical position of the event
        JSON.stringify(e.lngLat) + '<br />' + regionsMap.getZoom() 
        + '<br />' + regionsMap.getCenter();
      });
    } */
  }
});