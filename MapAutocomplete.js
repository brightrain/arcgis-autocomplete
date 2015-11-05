// the start of a widget to build autocomplete for map services that will zoom to selected feature
define(["dojo/_base/declare",
        "esri/geometry/Extent",
        "esri/SpatialReference",
        "esri/geometry/Polyline",
        "esri/geometry/Polygon",
        "esri/geometry/Point",
        "dojo/domReady!"
       ], 
       function(declare, Extent, SpatialReference, Polyline, Polygon, Point) {
    // !!! ToDo: make sure this path and name jive
    return declare("application/MapAutocomplete", {
        map: null,
        config: null,
        constructor: function(options, inputNode) {
            this.map = options.map;
            this.config = options.config;
            //< using typeahead js >
            // !!!ToDo: I don't think we need this for every source, maybe just the slow one(s), they seem to trip over each other...
            var taAjaxHandler = {
                beforeSend: function (jqXhr, settings) {
                    $("#search-loading-icon").addClass("rpv-search-loading");
                },
                complete: function (jqXHR, status) {
                    $("#search-loading-icon").removeClass("rpv-search-loading");
                }
            }

            // this should all be in config...
            
            // property rights pmno engine
            var pmnoBH = new Bloodhound({
                name: "pmno",
                datumTokenizer: function (d) {
                    return Bloodhound.tokenizers.whitespace(d.name);
                },
                queryTokenizer: Bloodhound.tokenizers.whitespace,
                remote: {
                    // http://resources.arcgis.com/en/help/arcgis-rest-api/#/Find/02r3000000zm000000/
                    url: this.config.mapLayerUrls.realPropertyLayerUrl + "find?" +
                    "searchText=%QUERY&contains=true&" +
                    "searchFields=" + this.config.search.propRights.pmno.searchFields +
                    "&layers=" + this.config.search.propRights.pmno.searchLayers +
                    "&returnGeometry=false&f=json",
                    filter: function (data) {
                        return $.map(data.results, function (result) {
                            // get the name from the result by plucking it out of the attributes
                            // pluck works with arrays so enclose attributes as an array and take the first returned as name
                            var name = _.pluck([result.attributes], result.foundFieldName)[0];
                            return {
                                name: name,
                                objectId: result.attributes.OBJECTID,
                                layerId: result.layerId,
                                source: "pmno"
                            };
                        });
                    }//,
                    // ajax: taAjaxHandler
                },
                limit: 5
            });
            pmnoBH.initialize();


            // utility dams engine
            var damsBH = new Bloodhound({
                name: "dams",
                /*limit duplicates, there are many dam features that represent segments of the same feature e.g. Ross Tunnel*/
                dupDetector: function(remoteMatch, localMatch) {
                    return remoteMatch.name === localMatch.name;
                },

                datumTokenizer: function (d) {
                    return Bloodhound.tokenizers.whitespace(d.name);
                },
                queryTokenizer: Bloodhound.tokenizers.whitespace,
                remote: {
                    //http://resources.arcgis.com/en/help/arcgis-rest-api/#/Find/02r3000000zm000000/
                    url: this.config.mapLayerUrls.utilitiesLayerUrl + "find?" +
                    "searchText=%QUERY&contains=true&" +
                    "searchFields=" + this.config.search.utility.dams.searchFields +
                    "&layers=" + this.config.search.utility.dams.searchLayers +
                    "&returnGeometry=false&f=json",
                    filter: function (data) {
                        return $.map(data.results, function (result) {
                            // get the name from the result by plucking it out of the attributes
                            // pluck works with arrays so enclose attributes as an array and take the first returned as name
                            var name = _.pluck([result.attributes], result.foundFieldName)[0];
                            return {
                                name: name,
                                objectId: result.attributes.OBJECTID,
                                layerId: result.layerId,
                                source: "dams"
                            };
                        });
                    },
                    ajax: taAjaxHandler
                },
                limit: 5
            });
            damsBH.initialize();


            // transmission lines engine
            var transmissionLinesBH = new Bloodhound({
                name: "lines",
                /*limit duplicates, there are hundreds of line features that represent segments of the same feature e.g. Diablo 2*/
                dupDetector: function(remoteMatch, localMatch) {
                    return remoteMatch.name === localMatch.name;
                },

                datumTokenizer: function (d) {
                    return Bloodhound.tokenizers.whitespace(d.name);
                },
                queryTokenizer: Bloodhound.tokenizers.whitespace,
                remote: {
                    //http://resources.arcgis.com/en/help/arcgis-rest-api/#/Find/02r3000000zm000000/
                    url: this.config.mapLayerUrls.utilitiesLayerUrl + "find?" +
                    "searchText=%QUERY&contains=true&" +
                    "searchFields=" + this.config.search.utility.transLines.searchFields +
                    "&layers=" + this.config.search.utility.transLines.searchLayers +
                    "&returnGeometry=false&f=json",
                    filter: function (data) {
                        return $.map(data.results, function (result) {
                            // get the name from the result by plucking it out of the attributes
                            // pluck works with arrays...
                            var name = _.pluck([result.attributes], result.foundFieldName)[0];
                            return {
                                name: name,
                                objectId: result.attributes.OBJECTID,
                                layerId: result.layerId,
                                source: "lines"
                            };
                        });
                    }//,
                    // ajax: taAjaxHandler
                },
                limit: 5
            });
            transmissionLinesBH.initialize();


            // transmission towers engine
            var towersBH = new Bloodhound({
                name: "towers",
                datumTokenizer: function (d) {
                    return Bloodhound.tokenizers.whitespace(d.name);
                },
                queryTokenizer: Bloodhound.tokenizers.whitespace,
                remote: {
                    //http://resources.arcgis.com/en/help/arcgis-rest-api/#/Find/02r3000000zm000000/
                    url: this.config.mapLayerUrls.utilitiesLayerUrl + "find?" +
                    "searchText=%QUERY&contains=true&" +
                    "searchFields=" + this.config.search.utility.towers.searchFields +
                    "&layers=" + this.config.search.utility.towers.searchLayers +
                    "&returnGeometry=false&f=json",
                    filter: function (data) {
                        return $.map(data.results, function (result) {
                            // get the name from the result by plucking it out of the attributes
                            // pluck works with arrays...
                            var name = _.pluck([result.attributes], result.foundFieldName)[0];
                            return {
                                name: name,
                                objectId: result.attributes.OBJECTID,
                                layerId: result.layerId,
                                source: "towers"
                            };
                        });
                    }//,
                    // ajax: taAjaxHandler
                },
                limit: 5
            });
            towersBH.initialize();


            // esri geocoder engine
            var esriBH = new Bloodhound({
                name: "esri-geocoder",
                datumTokenizer: function (d) {
                    return Bloodhound.tokenizers.whitespace(d.name);
                },
                queryTokenizer: Bloodhound.tokenizers.whitespace,
                remote: {
                    //https://developers.arcgis.com/rest/geocode/api-reference/geocoding-suggest.htm
                    //we'll use the searchExtent parameter to limit the results to roughly washington state
                    url: "http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/" +
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
                    }//,
                    //ajax: taAjaxHandler
                },
                limit: 5
            });
            esriBH.initialize();

            // the jquery plugin for typeahead, it defines sources and UI
            //https://github.com/twitter/typeahead.js/blob/master/doc/jquery_typeahead.md
            $(inputNode).typeahead({
                minLength: 3,
                highlight: true,
                hint: false
            },
                                       {
                name: "pmno",
                displayKey: "name",
                source: pmnoBH.ttAdapter(),
                templates: {
                    header: "<h4 class='typeahead-header'><span class='rpv-icon rpv-icon-property-right'></span>&nbsp;Rights by PMNO</h4>"  
                }
            },
                                       {
                name: "dams",
                displayKey: "name",
                source: damsBH.ttAdapter(),
                templates: {
                    header: "<h4 class='typeahead-header'><span class='rpv-icon rpv-icon-dam'></span>&nbsp;Dams</h4>"  
                }
            },
                                       {
                name: "lines",
                displayKey: "name",
                source: transmissionLinesBH.ttAdapter(),
                templates: {
                    header: "<h4 class='typeahead-header'><span class='rpv-icon rpv-icon-power-line'></span>&nbsp;Transmission Lines</h4>"  
                }
            },
                                       {
                name: "towers",
                displayKey: "name",
                source: towersBH.ttAdapter(),
                templates: {
                    header: "<h4 class='typeahead-header'><span class='rpv-icon rpv-icon-transmission-tower'></span>&nbsp;Transmission Towers</h4>"  
                }
            },
                                       {
                name: "esri-geocoder",
                displayKey: "name",
                source: esriBH.ttAdapter(),
                templates: {
                    header: "<h4 class='typeahead-header'><span class='rpv-icon rpv-icon-map-marker'></span>&nbsp;Addresses and Places</h4>",
                    empty: "<div class='no-suggestions'>No results found</div>"
                }
            }).on("typeahead:selected", function (obj, datum) {
                switch(datum.source) {
                    case "esri-geocoder":
                        var url = this.config.arcgisGeocodingBaseUrl + "find?" +
                            "magicKey=" + datum.magicKey + "&text=" + datum.name + 
                            "&outFields=Addr_type&f=json";
                        // https://developers.arcgis.com/rest/geocode/api-reference/geocoding-find.htm
                        // make the call to the geocode service to get the result
                        $.getJSON(url, function(result) {
                            try {
                                if(result.locations.length > 0) {
                                    var extent = result.locations[0].extent;
                                    extent.spatialReference = {"wkid":4326};
                                    this.map.setExtent(new Extent(extent), true);
                                }
                                else {
                                    this._notify(this.inputNode, "Could not go to" + datum.name);
                                }
                            }
                            catch(e) {
                                //console.log(e);
                            }
                        });
                        break;
                    case "dams":
                        var url = this.config.mapLayerUrls.utilitiesLayerUrl + + datum.layerId + "/query?" +
                            "objectIds=" + datum.objectId +
                            "&outFields=*&returnGeometry=true&outSR=4326&f=json";
                        //OMG, refactor this whole app so I don't have to pass these things around!!!
                        $.getJSON(url, function(result) {
                            this._zoomToLineSearchResult(result);
                        });
                        break;
                    case "lines":
                        // !! ToDo: consider using a where clause using the returned value (name) instead of objectIds here
                        // this would allow us to get back all features with the same name and then zoom to all of them
                        // rather than, currently we get a single segment while there are many segments with the same name
                        // therefore we only zoom to a single segment
                        // e.g. there are hundreds of transmission lines that have the name 'DIABLO 2'
                        var url = this.config.mapLayerUrls.utilitiesLayerUrl + + datum.layerId + "/query?" +
                            "objectIds=" + datum.objectId +
                            "&outFields=*&returnGeometry=true&outSR=4326&f=json";

                        $.getJSON(url, function(result) {
                            this._zoomToLineSearchResult(result);
                        });
                        break;
                    case "towers":
                        var url = this.config.mapLayerUrls.utilitiesLayerUrl + + datum.layerId + "/query?" +
                            "objectIds=" + datum.objectId +
                            "&outFields=*&returnGeometry=true&outSR=4326&f=json";

                        $.getJSON(url, function(result) {
                            this._zoomToPointSearchResult(result);
                        });
                        break;
                    case "pmno":
                        var url = this.config.mapLayerUrls.realPropertyLayerUrl + + datum.layerId + "/query?" +
                            "objectIds=" + datum.objectId +
                            "&outFields=*&returnGeometry=true&outSR=4326&f=json";

                        $.getJSON(url, function(result) {
                            this._zoomToPolygonSearchResult(result);
                        });
                        break;
                }
            });
            //< using typeahead js />
        },
        _zoomToPointSearchResult: function(result) {
            try {
                if(!(result.error)) {
                    var pt = new Point(result.features[0].geometry.x, result.features[0].geometry.y);
                    this.map.centerAndZoom(pt, 18);
                }
                else {
                    this._notify(this.inputNode, "Unable to zoom to that location.");
                }}
            catch(err) {
                this._notify(this.inputNode, "Unable to zoom to that location.");
            }
        },
        _zoomToPolygonSearchResult: function(result) {
            try {
                if(!(result.error)) {
                    var poly = new Polygon(result.features[0].geometry.rings);
                    this.map.setExtent(poly.getExtent(), true);
                }
                else {
                    this._notify(this.inputNode, "Unable to zoom to that location.");
                }
            }
            catch(err) {
                this._notify(this.inputNode, "Unable to zoom to that location.");
            }
        },
        _zoomToLineSearchResult: function(result) {
            try {
                if(!(result.error)) {
                    var line = new Polyline(result.features[0].geometry.paths);
                    //line.spatialReference = this.map.spatialReference;
                    this.map.setExtent(line.getExtent(), true);
                }
                else {
                    this._notify(this.inputNode, "Unable to zoom to that location.");
                }}
            catch(err) {
                this._notify(this.inputNode, "Unable to zoom to that location.");
            }
        }

    });
});