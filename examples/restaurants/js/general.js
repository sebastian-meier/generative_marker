var w = 180;
var h = 120;

var radius = 35;
var angle_range = 35;
var max_level = 7;
var multiply = 3;
var line_multiply = 4;
var leafSize = 2;
var fullAmount = 0;
var tAmount = 0;
var leaf_amount = 0;
var off = 0;

function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
  if (typeof stroke == "undefined" ) {
    stroke = true;
  }
  if (typeof radius === "undefined") {
    radius = 5;
  }
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  if (stroke) {
    ctx.stroke();
  }
  if (fill) {
    ctx.fill();
  }        
}


function createTree(amount){
	var r = 10;
	var max = 2213;
	var min_size = 50;
	var size = 90;

	var c_size = min_size + ((size-min_size)/2213 * amount);

	var offset = c_size-min_size; 
	if(offset < 0){offset = 0;}

	var step = 2213/2;
	var c_image = restaurantImg;

	var canvas = document.createElement('canvas');
	var ctx = canvas.getContext('2d');

	canvas.style.width = w+'px';
	canvas.style.height = h+'px';
	canvas.width = w;
	canvas.height = h;

	ctx.strokeStyle = "rgba(0, 0, 0, 1)";
	ctx.lineJoin = "round";
	ctx.lineCap = "round";

	ctx.fillStyle = "rgba(0,0,0,1)";
	roundRect(ctx, r, r, c_size, c_size, r, "rgba(255,255,255,1)", false);

	ctx.fillStyle = "rgba(0,0,0,1)";
	roundRect(ctx, r+5, r+5, c_size-10, c_size-10, r/2, "rgba(255,255,255,1)", false);

	ctx.fillStyle = "rgba(0,0,0,1)";
	ctx.beginPath();
	ctx.moveTo(r+c_size/2 - 5, r+c_size-1);
	ctx.lineTo(r+c_size/2 + 5, r+c_size-1);
	ctx.lineTo(r+c_size/2, r+c_size+5);
	ctx.lineTo(r+c_size/2 - 5, r+c_size-1);
	ctx.closePath();
	ctx.fill();

	var image = new Image();
	image.width = w;
	image.height = h;
	image.style.width = w+"px";
	image.style.height = h+"px";
	image.src = canvas.toDataURL("image/png");

	var tImage = Filters.filterImage(Filters.grayscale, image);
	ctx.putImageData(tImage, 0, 0);
	
	var pImage = new Image();
	pImage.width = w;
	pImage.height = h;
	pImage.style.width = w+"px";
	pImage.style.height = h+"px";
	pImage.src = canvas.toDataURL("image/png");
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.drawImage(pImage, 0, 0);

	var gimage = new Image();
	gimage.width = w;
	gimage.height = h;
	gimage.style.width = w+"px";
	gimage.style.height = h+"px";
	gimage.src = canvas.toDataURL("image/png");
	var tImage = Filters.filterImage(Filters.convolute, gimage,
	  [ 1/19, 1/19, 1/19,
	    1/19, 1/19, 1/19,
	    1/19, 1/19, 1/19 ]
	);

	ctx.putImageData(tImage, 0, 0);
	pImage = new Image();
	pImage.width = w;
	pImage.height = h;
	pImage.style.width = w+"px";
	pImage.style.height = h+"px";
	pImage.src = canvas.toDataURL("image/png");
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	ctx.save();
    ctx.transform(1,0,-1.5,1,0,0);
	ctx.drawImage(pImage, 183-((amount/2213)*11), 87-((amount/2213)*27), 165, 55);
	ctx.restore();

	ctx.save();
	ctx.translate(5, 37-offset);
	
	console.log(amount+":rgba(255,"+Math.round(255-(255* Math.sqrt(amount/2213)))+","+Math.round(255-(255* Math.sqrt(amount/2213)))+",1)");

	ctx.fillStyle = "rgba(255,"+Math.round(255-(255* Math.sqrt(amount/2213)))+","+Math.round(255-(255* Math.sqrt(amount/2213)))+",1)";
	roundRect(ctx, r, r+5, c_size, c_size+(10-(10* Math.sqrt(amount/2213))), r, true, false);

	ctx.fillStyle = "rgba(255,255,255,1)";
	roundRect(ctx, r+5, r+10, c_size-10, c_size-10+(10-(10* Math.sqrt(amount/2213))), r/2, true, false);

	ctx.translate(0, 5+(10-(10* Math.sqrt(amount/2213))));
	ctx.fillStyle = "rgba(255,"+Math.round(255-(255* Math.sqrt(amount/2213)))+","+Math.round(255-(255* Math.sqrt(amount/2213)))+",1)";
	ctx.beginPath();
	ctx.moveTo(r+c_size/2 - 5, r+c_size-1);
	ctx.lineTo(r+c_size/2 + 5, r+c_size-1);
	ctx.lineTo(r+c_size/2, r+c_size+5);
	ctx.lineTo(r+c_size/2 - 5, r+c_size-1);
	ctx.closePath();
	ctx.fill();

	ctx.translate(0, -5);

	if(amount>1){
		ctx.font = '10px Arial';
		ctx.textAlign = 'center';
		ctx.fillStyle = 'black';
		ctx.fillText(amount, r+c_size/2, r+c_size-5);
	}

	ctx.drawImage(c_image, r+(c_size*0.1), r+(c_size*0.1)-1, c_size-(c_size*0.2), c_size-(c_size*0.2));
	ctx.restore();

	return canvas.toDataURL("image/png");
}


function polar_x(radius, angle) {
	return(radius * Math.cos(Math.PI/180*angle + Math.PI/180*270));
}

function polar_y(radius, angle) {
	return(radius * Math.sin(Math.PI/180*angle + Math.PI/180*270));
}

function polar_radius(x, y) {
	return(Math.sqrt(Math.pow(x,2)+Math.pow(y,2)));
}

function polar_angle(x, y) {
	return(Math.atan( y / x ));
}

function populate() {
	for (var i = 0; i < 50 && markerCount < data.points.length; i++) {
		url = trees[Math.round(Math.random()*(trees.length-1))];
		var m = L.marker(L.latLng(data.points[markerCount].latitude, data.points[markerCount].longitude), {icon:L.divIcon({ html: '<div style="background-image:url('+url+');">&nbsp;</div>', className:'generativeMarker', iconSize: L.point(150, 110), iconAnchor: L.point(75, 100) })});
		markers.addLayer(m);
		markerCount++;
	}
	if(markerCount<data.points.length){
		setTimeout("populate()", 1);
	}else{
		document.getElementById("body").removeChild(document.getElementById("loading"));
		map.addLayer(markers);
		//setTooltip();
	}
}

function setTooltip(){
	$('.customMarkerIcon').tooltip({
		position: {
			my: "center top",
			at: "center-25 bottom",
			using: function( position, feedback ) {
				$( this ).css( position );
				$( "<div>" )
					.addClass( "arrow" )
					.addClass( feedback.vertical )
					.addClass( feedback.horizontal )
					.appendTo( this );
			}
		}
	});
}

var markers, map, markerCount, trees, leafImg;

$(document).ready(function() {
	map = L.mapbox.map('map', 'YOUR-MAPBOX-ID-HERE').setView([52.5172578, 13.4045125], 7);

	//map.on('zoomend', function(e){ setTooltip(); });
	//map.on('moveend', function(e){ setTooltip(); });

	markers = L.markerClusterGroup({
		maxClusterRadius: 100,
		iconCreateFunction: function (cluster) {
			//url
			var url = createTree(cluster.getChildCount());
			return L.divIcon({ html: '<div class="customMarkerIcon" title="'+cluster.getChildCount()+'" style="background-image:url('+url+');">&nbsp;</div>', className:'generativeMarker', iconSize: L.point(180, 120) });
		},
		//Disable all of the defaults:
		spiderfyOnMaxZoom: false, showCoverageOnHover: false, zoomToBoundsOnClick: true
	});

	markerCount = 0;
	trees = [];

	restaurantImg = new Image();

	restaurantImg.onload = function() {
		for(var i = 0; i<100; i++){
			trees.push(createTree(1));
		}
		populate();	
	}

	if(navigator.userAgent.toLowerCase().indexOf("chrome")>1){
		restaurantImg.src = "./img/restaurant.svg";
	}else{
		restaurantImg.src = "./img/restaurant.png";
	}
	
});