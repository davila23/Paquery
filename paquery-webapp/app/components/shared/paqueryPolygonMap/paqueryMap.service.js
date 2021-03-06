(function() {
  'use strict';
  angular.module('PaQuery')
  .factory('paqueryPolygonMapService', PaqueryPolygonMapService);

  PaqueryPolygonMapService.$inject = ['$http', '$q', '$timeout', 'UrlHelper','W3wSerice', 'mapUtils', 'HERE_API_KEY', 'HERE_API_CODE', 'HERE_URL_AUTOCOMPLETE'];

  function PaqueryPolygonMapService($http, $q, $timeout, UrlHelper, W3wService, mapUtils, hereApiKey, hereApiCode, hereUrlAutocomplete) {

    // Oficina de Humahuaca 4284
    const puntoProximidad = "-34.601501,-58.425145";
    const orderResultType={
      houseNumber:0,
      address:1,
      postalCode:2,
      street:3,
      default:10
    }
    const pixelRatio = window.devicePixelRatio || 1;

    var herePlatform = new H.service.Platform({
      app_id: hereApiKey,
      app_code: hereApiCode,
      useHTTPS: true,
    });

    const getParamsCredentials = function () {
      return 'app_id=' + hereApiKey + "&app_code=" + hereApiCode;
    }

    const deleteRouteShapeFromMap = function(map) {
      if (map && map._polyline)
      map.removeObject(map._polyline)
    }

    const addRouteShapeToMap = function (map, route) {
      var lineString = new H.geo.LineString(),
      routeShape = route.shape,
      polyline;

      routeShape.forEach(function(point) {
        var parts = point.split(',');
        lineString.pushLatLngAlt(parts[0], parts[1]);
      });

      polyline = new H.map.Polyline(lineString, {
        style: {
          lineWidth: 8, strokeColor: 'rgba(0, 128, 255, 0.7)'
        },
        arrows: {
          fillColor: 'white', frequency: 2, width: 1.4, length: 1.0
        }
      });

      deleteRouteShapeFromMap(map);

      // Add the polyline to the map
      map.addObject(polyline);
      map._polyline = polyline

      // And zoom to its bounding rectangle
      map.setViewBounds(polyline.getBounds(), true);
    };


    const orderLocationsByRelevance = function (locations) {
      return ( locations || [])
      .sort((s1,s2)=> parseInt(s1.address.postalCode) - parseInt(s2.address.postalCode) )
      .sort( (s1, s2) => orderResultType[s1.matchLevel] - orderResultType[s2.matchLevel]);
    };

    const factory = {
      getHerePlatform: function() {
        return herePlatform
      },

      createMap: function(id, options) {

        let pixelRatio = this.getPixelRatio();

        let defaultLayers = this.getHerePlatform().createDefaultLayers({
          tileSize: pixelRatio === 1 ? 256 : 512,
          ppi: pixelRatio === 1 ? undefined : 320
        });

        let map = new H.Map(

          document.getElementById(id),
          defaultLayers.normal.map,
          {
            zoom: 10,
            center: {lat: -34.57812, lng: -58.42737},
            pixelRatio: pixelRatio
          });

          map._mapUi = H.ui.UI.createDefault(map, defaultLayers)

          map.setBaseLayer(this.getHereMapBaseLayer())
          map._mapBehavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));

          /* -- Init Default Layer -- */

          var service = herePlatform.getCustomLocationService();

          var provider = new mapsjs.service.extension.customLocation.TileProvider(service, {
            layerId: 'DEMO'
          }, {
            resultType: mapsjs.service.extension.TileProvider.ResultType.POLYGON,
            min: 0
          });

          var layer = new mapsjs.map.layer.TileLayer(provider, { opacity: 0.3});

            map.addLayer(layer);

            map.addEventListener('tap', function(ev) {
              var row;
              if (ev.target !== map) {
                row = ev.target.getData();
                console.log('SHAPE_AREA: ', row.getCell('SHAPE_AREA'));
              }
            });


          /* -- Init a Linestring whith DB geometry information -- */
          let lineStringDB = new H.geo.LineString();
let x = '(-58.431404042358395 -34.572395616485,-58.413894581909176 -34.58024004200935,-58.40951721679687 -34.57373840849809,-58.417156148071285 -34.56850846471929)';
        let y = x.split(",");
        console.log("Y Type : " + typeof y);
        console.log("Y  : " +  y);

          /* -- Variable a relacionar con zone.controller. Ante el get de una zona deberia precargarse y de existir datos , crear el poligono previamente guardado. -- */
        //  var geometry = [{lat:-34.581300042736224,lng:-58.420417714233395},{lat:-34.571971572396166,lng:-58.44702522766113},{lat:-34.5763532570198,lng:-58.437412190551754},{lat:-34.56716558824095,lng:-58.41870110046386}];

          y.forEach(function(point) {
            console.log(point);
            console.log("Point Type : " + typeof point);
            lineStringDB.pushPoint(point);


          });

          /* -- Initialize a polyline with the db Geometry -- */
          var polygon = new H.map.Polyline(lineStringDB, { style: { lineWidth: 10 }});

          /* --  Descomentar cuando se setee en el servicio la variable geometry -- */
           map.addObject(polygon);

          /* --  Create Marker -- Oficina de Humahuaca 4284 -- */
          let marker = new H.map.Marker({lat:-34, lng :-58});

          /* --  Add Marker -- */
          map.addObject(marker);

          /* --  Need a lineString to initialize the new polygon -- */
          const lineStringAux = new H.geo.LineString();
          lineStringAux.pushPoint({lat:-34.581300042736224,lng:-58.420417714233395});

          /* --  Create New Polygon -- */
          let polygon_ = new H.map.Polygon(lineStringAux, { style: { strokeColor: 'black' }});

          /* -- Add New Polygon -- */
          map.addObject(polygon_);

          let lineStringNewPoligon = new H.geo.LineString();
          var geofencing = herePlatform.getGeofencingService();
          var customStyle = {
            strokeColor: 'black',
            fillColor: 'rgba(222, 22, 22, 0.05)',
            lineWidth: 1,
            lineCap: 'square',
            lineJoin: 'bevel',
            opacity: 0.3
          };
          map.addEventListener("tap", ev => {

            var target = ev.target;

            map.removeObject(marker);



            marker = new H.map.Marker(map.screenToGeo(ev.currentPointer.viewportX , ev.currentPointer.viewportY ));

            lineStringNewPoligon.pushPoint({lat:marker.getPosition().lat, lng:marker.getPosition().lng});

            /* --  Set the new LineString -- */
            polygon_ = new H.map.Polygon(lineStringNewPoligon, { style: customStyle});


            const geometry = polygon_.getGeometry();
            const wkt = geometry.toString();

            console.log(wkt);

            map.addObject(polygon_);

            map.addObject(marker);


            /* --  Triggers an alert If the selected point belongs to another area -- */
            geofencing.request(
              H.service.extension.geofencing.Service.EntryPoint.SEARCH_PROXIMITY,
              {
                "layer_ids":["DEMO"],
                "proximity": marker.getPosition().lat + "," + marker.getPosition().lng,
                "ket_attributes":["NAME"]
              },
              result => {
                if( result.geometries.length > 0){
                  alert("La coordenada seleccionada pertenece a otra zona!");
                  console.log(result)
                }
              },
              error => {
                console.error(error);
              }
            );
          });


            map.setZoom( options.zoom || 14);

            return map
          },


          persistLayer: function(polygon){

            const geometry = polygon.getGeometry();
            const wkt = geometry.toString();

            console.log(wkt);

            const zip = new JSZip();

            zip.file("data.wkt","NAME\tWKT\n" + "testfence"+"\t"+wkt);

            zip.generateAsync({type:"blob"}).then(content => {

              var formData = new FormData();

              formData.append("zipfile", content);

              axios.post("https://gfe.api.here.com/2/layers/upload.json", formData , {
                headers: {
                  "content-type": "multipart/form-data"
                },
                params:{
                  app_id: hereApiKey,
                  app_code: hereApiCode,
                  layer_id:"DEMO"
                }
              }).then(result =>{
                console.log(result);
              },  error => {
                console.error(error);
              })
              , error => {
                console.error(error);
              }
            });
          },

          getHereMapBaseLayer: function() {
            let mapTileService = herePlatform.getMapTileService({
              type: 'base'
            });

            // Our layer will load tiles from the HERE Map Tile API
            let mapLayer = mapTileService.createTileLayer(
              'maptile',
              'normal.day',
              pixelRatio === 1 ? 256 : 512,
              'png8',
              {lg: 'SPA', ppi: pixelRatio === 1 ? undefined : 320}
            );

            return mapLayer;
          },
          getPixelRatio: function() {
            return pixelRatio
          },

          getRouting: function() {
            return herePlatform.getRoutingService()
          },
          calculateAndDisplayRoute: function(map, originLocation, destiniyLocation) {

            if (!mapUtils.isLocationValid(originLocation) || !mapUtils.isLocationValid(destiniyLocation)) return;


            const routeRequest = {
              mode: 'fastest;car',
              representation: 'display',
              waypoint0: mapUtils.unifyLocation(originLocation),
              waypoint1: mapUtils.unifyLocation(destiniyLocation),
              routeattributes: 'waypoints,summary,shape,legs',
              maneuverattributes: 'direction,action'
            };

            this.getRouting().calculateRoute(routeRequest,
              function(result) {

                if (result.response && result.response.route) {
                  let resultRoute = result.response.route[0];
                  addRouteShapeToMap(map, resultRoute)
                }
                else {
                  deleteRouteShapeFromMap(map)
                  console.error("calculateAndDisplayRoute:", result)
                }

              }, function(err) {
                deleteRouteShapeFromMap(map)
                console.error(err)
              })

            },

            getGeocoder: function() {
              return herePlatform.getGeocodingService();
            },

            geodecodeLocation: function(source, onSuccess, onError) {
              const geodecodeParams = {
                prox: mapUtils.unifyLocation(source.location || source) + ',150',//'52.5309,13.3847,150',
                mode: 'retrieveAddresses',
                maxresults: 1
              }

              this.getGeocoder().reverseGeocode(geodecodeParams, function(results) {
                if (results.Response && results.Response.View[0] && results.Response.View[0].Result[0]){

                  const resultLocation = {
                    location: results.Response.View[0].Result[0].Location.DisplayPosition
                  };

                  onSuccess(resultLocation);
                }
                else
                onError(results)
              }, function(error) {
                console.error("GeoDecode Here: ", error);
                onError && onError(error)
              })
            },
            getAddressByLocation: function(source, onSuccess, onError) {
              const geodecodeParams = {
                prox: mapUtils.unifyLocation(source.location || source) + ',150',//'52.5309,13.3847,150',
                mode: 'retrieveAddresses',
                maxresults: 1
              }

              this.getGeocoder().reverseGeocode(geodecodeParams, function(results) {
                if (results.Response && results.Response.View[0] && results.Response.View[0].Result[0]){

                  console.log("AddresByLocation", results.Response.View[0].Result[0]);

                  const resultLocation = {
                    location: results.Response.View[0].Result[0].Location
                  };

                  onSuccess(resultLocation);
                }
                else
                onError(results)
              }, function(error) {
                console.error("GeoDecode Here: ", error);
                onError && onError(error)
              })
            },

            geocodeLocation: function(address, onSuccess, onError) {

              let defer = $q.defer()

              const geocodingParams = {
                country: 'ARG'
              };


              if (typeof address == 'string')
              geocodingParams.searchText = address;
              else if (address.address)
              geocodingParams.searchText = address.address;
              else
              geocodingParams.locationId = address.locationId;

              this.getGeocoder().geocode(geocodingParams, function(r) {

                if (r.Response && r.Response.View) {

                  let locations = r.Response.View[0].Result

                  locations = locations.filter(function(l) { return l.Location.Country === "ARG" });

                  if (locations.length < 1) {
                    return onError && onError("Sin Resultados");
                  }

                  onSuccess && onSuccess({
                    location: {
                      lat: locations[0].Location.DisplayPosition.Latitude,
                      lng: locations[0].Location.DisplayPosition.Longitude
                    }
                  })

                  defer.resolve(r)
                }
                else {
                  onError && onError(r)
                }


              }, function(err) {
                console.error("GeoCode Here", err)
                onError && onError(err)
                defer.reject(err)
              })


              return defer.promise
            },

            geodecodeLocationW3w: function(address, onSuccess, onError) {
              $timeout(function(){
                W3wService.getByAddress(address).then(function(response) {
                  onSuccess(response.data.words)
                })
                .catch(function(err) {
                  onError && onError(err)
                })
              })
            },

            setMapLocation: function(map, location) {
              if (mapUtils.isLocationValid(location)) {
                map.setCenter(mapUtils.normalizeLocation(location), true);
                map.setZoom(14)
              }
            },
            addMarkerToMap: function(map, markerLocation, image) {

              markerLocation = markerLocation.location || markerLocation

              if (!mapUtils.isLocationValid(markerLocation))
              return null;

              let icon = null;

              if (image != null)
              icon = new H.map.Icon(image, {size: {h:48, w:48}});


              let marker = new H.map.Marker(
                {
                  lat: markerLocation.lat || markerLocation.Latitude,
                  lng: markerLocation.lng || markerLocation.Longitude
                },
                icon != null ? { icon: icon } : null
              );

              map.addObject(marker);

              return marker
            },
            removeMarker: function(map, marker) {
              if (map != null && marker != null)
              map.removeObject(marker)
            },


            searchAddress: function(address, options) {
              const url = hereUrlAutocomplete + '?' + getParamsCredentials() + "&country=ARG&query=" + encodeURIComponent(address)+
              "&resultType=houseNumber&maxresults=20&language=es&prox=" + puntoProximidad;
              // &beginHighlight=<b>&endHighlight=</b>

              return $http.get(url,{},{timeout: options.timeout}).then(function(response) {
                // console.log("Resultados para '" + address + "'", results);

                response.data.suggestions.forEach(function(suggestion) {
                  suggestion.customLabel = mapUtils.getLabelAddress(suggestion.address)
                });

                // ordeno las resultados por codigo postal para poner los mas relevantes primero
                // return response.data.suggestions;

                // const suggestions = response.data.suggestions.filter(function (s) {
                //     return s.match_level === 'houseNumber'
                // });
                return orderLocationsByRelevance(response.data.suggestions);


              }).catch(function(err) {
                console.error(err);
              })
            }
          };

          return factory;
        }
      })();
