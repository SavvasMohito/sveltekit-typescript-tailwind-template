<script lang="ts">
	import {
		along,
		booleanPointInPolygon,
		length,
		lineString,
		polygon,
		type Position
	} from '@turf/turf';
	import { GeoJSONSource, Map, Marker } from 'maplibre-gl';
	import 'maplibre-gl/dist/maplibre-gl.css';
	import { onDestroy, onMount } from 'svelte';

	let mapContainer: HTMLDivElement;
	let map: Map;
	type Flight = {
		id: string;
		path: number[][];
		points: Position[];
		data: GeoJSON.Point;
		counter: number;
		isAtRadio?: number;
	};
	type Radio = {
		id: string;
		location: number[];
		data: GeoJSON.Feature;
	};

	onMount(() => {
		const apiKey = 'g8fxmkHVpTVC2bHwEEls';

		// const initialState = { lng: -2.5900337, lat: 51.4528211, zoom: 12 }; // Bristol
		const initialState = { lng: -0.9765871, lat: 51.8452398, zoom: 16 };

		var flights: Flight[] = [
			// {
			// 	id: 'drone1',
			// 	path: [
			// 		[-0.9744197, 51.8466188],
			// 		[-0.9763616, 51.8465923],
			// 		[-0.9766191, 51.8464465],
			// 		[-0.9767103, 51.8459461],
			// 		[-0.9765708, 51.8458367],
			// 		[-0.9746128, 51.8457738],
			// 		[-0.9743017, 51.8459063],
			// 		[-0.9742159, 51.8464929],
			// 		[-0.974409, 51.8466089]
			// 	],
			// 	points: [],
			// 	data: {
			// 		type: 'Point',
			// 		coordinates: []
			// 	},
			// 	counter: 0
			// }
			{
				id: 'drone1',
				path: [
					[-0.9744197, 51.8466188],
					[-0.9763616, 51.8465923],
					[-0.9766191, 51.8464465],
					[-0.9763724, 51.8462907],
					[-0.9743822, 51.8463471],
					[-0.9742159, 51.8464929],
					[-0.974409, 51.8466089]
				],
				points: [],
				data: {
					type: 'Point',
					coordinates: []
				},
				counter: 0
			},
			{
				id: 'drone2',
				path: [
					[-0.9766459, 51.8460952],
					[-0.9745377, 51.8460753],
					[-0.9743017, 51.8459063],
					[-0.9746128, 51.8457738],
					[-0.9765708, 51.8458367],
					[-0.9767103, 51.8459461],
					[-0.9766513, 51.8460952]
				],
				points: [],
				data: {
					type: 'Point',
					coordinates: []
				},
				counter: 0
			}
		];

		var radios: Radio[] = [
			{
				id: 'radio1',
				location: [-0.9769839, 51.8461747],
				data: {
					type: 'Feature',
					properties: {},
					geometry: {
						type: 'Polygon',
						coordinates: [
							[
								[-0.9762597, 51.8466752],
								[-0.9767103, 51.8467679],
								[-0.9772253, 51.8467679],
								[-0.9775794, 51.8466155],
								[-0.9777081, 51.8463835],
								[-0.9777617, 51.8460455],
								[-0.9775686, 51.8458665],
								[-0.9773111, 51.8457671],
								[-0.9769893, 51.845734],
								[-0.9766674, 51.8457008],
								[-0.9763455, 51.845734],
								[-0.9760666, 51.8458864],
								[-0.9759486, 51.8461515],
								[-0.9759593, 51.8464498],
								[-0.9762597, 51.8466752]
							]
						]
					}
				}
			},
			{
				id: 'radio2',
				location: [-0.9740871, 51.8461151],
				data: {
					type: 'Feature',
					properties: {},
					geometry: {
						type: 'Polygon',
						coordinates: [
							[
								[-0.9737277, 51.8467216],
								[-0.9741461, 51.8468011],
								[-0.9747255, 51.8467547],
								[-0.9750688, 51.8464498],
								[-0.9751117, 51.8461648],
								[-0.9748971, 51.8457671],
								[-0.9743071, 51.8455948],
								[-0.9735668, 51.8456279],
								[-0.9732985, 51.845787],
								[-0.9731698, 51.846019],
								[-0.9732556, 51.8464697],
								[-0.9737277, 51.8467216]
							]
						]
					}
				}
			}
		];

		map = new Map({
			container: mapContainer,
			style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${apiKey}`,
			center: [initialState.lng, initialState.lat],
			zoom: initialState.zoom,
			antialias: true
		});

		var route: GeoJSON.Feature = {
			type: 'Feature',
			properties: {},
			geometry: {
				type: 'LineString',
				coordinates: []
			}
		};

		var lineDistance: number;
		var coords: any = [];
		var speed = 2500;
		flights.forEach((flight: Flight) => {
			for (var i = 0; i < flight.path.length - 1; i++) {
				if (route.geometry.type === 'LineString') {
					coords = [flight.path[i], flight.path[i + 1]];
					route.geometry.coordinates = coords;
				}
				lineDistance = length(route, { units: 'kilometers' });
				var line = lineString(coords);
				var steps = speed * lineDistance;
				for (var j = 0; j < lineDistance; j += lineDistance / steps) {
					var segment = along(line, j, { units: 'kilometers' });
					flight.points.push(segment.geometry.coordinates);
				}
			}
		});

		map.on('load', function () {
			radios.forEach((radio) => {
				map.addSource(radio.id, { type: 'geojson', data: radio.data });
				map.addLayer({
					id: radio.id,
					type: 'fill',
					source: radio.id,
					layout: {},
					paint: {
						'fill-color': '#088',
						'fill-opacity': 0.7
					}
				});
				var radioIcon = document.createElement('div');
				radioIcon.style.backgroundSize = 'contain';
				radioIcon.style.backgroundImage =
					'url(https://i.pinimg.com/originals/24/6d/6c/246d6c9c5a7b3c41315d9bc4daf0d6cf.png)';
				radioIcon.style.height = '40px';
				radioIcon.style.width = '40px';
				var marker = new Marker(radioIcon, { anchor: 'bottom', offset: [0, 5] })
					.setLngLat([radio.location[0], radio.location[1]])
					.addTo(map);
			});

			map.loadImage(
				'https://cdn-icons-png.flaticon.com/512/1830/1830867.png',
				function (error, image) {
					if (error) throw error;
					if (image) {
						map.addImage('drone_image', image);
					}

					flights.forEach((flight) => {
						flight.data.coordinates = [flight.points[0][0], flight.points[0][1]];
						map.addSource(flight.id, {
							type: 'geojson',
							data: flight.data
						});
						map.addLayer({
							id: flight.id,
							type: 'symbol',
							source: flight.id,
							layout: {
								'icon-image': 'drone_image',
								'icon-size': 0.1,
								'icon-allow-overlap': true
							}
						});
					});

					function animate() {
						flights.forEach((flight) => {
							if (flight.counter < flight.points.length && flight.data.type === 'Point') {
								flight.data.coordinates = [
									flight.points[flight.counter][0],
									flight.points[flight.counter][1]
								];
								flight.counter++;
							} else {
								flight.data.coordinates = [flight.points[0][0], flight.points[0][1]];
								flight.counter = 1;
							}
							(map.getSource(flight.id) as GeoJSONSource).setData(flight.data);

							// Display drone location messages
							if (
								radios[0].data.geometry.type === 'Polygon' &&
								radios[1].data.geometry.type === 'Polygon'
							) {
								var isAt1 = booleanPointInPolygon(
									flight.data,
									polygon(radios[0].data.geometry.coordinates)
								);
								var isAt2 = booleanPointInPolygon(
									flight.data,
									polygon(radios[1].data.geometry.coordinates)
								);
								if (isAt1 && flight.isAtRadio != 1) {
									// console.log(flight.id + ' entered radio1 radius');
									flight.isAtRadio = 1;
								}
								if (isAt2 && flight.isAtRadio != 2) {
									// console.log(flight.id + ' entered radio2 radius');
									flight.isAtRadio = 2;
								}
								if (!isAt1 && !isAt2 && flight.isAtRadio != 0) {
									// console.log(flight.id + ' left radio' + flight.isAtRadio + ' radius');
									flight.isAtRadio = 0;
								}
							}
						});

						// request another frame
						requestAnimationFrame(animate);
					}
					animate();
				}
			);
		});
	});

	onDestroy(() => {
		if (map) {
			map.remove();
		}
	});
</script>

<div class="map-wrap">
	<a href="https://www.maptiler.com" class="watermark"
		><img src="https://api.maptiler.com/resources/logo.svg" alt="MapTiler logo" /></a
	>
	<div class="map" id="map" bind:this={mapContainer} />
</div>

<style>
	.map-wrap {
		position: relative;
		width: 100%;
		height: calc(100vh - 84px); /* calculate height of the screen minus the heading */
	}

	.map {
		position: absolute;
		width: 100%;
		height: 100%;
	}

	.watermark {
		position: absolute;
		left: 10px;
		bottom: 10px;
		z-index: 999;
	}
</style>
