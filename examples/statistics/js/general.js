Filters = {};
Filters.getPixels = function(img) {
  /*var c = this.getCanvas(img.width, img.height);
  var ctx = c.getContext('2d');
  ctx.drawImage(img, 0, 0);
  return ctx.getImageData(0,0,c.width,c.height);*/
  return img;
};

Filters.getCanvas = function(w,h) {
  var c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  c.style.width = w+"px";
  c.style.height = h+"px";
  return c;
};

Filters.filterImage = function(filter, image, var_args) {
  var args = [this.getPixels(image)];
  for (var i=2; i<arguments.length; i++) {
    args.push(arguments[i]);
  }
  return filter.apply(null, args);
};

Filters.tmpCanvas = document.createElement('canvas');
Filters.tmpCtx = Filters.tmpCanvas.getContext('2d');

Filters.createImageData = function(w,h) {
  return this.tmpCtx.createImageData(w,h);
};

Filters.grayscale = function(pixels, args) {
  var d = pixels.data;
  for (var i=0; i<d.length; i+=4) {
    var r = d[i];
    var g = d[i+1];
    var b = d[i+2];
    // CIE luminance for the RGB
    // The human eye is bad at seeing red and blue, so we de-emphasize them.
    var v = 0.2126*r + 0.7152*g + 0.0722*b;
    d[i] = d[i+1] = d[i+2] = v
  }
  return pixels;
};

Filters.convolute = function(pixels, weights, opaque) {
  var side = Math.round(Math.sqrt(weights.length));
  var halfSide = Math.floor(side/2);
  var src = pixels.data;
  var sw = pixels.width;
  var sh = pixels.height;
  // pad output by the convolution matrix
  var w = sw;
  var h = sh;
  var output = Filters.createImageData(w, h);
  var dst = output.data;
  // go through the destination image pixels
  var alphaFac = opaque ? 1 : 0;
  for (var y=0; y<h; y++) {
    for (var x=0; x<w; x++) {
      var sy = y;
      var sx = x;
      var dstOff = (y*w+x)*4;
      // calculate the weighed sum of the source image pixels that
      // fall under the convolution matrix
      var r=0, g=0, b=0, a=0;
      for (var cy=0; cy<side; cy++) {
        for (var cx=0; cx<side; cx++) {
          var scy = sy + cy - halfSide;
          var scx = sx + cx - halfSide;
          if (scy >= 0 && scy < sh && scx >= 0 && scx < sw) {
            var srcOff = (scy*sw+scx)*4;
            var wt = weights[cy*side+cx];
            r += src[srcOff] * wt;
            g += src[srcOff+1] * wt;
            b += src[srcOff+2] * wt;
            a += src[srcOff+3] * wt;
          }
        }
      }
      dst[dstOff] = r;
      dst[dstOff+1] = g;
      dst[dstOff+2] = b;
      dst[dstOff+3] = a + alphaFac*(255-a);
    }
  }
  return output;
};

var w = 150;
var h = 110;

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

// define the donut
var cX = 50;
var cY = 50;
var radius = Math.min(cX,cY)*.75;

// the datapoints
var data1=[];
data1.push(20);
data1.push(10);
data1.push(30);
data1.push(30);
data1.push(10);

// colors to use for each datapoint
var colors=[];
colors.push("teal");
colors.push("rgb(165,42,42)");
colors.push("purple");
colors.push("green");
colors.push("cyan");
colors.push("gold");

// track the accumulated arcs drawn so far
var totalArc=0;

function createTree(amount){
	leaf_amount = 0;
	off = 0;
	fullAmount = amount;
	tAmount = 0;
	var end = 0;
	var tmulti = 0;
	while(end < amount){
		tmulti++;
		end = Math.pow(tmulti, max_level-1);
	}
	multiply = tmulti;

	var canvas1 = document.createElement('canvas');
	var ctx1 = canvas1.getContext('2d');
	canvas1.style.width = w+'px';
	canvas1.style.height = h+'px';
	canvas1.width = w;
	canvas1.height = h;

	var canvas2 = document.createElement('canvas');
	var ctx2 = canvas2.getContext('2d');
	canvas2.style.width = w+'px';
	canvas2.style.height = h+'px';
	canvas2.width = w;
	canvas2.height = h;

	var canvas3 = document.createElement('canvas');
	var ctx3 = canvas3.getContext('2d');
	canvas3.style.width = w+'px';
	canvas3.style.height = h+'px';
	canvas3.width = w;
	canvas3.height = h;

	ctx1.strokeStyle = "rgba(0, 0, 0, 0.5)";
	ctx1.lineJoin = "round";
	ctx1.lineCap = "round";
	ctx1.lineWidth = 0.5;

	ctx1.save();
	
	//ctx1.translate(50,50);

    totalArc=0;

    // draw the donut
    drawDonut(ctx1);

	ctx1.restore();

	var image = ctx1.getImageData(0,0,canvas1.width,canvas1.height);

	ctx2.drawImage(canvas1, 0, 0);

	var tImage = Filters.filterImage(Filters.grayscale, image);
	tImage = Filters.filterImage(Filters.convolute, tImage,
	  [ 1/19, 1/19, 1/19,
	    1/19, 1/19, 1/19,
	    1/19, 1/19, 1/19 ]
	);

	ctx1.putImageData(tImage, 0, 0);

	ctx3.save();
    ctx3.transform(1,0,-1.5,1,0,0);
	ctx3.drawImage(canvas1, 150, 44, 100, 55);
	ctx3.restore();
	ctx3.drawImage(canvas2, 0, 0);

	return canvas3.toDataURL("image/png");
}

// draw a wedge
function drawWedge2(percent, color, ctx) {
	// calc size of our wedge in radians
	var WedgeInRadians=percent/100*360 *Math.PI/180;
	// draw the wedge
	ctx.save();
	ctx.beginPath();
	ctx.moveTo(cX, cY);
	ctx.arc(cX, cY, radius, totalArc, totalArc+WedgeInRadians, false);
	ctx.arc(cX, cY, radius/2, totalArc+WedgeInRadians, totalArc , true);
	ctx.closePath();
	ctx.fillStyle = color;
	ctx.fill();
	ctx.restore();
	// sum the size of all wedges so far
	// We will begin our next wedge at this sum
	totalArc+=WedgeInRadians;
}

// draw the donut one wedge at a time
function drawDonut(ctx){
	for(var i=0;i<data1.length;i++){
	    drawWedge2(data1[i],colors[i], ctx);
	}
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
	map = L.mapbox.map('map', 'juli84.gdc638hh').setView([52.5172578, 13.4045125], 9);

	//map.on('zoomend', function(e){ setTooltip(); });
	//map.on('moveend', function(e){ setTooltip(); });

	markers = L.markerClusterGroup({
		maxClusterRadius: 100,
		iconCreateFunction: function (cluster) {
			//url
			var url = createTree(cluster.getChildCount());
			return L.divIcon({ html: '<div class="customMarkerIcon" title="'+cluster.getChildCount()+'" style="background-image:url('+url+');">&nbsp;</div>', className:'generativeMarker', iconSize: L.point(150, 110) });
		},
		//Disable all of the defaults:
		spiderfyOnMaxZoom: false, showCoverageOnHover: false, zoomToBoundsOnClick: true
	});

	markerCount = 0;
	trees = [];

	for(var i = 0; i<100; i++){
		trees.push(createTree(1));
	}
	populate();	
});