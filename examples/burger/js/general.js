Filters = {};
Filters.getPixels = function(img) {
  var c = this.getCanvas(img.width, img.height);
  var ctx = c.getContext('2d');
  ctx.drawImage(img, 0, 0);
  return ctx.getImageData(0,0,c.width,c.height);
};

Filters.getCanvas = function(w,h) {
  var c = document.createElement('canvas');
  c.width = w;
  c.height = h;
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

var w = 180;
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
	var c_image;
	if(amount <= 1){
		c_image = burgerImg1;
	}else if(amount < step){
		c_image = burgerImg2;
	}else{
		c_image = burgerImg3;
	}

	var canvas = document.createElement('canvas');
	var ctx = canvas.getContext('2d');

	canvas.style.width = w+'px';
	canvas.style.height = h+'px';
	canvas.width = w;
	canvas.height = h;

	ctx.strokeStyle = "rgba(0, 0, 0, 1)";
	ctx.lineJoin = "round";
	ctx.lineCap = "round";

	roundRect(ctx, r, r, c_size, c_size, r, "rgba(0,0,0,1)", false);
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
	ctx.drawImage(pImage, 165+((((size-min_size)/2213 * amount)/(size-min_size))*4), 70-((((size-min_size)/2213 * amount)/(size-min_size))*20), 147, 55);
	ctx.restore();

	ctx.save();
	ctx.translate(5, 37-offset);
	ctx.drawImage(image, 0, 0);
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
	map = L.mapbox.map('map', 'juli84.gdc638hh').setView([52.5172578, 13.4045125], 7);

	map.on('zoomend', function(e){ setTooltip(); });
	map.on('moveend', function(e){ setTooltip(); });

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

	burgerImg1 = new Image();
	burgerImg2 = new Image();
	burgerImg3 = new Image();
	
	burgerImg1.onload = function() {
		if(navigator.userAgent.toLowerCase().indexOf("chrome")>1){
			burgerImg2.src = "./img/burger-2.svg";
		}else{
			burgerImg2.src = "./img/burger-2.png";
		}
	}

	burgerImg2.onload = function() {
		if(navigator.userAgent.toLowerCase().indexOf("chrome")>1){
			burgerImg3.src = "./img/burger-3.svg";
		}else{
			burgerImg3.src = "./img/burger-3.png";
		}
	}

	burgerImg3.onload = function() {
		for(var i = 0; i<100; i++){
			trees.push(createTree(1));
		}
		populate();	
	}

	if(navigator.userAgent.toLowerCase().indexOf("chrome")>1){
		burgerImg1.src = "./img/burger-1.svg";
	}else{
		burgerImg1.src = "./img/burger-1.png";
	}
	
});