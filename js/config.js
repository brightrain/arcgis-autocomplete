var config = {
    featureServerUrl: "http://services1.arcgis.com/mRXrgD3LWwGHJmpS/ArcGIS/rest/services/wenatchee_rec/FeatureServer",
    featureLayerIndexes: {
        info: 0,
        ski: 1,
        picnic: 2,
        boat: 3,
        trail:4,
        camp:5
    },
    initExtent: {
        xmin:-124.5,
        ymin:46.5,
        xmax:-117.5,
        ymax:48.5,
        spatialReference:{"wkid":4326}
    },
    arcgisGeocodingBaseUrl: "http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/"
}