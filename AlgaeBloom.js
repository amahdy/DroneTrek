/*
 * Copyright (C) 2014 United States Government as represented by the Administrator of the
 * National Aeronautics and Space Administration. All Rights Reserved.
 */
/**
 * Illustrates how to use a GoToAnimator to smoothly move the view to a new location. This example listens for
 * terrain picks and moves the view to the location picked.
 *
 * @version $Id: GoToLocation.js 3320 2015-07-15 20:53:05Z dcollins $
 */

requirejs(['./ww/WorldWind',
        './js/LayerManager'],
    function (ww,
              LayerManager) {
        "use strict";

        // Tell World Wind to log only warnings.
        WorldWind.Logger.setLoggingLevel(WorldWind.Logger.LEVEL_WARNING);

        // Create the World Window.
        var wwd = new WorldWind.WorldWindow("canvasOne");

        /**
         * Added imagery layers.
         */
        var layers = [
            {layer: new WorldWind.BMNGLayer(), enabled: true},
            {layer: new WorldWind.BingAerialWithLabelsLayer(null), enabled: true},
            {layer: new WorldWind.CompassLayer(), enabled: true},
            {layer: new WorldWind.CoordinatesDisplayLayer(wwd), enabled: true},
            {layer: new WorldWind.ViewControlsLayer(wwd), enabled: true}
        ];

        for (var l = 0; l < layers.length; l++) {
            layers[l].layer.enabled = layers[l].enabled;
            wwd.addLayer(layers[l].layer);
        }

        // Create a layer manager for controlling layer visibility.
        var layerManger = new LayerManager(wwd);
        layerManger.performSearch("Helsinki");

        // Now set up to handle clicks and taps.

        // The common gesture-handling function.
        var handleClick = function (recognizer) {
            // Obtain the event location.
            var x = recognizer.clientX,
                y = recognizer.clientY;

            // Perform the pick. Must first convert from window coordinates to canvas coordinates, which are
            // relative to the upper left corner of the canvas rather than the upper left corner of the page.
            var pickList = wwd.pick(wwd.canvasCoordinates(x, y));

            // If only one thing is picked and it is the terrain, tell the world window to go to the picked location.
            if (pickList.objects.length == 1 && pickList.objects[0].isTerrain) {
                var position = pickList.objects[0].position;
                wwd.goTo(new WorldWind.Location(position.latitude, position.longitude));

              if($("#globe").hasClass("placemarks")) {
                // Define the images we'll use for the placemarks.
                var images = [
                    "plain-green.png",
                ];

                var pinLibrary = WorldWind.configuration.baseUrl + "images/pushpins/", // location of the image files
                    placemark,
                    placemarkAttributes = new WorldWind.PlacemarkAttributes(null),
                    highlightAttributes,
                    placemarkLayer = new WorldWind.RenderableLayer("Placemarks"),
                    latitude = position.latitude,
                    longitude = position.longitude;

                // Set up the common placemark attributes.
                placemarkAttributes.imageScale = 1;
                placemarkAttributes.imageOffset = new WorldWind.Offset(
                    WorldWind.OFFSET_FRACTION, 0.3,
                    WorldWind.OFFSET_FRACTION, 0.0);
                placemarkAttributes.imageColor = WorldWind.Color.WHITE;
                placemarkAttributes.labelAttributes.offset = new WorldWind.Offset(
                    WorldWind.OFFSET_FRACTION, 0.5,
                    WorldWind.OFFSET_FRACTION, 1.0);
                placemarkAttributes.labelAttributes.color = WorldWind.Color.YELLOW;
                placemarkAttributes.drawLeaderLine = true;
                placemarkAttributes.leaderLineAttributes.outlineColor = WorldWind.Color.RED;

                // For each placemark image, create a placemark with a label.
                for (var i = 0, len = images.length; i < len; i++) {
                    // Create the placemark and its label.
                    placemark = new WorldWind.Placemark(new WorldWind.Position(latitude, longitude + i, 1e2), true, null);
                    placemark.label = "Placemark " + i.toString() + "\n"
                    + "Lat " + placemark.position.latitude.toPrecision(4).toString() + "\n"
                    + "Lon " + placemark.position.longitude.toPrecision(5).toString();
                    placemark.altitudeMode = WorldWind.RELATIVE_TO_GROUND;

                    // Create the placemark attributes for this placemark. Note that the attributes differ only by their
                    // image URL.
                    placemarkAttributes = new WorldWind.PlacemarkAttributes(placemarkAttributes);
                    placemarkAttributes.imageSource = pinLibrary + images[i];
                    placemark.attributes = placemarkAttributes;

                    // Create the highlight attributes for this placemark. Note that the normal attributes are specified as
                    // the default highlight attributes so that all properties are identical except the image scale. You could
                    // instead vary the color, image, or other property to control the highlight representation.
                    highlightAttributes = new WorldWind.PlacemarkAttributes(placemarkAttributes);
                    highlightAttributes.imageScale = 1.2;
                    placemark.highlightAttributes = highlightAttributes;

                    // Add the placemark to the layer.
                    placemarkLayer.addRenderable(placemark);
                }

                // Add the placemarks layer to the World Window's layer list.
                wwd.addLayer(placemarkLayer);
              }
            }
        };

        // Listen for mouse clicks.
        var clickRecognizer = new WorldWind.ClickRecognizer(wwd, handleClick);

        // Listen for taps on mobile devices.
        var tapRecognizer = new WorldWind.TapRecognizer(wwd, handleClick);
    });
