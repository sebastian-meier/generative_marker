/*

	Example for drawing generative Markers
	In this example we draw a random hexagon

*/

var w = 150;		//Width of marker image
var h = 110;		//Height of marker image
var radius = 35;	//Radius for the draw hexagon

//This function is called by the function that loads the data
//The variable data is one item from the loaded json file
function drawMarker(data){

	//Canvas and Context
	//1 is used for drawing the actual marker
	//2 is used for drawing the shadow
	//3 is used for combinding marker and shadow
	var canvas = [];
	var ctx = [];
	for(var i = 0; i<3; i++){
		canvas[i] = document.createElement('canvas');
		ctx[i] = canvas[i].getContext('2d');
		canvas[i].style.width = w+'px';
		canvas[i].style.height = h+'px';
		canvas[i].width = w;
		canvas[i].height = h;	
	}

	/*

		START — DRAWING THE MARKER

	*/

	ctx[0].strokeStyle = "rgba(0, 0, 0, 0.5)";
	ctx[0].lineJoin = "round";
	ctx[0].lineCap = "round";
	ctx[0].lineWidth = 0.5;

	ctx[0].save();	
	ctx[0].translate(50,50);

	ctx[0].beginPath();
	ctx[0].moveTo(polar_x(20, 0), polar_y(20, 0));
	ctx[0].fillStyle = "rgba(255,255,255,1)";
	ctx[0].lineTo(polar_x(20, 60),  polar_y(20, 60));
	ctx[0].lineTo(polar_x(20, 120), polar_y(20, 120));
	ctx[0].lineTo(polar_x(30, 180), polar_y(30, 180));
	ctx[0].lineTo(polar_x(20, 240), polar_y(20, 240));
	ctx[0].lineTo(polar_x(20, 300), polar_y(20, 300));
	ctx[0].lineTo(polar_x(20, 360), polar_y(20, 360));
	ctx[0].closePath();
	ctx[0].fill();
	ctx[0].stroke();

	ctx[0].beginPath();
	ctx[0].moveTo(polar_x(20, 0), polar_y(20, 0));
	ctx[0].fillStyle = "rgba(255,0,0,0.2)";
	ctx[0].lineTo(polar_x(20, 60),  polar_y(20, 60));
	ctx[0].lineTo(polar_x(20, 120), polar_y(20, 120));
	ctx[0].lineTo(polar_x(30, 180), polar_y(30, 180));
	ctx[0].lineTo(polar_x(20, 240), polar_y(20, 240));
	ctx[0].lineTo(polar_x(20, 300), polar_y(20, 300));
	ctx[0].lineTo(polar_x(20, 360), polar_y(20, 360));
	ctx[0].closePath();
	ctx[0].fill();

	for(var i = 0; i<10; i++){
		ctx[0].fillStyle = "rgba("+Math.round(Math.random()*255)+","+Math.round(Math.random()*255)+","+Math.round(Math.random()*255)+","+Math.random()/2+")";
		var cr = 20;
		ctx[0].beginPath();
		var a = Math.round(Math.random()*6)*60;
		if(a==180){cr=30;}else{cr=20;}
		ctx[0].moveTo(polar_x(cr, a), polar_y(cr, a));
		var a1 = a+60;
		if(a1>360){a1 -= 360;}
		if(a1==180){cr=30;}else{cr=20;}
		ctx[0].lineTo(polar_x(cr, a1), polar_y(cr, a1));
		var a2 = a1+180;
		if(a2 > 360){a2 -= 360;}
		if(a2==180){cr=30;}else{cr=20;}
		ctx[0].lineTo(polar_x(cr, a2), polar_y(cr, a2));
		ctx[0].closePath();
		ctx[0].fill();
	}

	ctx[0].restore();

	/*

		END — DRAWING THE MARKER

	*/

	//The marker is copied to an image
	var image = ctx[0].getImageData(0,0,canvas[0].width,canvas[0].height);

	//The image is drawn onto the second canvas (this is a backup of our original marker which is going to copied to the final image in the end)
	ctx[1].drawImage(canvas[0], 0, 0);

	//The image of our marker is now turned in greyscale
	//Attention if you want your shadow to be a greyscale version of your marker this is fine
	//But in most cases you actually want a black version of your marker
	//1. There are two solutions to this, draw a second version of your marker in black
	//2. Write a new Filter that turns every colored pixel black
	//It depends on the complexity of your marker, but in my cases drawing a second version was faster
	var tImage = Filters.filterImage(Filters.grayscale, image);
	//The following line is making the shadow transparent
	tImage = Filters.filterImage(Filters.convolute, tImage,
	  [ 1/19, 1/19, 1/19,
	    1/19, 1/19, 1/19,
	    1/19, 1/19, 1/19 ]
	);

	//The greyscale image is drawn again onto the first canvas
	ctx[0].putImageData(tImage, 0, 0);


	//The next four lines draw a distorted version of the marker shadow
	ctx[2].save();
    ctx[2].transform(1,0,-1.5,1,0,0);
	ctx[2].drawImage(canvas[0], 138, 40, 100, 55);
	ctx[2].restore();

	//finally we draw our marker on top
	ctx[2].drawImage(canvas[1], 0, 0);

	//and send back the image file-string
	return canvas[2].toDataURL("image/png");
}

function populate() {
	//The data for this example is coming from data.js
	//But you could of course use any kind of json data
	for (var i = 0; i < 50 && markerCount < data.points.length; i++) {
		//Here we apply the individual markers
		url = marker[Math.round(Math.random()*(marker.length-1))];
		var m = L.marker(
			L.latLng(
				data.points[markerCount].latitude, 
				data.points[markerCount].longitude
			), {
				icon:L.divIcon({ 
					html: '<div style="background-image:url('+url+');">&nbsp;</div>', 
					className:'generativeMarker', 
					iconSize: L.point(150, 110), 
					iconAnchor: L.point(75, 100) 
				})
			});

		//And add the marker to the cluster
		markers.addLayer(m);
		markerCount++;
	}

	if(markerCount<data.points.length){
		//Depending on the size of your dataset you should create subsets and don't add all at once
		setTimeout("populate()", 1);
	}else{
		//Yay, we are done, lets remove that loading screen and start our cluster
		document.getElementById("body").removeChild(document.getElementById("loading"));
		map.addLayer(markers);
	}
}

var markers, map, markerCount, marker;
$(document).ready(function() {

	//Initializing the Map
	map = L.mapbox.map('map', 'YOURMAPBOX-ID-HERE').setView([52.5172578, 13.4045125], 9);

	//Initialize the Marker Cluster Group
	markers = L.markerClusterGroup({
		maxClusterRadius: 100,
		iconCreateFunction: function (cluster) {
			//Here we call the marker function, which returns an image-string
			var url = drawMarker(cluster.getChildCount());
			//The image string is then used as a background image for Div-Icon
			return L.divIcon({ html: '<div class="customMarkerIcon" title="'+cluster.getChildCount()+'" style="background-image:url('+url+');">&nbsp;</div>', className:'generativeMarker', iconSize: L.point(150, 110) });
		},
		//Disable all of the defaults:
		spiderfyOnMaxZoom: false, showCoverageOnHover: false, zoomToBoundsOnClick: true
	});

	markerCount = 0;
	marker = [];

	//If the marker is only customized by its cluster-data
	//It is wise to prebuild a set of markers for the individual Markers
	for(var i = 0; i<100; i++){
		marker.push(drawMarker(1));
	}

	//Lets add some data to the cluster
	populate();	
});

//Just some polar functions to convert x/y into radius/angle
function polar_x(radius, angle) {return(radius * Math.cos(Math.PI/180*angle + Math.PI/180*270));}
function polar_y(radius, angle) {return(radius * Math.sin(Math.PI/180*angle + Math.PI/180*270));}
function polar_radius(x, y) {return(Math.sqrt(Math.pow(x,2)+Math.pow(y,2)));}
function polar_angle(x, y) {return(Math.atan( y / x ));}
