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

	ctx1.strokeStyle = "rgba(0, 0, 0, 1)";
	ctx1.lineJoin = "round";
	ctx1.lineCap = "round";

	ctx1.save();
	drawBranch(50, 100, 0, 1, ctx1);
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
	ctx3.drawImage(canvas1, 173, 51, 100, 55);
	ctx3.restore();
	ctx3.drawImage(canvas2, 0, 0);

	return canvas3.toDataURL("image/png");
}

function drawBranch(x, y, angle, level, ctx){
	if(tAmount < fullAmount){
		ctx.beginPath();
		ctx.lineWidth = (max_level+1 - level)/line_multiply;
		ctx.moveTo(x, y);
		var b_angle = ((level*-angle_range)/2) - angle;
		var r_angle = Math.random()*(level*angle_range);

		var t_angle = (b_angle + r_angle);

		var r = radius/level * 0.5 + radius/level * 0.5 * Math.random();

		var px = polar_x(r, t_angle) + x;
		var py = polar_y(r, t_angle) + y;

		ctx.lineTo(px, py);
		ctx.stroke();

		if(level == 1){
			var root = Math.random()*max_level*0.5 + max_level*0.5;
			ctx.beginPath();
			ctx.fillStyle = 'black';
			ctx.moveTo(px, py);
			ctx.lineTo(x+root, y);
			ctx.arc(x, y, root, Math.PI, 2*Math.PI, true);	
			ctx.lineTo(x-root, y);
			ctx.lineTo(px, py);
			ctx.fill();
				ctx.fillStyle = 'rgba(0,0,0,0)';
				var root_amount = Math.random()*5+5;
				var tpx, tpy, tr;
				ctx.lineWidth = 1;
				/*for(var i = 0; i<root_amount; i++){
					tr = root+Math.random()*3+i*1.5;
					tpx = polar_x(tr, 180-(90/root_amount)*i) + x;
					tpy = polar_y(tr, 180-(90/root_amount)*i) + y;
					ctx.beginPath();
					ctx.moveTo(x, y);
					ctx.lineTo(tpx, tpy);
					ctx.stroke();

					tr = root+Math.random()*3+i*1.5;
					tpx = polar_x(tr, 180+(90/root_amount)*i) + x;
					tpy = polar_y(tr, 180+(90/root_amount)*i) + y;
					ctx.beginPath();
					ctx.moveTo(x, y);
					ctx.lineTo(tpx, tpy);
					ctx.stroke();
				}*/
		}

		var leafDraw = false;
		if(level<max_level){
			for(var i = 0; i<multiply; i++){
				if(tAmount < fullAmount){
					drawBranch(px, py, 0, level+1, ctx);
				}else{
					if(!leafDraw){
						drawLeaf(px, py, ctx);		
						leafDraw = true;
					}
				}
			}
		}else{
			drawLeaf(px, py, ctx);
		}
	}else{
		off++;
		drawLeaf(x, y, ctx);
	}
}

function drawLeaf(x, y, ctx){
	if(tAmount<fullAmount){
		tAmount++;
		/*ctx.beginPath();
			ctx.arc(x, y, leafSize, 0, 2 * Math.PI, false);
			ctx.fillStyle = 'green';
			ctx.fill();
			ctx.fillStyle = 'rgba(0,0,0,0)';*/

			var leafImgSize = 20;
			if(fullAmount<10){leafImgSize = 20 + (10-fullAmount)*2;}

		ctx.save(); 
		ctx.translate(x, y); 
		//ctx.translate(leafImgSize/2, leafImgSize/2); 
		ctx.rotate( -0.5 + Math.random() );

			ctx.drawImage(leafImg, -(leafImgSize/2), -(leafImgSize/2), leafImgSize, leafImgSize);

		ctx.restore();
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

var current_tree = 1;

function populate() {
	var tree = createTree(current_tree);
	$('#map').css('background-image', 'url("'+tree+'")');
	$('#map').text(current_tree);
	current_tree++;
}

var markers, map, markerCount, trees, leafImg;

$(document).ready(function() {
	leafImg = new Image();
	leafImg.onload = function() {
		window.setTimeout("window.setInterval('populate()', 50)", 5000);
	}
	leafImg.src = "./img/leaf.png";
});