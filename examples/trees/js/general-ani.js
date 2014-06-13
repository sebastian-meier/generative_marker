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