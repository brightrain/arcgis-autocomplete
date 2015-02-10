define(["dojo/_base/declare", "esri/map", "esri/geometry/Extent", "esri/geometry/Point", "esri/symbols/Symbol", "esri/SpatialReference", "esri/layers/FeatureLayer", "application/lib/Typeahead", "dojo/domReady!"], function (declare, Map, Extent, Point, Symbol, SpatialReference, FeatureLayer, Typeahead) {
    return declare(null, {
        config: {},
        map: null,
        startup: function (config) {
            if (config) {
                this.config = config;

            } else {
                //no config, yeah, i really dont care, but you might
            }
            this._createMap();
            this._setupSearch();
        },

        _createMap: function () {
            this.map = new Map("map",{ 
                basemap: "topo",
                extent: new Extent(this.config.initExtent)
            });
            var info = new
            FeatureLayer(this.config.featureServerUrl + this.config.featureLayerIndexes.info,{
                mode: FeatureLayer.MODE_ONDEMAND,
                outFields:["*"]
            });
            var camp = new
            FeatureLayer(this.config.featureServerUrl + this.config.featureLayerIndexes.camp,{
                mode: FeatureLayer.MODE_ONDEMAND,
                outFields:["*"]
            });
            var trail = new
            FeatureLayer(this.config.featureServerUrl + this.config.featureLayerIndexes.trail,{
                mode: FeatureLayer.MODE_ONDEMAND,
                outFields:["*"]
            });
            var boat = new
            FeatureLayer(this.config.featureServerUrl + this.config.featureLayerIndexes.boat,{
                mode: FeatureLayer.MODE_ONDEMAND,
                outFields:["*"]
            });
            var picnic = new
            FeatureLayer(this.config.featureServerUrl + this.config.featureLayerIndexes.picnic,{
                mode: FeatureLayer.MODE_ONDEMAND,
                outFields:["*"]
            });
            var ski = new
            FeatureLayer(this.config.featureServerUrl + this.config.featureLayerIndexes.ski,{
                mode: FeatureLayer.MODE_ONDEMAND,
                outFields:["*"]
            });
            this.map.addLayer(info);
            this.map.addLayer(camp);
            this.map.addLayer(trail);
            this.map.addLayer(boat);
            this.map.addLayer(picnic);
            this.map.addLayer(ski);
        },

        // set up search
        _setupSearch: function () {
            // lil sloppy but, grab our map and config
            var config = this.config;
            var map = this.map;

            //Highlight search box text on click
            $("#searchInput").click(function () {
                $(this).select();
            });

            // build an engine for each layer in our feature service
            // https://github.com/twitter/typeahead.js/blob/master/doc/bloodhound.md#options
            var campBH = new Bloodhound({
                name: "camp",

                datumTokenizer: function (d) {
                    return Bloodhound.tokenizers.whitespace(d.name);
                },
                queryTokenizer: Bloodhound.tokenizers.whitespace,
                remote: {
                    // feature services currently only support query
                    // if you are using a map server, use find
                    //http://resources.arcgis.com/en/help/arcgis-rest-api/index.html#/Query_Feature_Service_Layer/02r3000000r1000000/
                    url: config.featureServerUrl + config.featureLayerIndexes.camp + "/query?" +
                    "where=REC_NAME Like '%%QUERY%'" +
                    "&outFields=REC_NAME,OBJECTID"  +
                    "&returnGeometry=false&f=json",

                    // build the 'datums' that populate the search drop down
                    // this happens on the callback to the query above
                    filter: function (data) {
                        // we only need the name,
                        // objectid (to retrieve the feature if selected)
                        // and the source (to later determine which type was selected by the user)
                        return $.map(data.features, function (feature) {
                            return {
                                name: feature.attributes.REC_NAME,
                                objectId: feature.attributes.OBJECTID,
                                source: "camp"
                            };
                        });
                    },
                    // set and remove spinners
                    ajax: {
                        beforeSend: function (jqXhr, settings) {
                            $("#search-loading-icon").addClass("search-loading");
                        },
                        complete: function (jqXHR, status) {
                            $("#search-loading-icon").removeClass("search-loading");
                        }
                    }
                },
                limit: 5
            });
            campBH.initialize();


            // trail
            var trailBH = new Bloodhound({
                name: "trail",

                datumTokenizer: function (d) {
                    return Bloodhound.tokenizers.whitespace(d.name);
                },
                queryTokenizer: Bloodhound.tokenizers.whitespace,
                remote: {
                    // feature services currently only support 'query'
                    // if you are using a map server, use 'find'
                    // ideally all service types would have a 'suggest' end point

                    //http://resources.arcgis.com/en/help/arcgis-rest-api/index.html#/Query_Feature_Service_Layer/02r3000000r1000000/
                    url: config.featureServerUrl + config.featureLayerIndexes.trail + "/query?" +
                    "where=REC_NAME Like '%%QUERY%'" +
                    "&outFields=REC_NAME,OBJECTID"  +
                    "&returnGeometry=false&f=json",

                    // build the 'datums' that populate the search drop down
                    filter: function (data) {
                        return $.map(data.features, function (feature) {
                            return {
                                name: feature.attributes.REC_NAME,
                                objectId: feature.attributes.OBJECTID,
                                source: "trail"
                            };
                        });
                    },
                    // set and remove spinners
                    ajax: {
                        beforeSend: function (jqXhr, settings) {
                            $("#search-loading-icon").addClass("search-loading");
                        },
                        complete: function (jqXHR, status) {
                            $("#search-loading-icon").removeClass("search-loading");
                        }
                    }
                },
                limit: 5
            });
            trailBH.initialize();

            // ski
            var skiBH = new Bloodhound({
                name: "ski",

                datumTokenizer: function (d) {
                    return Bloodhound.tokenizers.whitespace(d.name);
                },
                queryTokenizer: Bloodhound.tokenizers.whitespace,
                remote: {
                    // feature services currently only support 'query'
                    // if you are using a map server, use 'find'
                    // ideally all service types would have a 'suggest' end point and maybe there is by the time you're reading this!
                    // and don't return geometry here, it'll be too slow, grab it in the query after the user selects the suggestion, below

                    //http://resources.arcgis.com/en/help/arcgis-rest-api/index.html#/Query_Feature_Service_Layer/02r3000000r1000000/
                    url: config.featureServerUrl + config.featureLayerIndexes.ski + "/query?" +
                    "where=REC_NAME Like '%%QUERY%'" +
                    "&outFields=REC_NAME,OBJECTID"  +
                    "&returnGeometry=false&f=json",

                    // build the 'datums' that populate the search drop down
                    filter: function (data) {
                        return $.map(data.features, function (feature) {
                            return {
                                name: feature.attributes.REC_NAME,
                                objectId: feature.attributes.OBJECTID,
                                source: "ski"
                            };
                        });
                    },
                    // set and remove spinners
                    ajax: {
                        beforeSend: function (jqXhr, settings) {
                            $("#search-loading-icon").addClass("search-loading");
                        },
                        complete: function (jqXHR, status) {
                            $("#search-loading-icon").removeClass("search-loading");
                        }
                    }
                },
                limit: 5
            });
            skiBH.initialize();



            // build the esri geocoder bloodhound engine
            var esriBH = new Bloodhound({
                name: "esri-geocoder",
                datumTokenizer: function (d) {
                    return Bloodhound.tokenizers.whitespace(d.name);
                },
                queryTokenizer: Bloodhound.tokenizers.whitespace,
                remote: {
                    //https://developers.arcgis.com/rest/geocode/api-reference/geocoding-suggest.htm
                    // use the searchExtent parameter to limit the results to roughly washington state
                    url: config.arcgisGeocodingBaseUrl +
                    "suggest?text=%QUERY&searchExtent=-125,49,-116.9,45.5&f=json",
                    filter: function (data) {
                        return $.map(data.suggestions, function (result) {
                            //typically this is a category or type of business (e.g. coffee shops)
                            if(result.isCollection === false) {
                                return {
                                    name: result.text,
                                    magicKey: result.magicKey,
                                    source: "esri-geocoder"
                                };
                            }
                        });
                    },
                    ajax: {
                        beforeSend: function (jqXhr, settings) {
                            $("#search-loading-icon").addClass("search-loading");
                        },
                        complete: function (jqXHR, status) {
                            $("#search-loading-icon").removeClass("search-loading");
                        }
                    }
                },
                limit: 5
            });
            esriBH.initialize();

            // this is the jQuery plugin part of the typeahead\bloodhound\jQuery trinity that gets this going
            $("#searchInput").typeahead({
                // how many characters does the user type before suggestions start firing
                minLength: 3,
                highlight: true,
                hint: false
            }, {
                name: "camp",
                displayKey: "name",
                source: campBH.ttAdapter(),
                // what the header looks like for this source in the suggestions drop down
                templates: {
                    header: "<h1 class='typeahead-header'><span class='icon icon-camp'></span>&nbsp;Campgrounds</h1>"  
                }
            }, {
                name: "trail",
                displayKey: "name",
                source: trailBH.ttAdapter(),
                templates: {
                    header: "<h1 class='typeahead-header'><span class='icon icon-trail'></span>&nbsp;Trail Heads</h1>"  
                }
            }, {
                name: "ski",
                displayKey: "name",
                source: skiBH.ttAdapter(),
                templates: {
                    header: "<h1 class='typeahead-header'><span class='icon icon-ski'></span>&nbsp;Ski Areas</h1>"  
                }
            }, {
                name: "esri-geocoder",
                displayKey: "name",
                source: esriBH.ttAdapter(),
                templates: {
                    header: "<h1 class='typeahead-header'><span class='icon icon-map-marker'></span>&nbsp;Addresses and Places</h1>"  
                }
            }).on("typeahead:selected", function (obj, datum) {
                // what happens when a user selects\clicks a suggestion
                // we get the datum that contains the properties we defined when we setup the engine via the filter function
                map.graphics.clear();
                switch(datum.source) {
                    case "esri-geocoder":
                        var url = config.arcgisGeocodingBaseUrl + "find?" +
                            "magicKey=" + datum.magicKey + "&text=" + datum.name + 
                            "&outFields=Addr_type&f=json";
                        // https://developers.arcgis.com/rest/geocode/api-reference/geocoding-find.htm
                        // make the call to the geocode service to get the result
                        $.getJSON(url, function(result) {
                            try {
                                if(result.locations.length > 0) {
                                    var extent = result.locations[0].extent;
                                    map.setExtent(new Extent(extent), true);
                                }
                                else {
                                    $("#searchBox").val("Could not go to" + datum.name);
                                }
                            }
                            catch(e) {
                                //console.log(e);
                            }
                        });
                        break;
                    default:
                         // since our datums and geometry types are the same we can capture everything that isn't a geocode result
                        // and query the correct layer
                        // if you have various data sources they may need to be handled individually here
                        var layerIndex = null;
                        
                        switch(datum.source) {
                            case "camp":
                                layerIndex = config.featureLayerIndexes.camp;
                                break;
                            case "trail":
                                layerIndex = config.featureLayerIndexes.trail;
                                break;
                            case "ski":
                                layerIndex = config.featureLayerIndexes.ski;
                                break;
                        }
                        
                        var url = config.featureServerUrl + layerIndex + "/query?" +
                            "objectIds=" + datum.objectId +
                            "&outFields=*&returnGeometry=true&outSR=4326&f=json";
                        
                        $.getJSON(url, function(result) {
                            // create a point from the result (and give it a little scooch north) and zoom the map to it
                            var pt = new Point(result.features[0].geometry.x, result.features[0].geometry.y + .001);
                            map.centerAndZoom(pt, 14);
                            
                            // put the name in the graphics layer of the map
                            var text =  new esri.symbol.TextSymbol(datum.name)
                            .setColor(new esri.Color("#064780"))
                            .setAlign(esri.symbol.Font.ALIGN_START)
                            .setFont(new esri.symbol.Font("24px",esri.symbol.Font.STYLE_NORMAL, esri.symbol.Font.VARIANT_NORMAL,esri.symbol.Font.WEIGHT_BOLD,"Arial"));
                            var graphic = new esri.Graphic(pt, text);
                            map.graphics.add(graphic);
                        });
                        break;
                }
            });
        }

    });
});
