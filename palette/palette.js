var paletteHS, paletteL, pointer, paletteHSOffset, paletteLOffset, newColor, oldColor, edit, editProperty, hex, pressed, crossShowing

function detectElements() {
	paletteHS = document.getElementById("palettehs")
	paletteL = document.getElementById("palettel")
	pointer = document.getElementById("pointer")	
	newColor = document.getElementById("newColor")
	oldColor = document.getElementById("oldColor")
	edit = document.getElementById("edit")
	hex = document.getElementById("hex")
	editProperty = "color"	
	pressed = [false, false]
}

function toggleBlockDisplay(el) {
  el.style.display = (el.style.display == 'none') ? 'block' : 'none'
}

function getTarget(event) {
	event = event || window.event
	return event.target || event.srcElement
}
function getRelatedToTarget(event) {
	event = event || window.event
	return event.relatedTarget || event.toElement
}
function getRelatedFromTarget(event) {
	event = event || window.event
	return event.relatedTarget || event.fromElement
}
function getCheckedRadioId(name) {
	var elements = document.getElementsByName(name);
	for (var i = 0, len = elements.length; i < len; ++i)
		if (elements[i].checked)
			return elements[i].id;
}
function getCumulativeOffset(element) {
    var top = 0, left = 0;
    do {
        top += element.offsetTop  || 0;
        left += element.offsetLeft || 0;
        element = element.offsetParent;
    } while(element);

    return {
        top: top,
        left: left
    };
};

function createClearBr(parent) {
	var b = document.createElement('br')
	b.style.clear = 'both'
	parent.appendChild(b)
}
function createHsDiv(h,s, parent) {
	var a = document.createElement('div')
	a.style.background = 'hsl(' + h + ',' + s + '%,' + '50%)'
	parent.appendChild(a)
}
function createLDiv(height, parent) {
	var a = document.createElement('div')
	a.style.height = height
	parent.appendChild(a)
}
function createPaletteHSDiv(width, parent) {
	var a = document.createElement('div')
	a.className = "palette-hs"
	a.style.width = width;
	parent.appendChild(a);
	return a;
}

function rgbToRgbColor(rgb) {
	return 'rgb(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ')';
}
function rgbColorToHexColor(color) {
  color = color.replace(/\s/g,"");
  var aRGB = color.match(/^rgb\((\d{1,3}[%]?),(\d{1,3}[%]?),(\d{1,3}[%]?)\)$/i);

  if(aRGB)
  {
    color = '';
    for (var i=1;  i<=3; i++) color += Math.round((aRGB[i][aRGB[i].length-1]=="%"?2.55:1)*parseInt(aRGB[i])).toString(16).replace(/^(.)$/,'0$1');
  }
  else color = color.replace(/^#?([\da-f])([\da-f])([\da-f])$/i, '$1$1$2$2$3$3');
  
  return color;
}
function rgbColorToRgb(color) {
	color = color.replace(/\s/g,"");
	var aRGB = color.match(/^rgb\((\d{1,3}[%]?),(\d{1,3}[%]?),(\d{1,3}[%]?)\)$/i);
	return [aRGB[1],aRGB[2],aRGB[3]]
}
function hexColorToRgb(color) {
	var r = parseInt(color.substring(0,2),16)
	var g = parseInt(color.substring(2,4),16)
	var b = parseInt(color.substring(4,6),16)
	return [r,g,b]
}
function rgbToHsl(rgb) {
    var r = rgb[0]/255, g = rgb[1]/255, b = rgb[2]/255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;

    if(max == min){
        h = s = 0;
    }else{
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max){
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return [h*360, s*100, l*100];
}

function updateLColorPalette(rgbColor) {
	var rgb = rgbColorToRgb(rgbColor)
	var hsl = rgbToHsl(rgb)
	
	var nodes = paletteL.querySelectorAll('div')
	var length = nodes.length
	var stepL
	if (length < 101)
		stepL = 101 / (length - 1)
	else
		stepL = 101 / length
	for (var i = 0, node; node = nodes[i]; i++)
		node.style.background = 'hsl(' + hsl[0] + ',' + hsl[1] + '%,' + i * stepL + '%)'
	if (length < 101)
		nodes[length - 1].style.background = 'hsl(0,0%,100%)' // last color is white 
}

function createHslColorPalette(stepH, stepS, stepL) {
	if (stepH < 1 || stepH > 60)
		stepH = 2
	if (stepS < 1 || stepS > 10)
		stepS = 2
	if (stepL < 1 || stepL > 50)
		stepL = 1
	
	for (var h = 0; h < 360; h+=stepH) {
	    for (var s = 0; s < 101; s+=stepS) {
		createHsDiv(h, s, paletteHS)
	    }
	    createClearBr(paletteHS)
	}
	
	var paletteLHeight = paletteHS.querySelector('div').clientHeight * 360 / stepH
	var lDivsCount = Math.floor(101 / stepL)
	if (stepL > 1) {                 // for white color
		lDivsCount++
	}
	var h = Math.floor(paletteLHeight / lDivsCount)
	paletteL.style.height =  h * lDivsCount + 'px'
	if (h == 0)
		h = 1
		
	h += 'px'
	for (var l = 0; l < lDivsCount; l++) {
		createLDiv(h, paletteL)
		createClearBr(paletteL)
	}
	
	previewColor(-1, 'rgb(0,0,0)')
	paletteLOffset = getCumulativeOffset(paletteL)
	paletteHSOffset = getCumulativeOffset(paletteHS)
}

function handleRadioChange() {
	editProperty = getCheckedRadioId("colorradio")
}

function crossDown(event) {
	hideCross()
	pressed[0] = true
}
function hideCross() {
	cross.style.display = 'none'
	crossShowing = false
}
function redrawColorCross() {
	crossShowing = true
	cross.style.display = 'block'
	if (pressed[0])	{
		cross.style.top = event.pageY - 3 + 'px'
		cross.style.left = event.pageX - 3 + 'px'
	}
}
function redrawColorPointer(event) {
	if (pressed[1])
		pointer.style.top = event.pageY - paletteLOffset.top + 'px'
}

function mouseDown(event) {
	document.onselectstart = function(){ return false; }
	if(getTarget(event).parentNode.id == 'palettehs') {
		pressed[0] = true
		hideCross()
	}
	else {
		pressed[1] = true
		redrawColorPointer(event)
	}
	mouseOver(event)	
}
function mouseUp(event) {	
	redrawColorCross()
	if (pressed[1])
		setColor(event)  
	pressed[0] = false
	pressed[1] = false
}
function mouseOut(event) {
	document.onselectstart = function(){ return true; }
	var t = getRelatedFromTarget(event)
	if(t.id == 'palettehs') {
		redrawColorCross()
		pressed[0] = false
	}
	if(t.id == 'palettel')
		 pressed[1] = false
}
function mouseOver(event) {
	var i
	var t = getTarget(event)
	
	if(t.parentNode.id == 'palettehs') {
		i = 0
		pressed[1] = false
	}
	else {
		i = 1
		pressed[0] = false
	}
	previewColor(i, t.style.backgroundColor)
}

function previewColor(i, color) {
	if (i == -1 || pressed[i]) {
		newColor.style.backgroundColor = color
		if (i != 1) {
			updateLColorPalette(color)
		}
		updateTextValues(color)
	}
}
function updateTextValues(color) {
	var rgb = rgbColorToRgb(color)
	hex.value = '#' + rgbColorToHexColor(color)
	rSlider.value = rgb[0]
	gSlider.value = rgb[1]
	bSlider.value = rgb[2]
	rgbValue.value = color
}
function sliderPreview(event) {
	hideCross()
	var t = getTarget(event)
	var rgb = rgbColorToRgb(newColor.style.backgroundColor)
	switch (t.id) {
		case 'rSlider': rgb[0] = t.value; break
		case 'gSlider': rgb[1] = t.value; break
		case 'bSlider': rgb[2] = t.value; break
	}
	previewColor(-1, rgbToRgbColor(rgb))	
}
function setColor() {
	var color = newColor.style.backgroundColor
	oldColor.style.backgroundColor = color
	edit.style[editProperty] = color
}