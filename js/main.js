define(["dojo/_base/declare", "esri/map", "esri/geometry/Extent", "esri/SpatialReference", "esri/layers/FeatureLayer", "application/lib/Typeahead", "dojo/domReady!"], function (declare, Map, Extent, SpatialReference, FeatureLayer, Typeahead) {
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
        },

        // set up search
        _setupSearch: function () {
            // grab our map and config
            var config = this.config;
            var map = this.map;
            
            //Highlight search box text on click
            $("#searchInput").click(function () {
                $(this).select();
            });

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
                minLength: 3,
                highlight: true,
                hint: false
            },
            {
                name: "esri-geocoder",
                displayKey: "name",
                source: esriBH.ttAdapter(),
                templates: {
                    header: "<h4 class='typeahead-header'><span class='icon icon-map-marker'></span>&nbsp;Addresses and Places</h4>"  
                }
            }).on("typeahead:selected", function (obj, datum) {
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
                                    extent.spatialReference = {"wkid":4326};
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
                }
            });


        }

    });
});
