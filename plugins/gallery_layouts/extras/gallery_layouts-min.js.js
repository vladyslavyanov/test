//***********************************************************************************************************************************/
//  LyteBox v3.22 Modification V1.1 by Coyaba
//  includes and extends the modifications from Pavel Kuzub to Lytebox v3.20 (see below)
//  + geo info, easier hotkey assignment, more options for fade in/out, hidden scrollbars
//  + info overlay (optionally shown on load), additional file param for Info (in lyteframe)
//  + added 'on_dom_load' event handler, configurable slideshow start options,
//  + vertically centered tempFrame
//   Author: Harald Nast
//  Website: http://www.faszination-china.com/about_imaging_lytebox.php
//     Date: November 9, 2007
//
//  LyteBox v3.20 Modification
//  + EasySave, Click To Close, Resize, Info, Exif, Hint modifications and other changes by Pavel Kuzub
//   Author: Pavel Kuzub
//  Website: http://pavel.kuzub/lytebox
//     Date: Sept 9, 2007
//
//  LyteBox v3.22
//  Original Author: Markus F. Hay
//  Website: http://www.dolem.com/lytebox
//     Date: October 2, 2007
//  License: Creative Commons Attribution 3.0 License (http://creativecommons.org/licenses/by/3.0/)
// Browsers: Tested successfully on WinXP with the following browsers (using no DOCTYPE, Strict DOCTYPE, and Transitional DOCTYPE):
//           * Firefox: 2.0.0.4, 1.5.0.12
//           * Internet Explorer: 7.0, 6.0 SP2, 5.5 SP2
//           * Opera: 9.21
//
// Releases: For up-to-date and complete release information, visit http://www.dolem.com/forum/showthread.php?tid=62
//
//   Credit: LyteBox was originally derived from the Lightbox class (v2.02) that was written by Lokesh Dhakar. For more
//           information please visit http://huddletogether.com/projects/lightbox2/
//***********************************************************************************************************************************/
Array.prototype.removeDuplicates = function () { for (var i = 1; i < this.length; i++) { if (this[i][0] == this[i-1][0]) { this.splice(i,1); } } };
Array.prototype.empty = function () { for (var i = 0; i <= this.length; i++) { this.shift(); } };
String.prototype.trim = function () { return this.replace(/^\s+|\s+$/g, ''); };

function LyteBox() {
	if(!$) var $ = YAHOO.util.Dom.get;
	/*** Start Global Configuration ***/
		var lyteboxColour = $('lyteboxColour');
		if(lyteboxColour && lyteboxColour.value != ''){
			if(lyteboxColour.value == 'Set Colour'){
				this.theme				= 'grey';
			} else {
				this.theme				= lyteboxColour.value;	// themes: grey (default), red, green, blue, gold
			}
		} else {
			this.theme				= 'grey';	// themes: grey (default), red, green, blue, gold
		}
		this.hideFlash			= true;		// controls whether or not Flash objects should be hidden
		this.outerBorder		= true;		// controls whether to show the outer grey (or theme) border
		this.resizeSpeed		= 8;		// controls the speed of the image resizing (1=slowest and 10=fastest)
		this.maxOpacity			= 80;		// higher opacity = darker overlay, lower opacity = lighter overlay
		this.navType			= 1;		// 1 = "Prev/Next" buttons on top left and left (default), 2 = "<< prev | next >>" links next to image number
		this.autoResize			= true;		// controls whether or not images should be resized if larger than the browser window dimensions
		this.doAnimations		= true;		// controls whether or not "animate" Lytebox, i.e. resize transition between images, fade in/out effects, etc.
		this.borderSize			= 12;		// if you adjust the padding in the CSS, you will need to update this variable -- otherwise, leave this alone...
	/*** End Global Configuration ***/

	/*** Configure Slideshow Options ***/
		this.slideInterval		= 8000;		// Change value (milliseconds) to increase/decrease the time between "slides" (10000 = 10 seconds)
		this.showNavigation		= true;		// true to display Next/Prev buttons/text during slideshow, false to hide
		this.showClose			= true;		// true to display the Close button, false to hide
		this.showDetails		= true;		// true to display image details (caption, count), false to hide
		this.showPlayPause		= true;		// true to display pause/play buttons next to close button, false to hide
		// 2007-10 coyaba, configurable slideshow start
		this.slideAutoStart		= 0;		// 0 = always paused, 1 = autostart only on first frame, 2 = autostart always
		this.autoEnd			= true;		// true to automatically close Lytebox after the last image is reached, false to keep open
		this.pauseOnNextClick	= true;		// true to pause the slideshow when the "Next" button is clicked
		this.pauseOnPrevClick 	= true;		// true to pause the slideshow when the "Prev" button is clicked
	/*** End Slideshow Configuration ***/

	/*** Start Addon Configuration ***/
		this.easySave			= true;		// true to enable Easy Save (To save image - right click and select Save Target As/Save Link As)
		this.clickToClose		= true;		// true to exit Lytebox when clicking on image (if Navigation buttons are not overlapping). navType=1 only.
		this.C2CrightSided		= true;		// true to use right side style close area on groups with single image
		this.showCloseInFrame	= true;		// true to display the Close button in frame mode despite it is swinched off globaly, false to hide.
		this.showHints			= true;		// true to display Hint messages over the buttons. Good to inform user about shortcuts
		this.showSave			= false;	// true to display Save button next to close button, false to hide
		this.showResize			= false;	// true to display Resize button next to close button, false to hide
		this.showInfo			= false;	// true to display info button next to close button, false to hide. Searches Special Parameter for [info]Additional text[/info]
											// 2007-10 coyaba:
											// if true then the new info overlay is deactivated
											// if false an available info will be displayed as overlay in the lower left corner of the image
		this.showExif			= true;		// true to display exif button next to close button, false to hide. Searches Special Parameter for [exif=true]
		// 2007-10 coyaba, geo support
		this.showGeo			= true;		// true to display geo button next to close button, false to hide. Searches Special Parameter for [geo=true]
		this.showBack			= true;		// true to display back button next to close button, false to hide
		// 2007-10 coyaba, easier hotkey assignment
		this.hotkeyResize		= 'r';
		this.hotkeyInfo			= 'i';
		this.hotkeyExif			= 'e';
		this.hotkeyGeo			= 'g';
		this.hotkeyPrevious		= 'z';
		this.hotkeyNext			= 'w';
		this.hotkeyClose		= 'b';
		// 2007-10 coyaba, extended fade in/out options
		this.doDetailAnimations	= false;
		this.doInfoAnimations	= true;
		// 2007-10 coyaba, opacity for info overlay
		this.infoMaxOpacity		= 60;
	/*** End Addon Configuration ***/

	/*** Start Teg Configuration ***/
		this.tagBox				= 'lytebox';	// Catch the following name in Anchor REV parameter for LyteBox
		this.tagShow			= 'lyteshow';	// Catch the following name in Anchor REV parameter for LyteShow
		this.tagFrame			= 'lyteframe';	// Catch the following name in Anchor REV parameter for LyteFrame
	/*** Start Teg Configuration ***/

	/*** Configure Info, Exif and Geo Configuration ***/
		this.specialParam		= 'rev';				// says to Lytebox, which parameter use to get Info and Exif data
		this.linkInfo			= 'lytebox_info.php?info=%1&file=%2';		// This link will be openned in Lyteframe, information string will be added at the end
		this.linkExif			= 'lytebox_exif.php?filename=';
		// 2007-10 coyaba, geo support
		this.linkGeo			= 'geoImg.php?filename=';
		this.LyteframeStyle		= 'width: 400px; height: 400px; scrolling: auto';	// Default style of Lyteframe (Not really style, but form for sure)
		this.TempFrameStyle		= 'width: 572px; height: 424px; scrolling: auto';	// Default style of Temp Frame to show Info and Exif (Same here)
	/*** End Info, Exif and Geo Configuration ***/

	/*** Start String Configuration ***/
		this.hintClose			= "Close";	// Shortcut: 'Escape' or 'X' or 'C'
		this.hintPlay			= "Play Slideshow";
		this.hintPause			= "Pause Slideshow";
		this.hintNext			= "Next Image.  Shortcut: press 'N'";	// Shortcut: 'Right Arrow' or 'N'
		this.hintPrev			= "Previous Image.  Shortcut: press 'Z'";	// Shortcut: 'Left Arrow' or 'Z'
		this.hintSave			= "Use this button to get link to current image";
		this.hintResize			= "Resize this image OR keep original image size\nShortcut: press 'R' or 'S'";		// Shortcut: 'R' or 'S'
		this.hintInfo			= "Show more information about this picture.\nShortcut: press 'I'";	// Shortcut: 'I'
		this.hintExif			= "Show EXIF information for this picture.\nShortcut: press 'E'";	// Shortcut: 'E'
		this.hintGeo			= "Show Geo/Positions information.\nShortcut: press 'G'";	// Shortcut: 'G'
		this.hintBack			= "Back to the image. Shortcut: press 'Z'";	// Shortcut: 'Left Arrow' or 'Z'
		this.hintEasySave		= "\nSave image: right click, save target as/save link as";
		this.hintClickToClose	= "\nClose ";
		this.textImageNum		= "Image %1 Of %2"; // %1 - current, %2 - total
		this.textPageNum		= "Page %1 Of %2";	// %1 - current, %2 - total
		this.textNavPrev		= "\253 prev";	// &laquo; prev
		this.textNavNext		= "next \273";	// next &raquo;
		this.textNavDelim		= "||";	// Separates Prev and Next
	/*** End String Configuration ***/

	if(this.resizeSpeed > 10) { this.resizeSpeed = 10; }
	if(this.resizeSpeed < 1) { resizeSpeed = 1; }
	this.resizeDuration = (11 - this.resizeSpeed) * 0.15;
	this.resizeWTimerArray		= new Array();
	this.resizeWTimerCount		= 0;
	this.resizeHTimerArray		= new Array();
	this.resizeHTimerCount		= 0;
	this.showContentTimerArray	= new Array();
	this.showContentTimerCount	= 0;
	this.overlayTimerArray		= new Array();
	this.overlayTimerCount		= 0;
	this.imageTimerArray		= new Array();
	this.imageTimerCount		= 0;
	// 2007-10 coyaba, fade in/out for info box
	this.infoTimerArray			= new Array();
	this.infoTimerCount			= 0;
	this.timerIDArray			= new Array();
	this.timerIDCount			= 0;
	this.slideshowIDArray		= new Array();
	this.slideshowIDCount		= 0;
	this.imageArray	 = new Array();
	this.activeImage = null;
	this.slideArray	 = new Array();
	this.activeSlide = null;
	this.frameArray	 = new Array();
	this.activeFrame = null;
	this.checkFrame();
	this.isSlideshow = false;
	this.isLyteframe = false;
	this.isShowTempFrame = false;
	this.TempFrame = new Array();
	// 2007-11 coyaba, for vertically centered tempFrame display
	this.lastMainTop = 0;
	this.HasInfo = false;
	this.HasExif = false;
	// 2007-10 coyaba, geo support
	this.HasGeo = false;
	// 2007-10 coyaba, for storage of scroll position
	this.yPos = 0;
	/*@cc_on
		/*@if (@_jscript)
			this.ie = (document.all && !window.opera) ? true : false;
		/*@else @*/
			this.ie = false;
		/*@end
	@*/
    if (navigator.appName == 'Microsoft Internet Explorer') {
		var rv = -1;
        var ua = navigator.userAgent;
        var re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
        if (re.exec(ua) != null)
            rv = parseFloat(RegExp.$1);
		if((rv >= 8.0) && (rv < 9.0)) {
			this.ie7 = false;
			this.ie8 = true;
		} else if ((rv >= 7.0) && (rv < 8.0)) {
			this.ie7 = true;
			this.ie8 = false;
		}
    }
	//
//	this.ie7 = (this.ie && window.XMLHttpRequest);
	this.initialize();
};

LyteBox.prototype.initialize = function() {
	this.updateLyteboxItems();
	var objBody = this.doc.getElementsByTagName("body").item(0);
	if (this.doc.getElementById('lbOverlay')) {
		objBody.removeChild(this.doc.getElementById("lbOverlay"));
		objBody.removeChild(this.doc.getElementById("lbMain"));
	}
	var objOverlay = this.doc.createElement("div");
		objOverlay.setAttribute('id','lbOverlay');
		objOverlay.setAttribute(((this.ie && !this.ie8) ? 'className' : 'class'), this.theme);
		if ((this.ie && !this.ie7) || (this.ie7 && this.doc.compatMode == 'BackCompat')) {
			objOverlay.style.position = 'absolute';
		}
		objOverlay.style.display = 'none';
		objBody.appendChild(objOverlay);
	var objLytebox = this.doc.createElement("div");
		objLytebox.setAttribute('id','lbMain');
		objLytebox.style.display = 'none';
		objBody.appendChild(objLytebox);
	var objOuterContainer = this.doc.createElement("div");
		objOuterContainer.setAttribute('id','lbOuterContainer');
		objOuterContainer.setAttribute(((this.ie && !this.ie8) ? 'className' : 'class'), this.theme);
		objLytebox.appendChild(objOuterContainer);
	var objIframeContainer = this.doc.createElement("div");
		objIframeContainer.setAttribute('id','lbIframeContainer');
		objIframeContainer.style.display = 'none';
		objOuterContainer.appendChild(objIframeContainer);
	var objIframe = this.doc.createElement("iframe");
		objIframe.setAttribute('id','lbIframe');
		objIframe.setAttribute('name','lbIframe');
		objIframe.setAttribute('frameBorder','0'); // This is fixing issue with frame border in IE
		objIframe.style.display = 'none';
		objIframeContainer.appendChild(objIframe);
	var objImageContainer = this.doc.createElement("div");
		objImageContainer.setAttribute('id','lbImageContainer');
		objOuterContainer.appendChild(objImageContainer);
	var objLyteboxImage = this.doc.createElement("img");
		objLyteboxImage.setAttribute('id','lbImage');
		objImageContainer.appendChild(objLyteboxImage);
	var objLoading = this.doc.createElement("div");
		objLoading.setAttribute('id','lbLoading');
		objOuterContainer.appendChild(objLoading);
	var objDetailsContainer = this.doc.createElement("div");
		objDetailsContainer.setAttribute('id','lbDetailsContainer');
		objDetailsContainer.setAttribute(((this.ie && !this.ie8) ? 'className' : 'class'), this.theme);
		objLytebox.appendChild(objDetailsContainer);
	var objDetailsData =this.doc.createElement("div");
		objDetailsData.setAttribute('id','lbDetailsData');
		objDetailsData.setAttribute(((this.ie && !this.ie8) ? 'className' : 'class'), this.theme);
		objDetailsContainer.appendChild(objDetailsData);
	var objDetails = this.doc.createElement("div");
		objDetails.setAttribute('id','lbDetails');
		objDetailsData.appendChild(objDetails);
	var objCaption = this.doc.createElement("span");
		objCaption.setAttribute('id','lbCaption');
		objDetails.appendChild(objCaption);
	var objHoverNav = this.doc.createElement((this.easySave ? 'a' : 'div')); // Changed element type from DIV to A. Needed to make Quick Save and Click To Close features
		objHoverNav.setAttribute('id','lbHoverNav');
		objHoverNav.setAttribute('title',(this.showHints ? ((this.clickToClose ? this.hintClickToClose : '') + (this.easySave ? this.hintEasySave : '')) : ''));
		objImageContainer.appendChild(objHoverNav);
	// 2007-10 coyaba: container for info overlay
	var objInfoDisplay = this.doc.createElement('div');
		objInfoDisplay.setAttribute('id','lbInfoDisplay');
		objImageContainer.appendChild(objInfoDisplay);
	var objBottomNav = this.doc.createElement("div");
		objBottomNav.setAttribute('id','lbBottomNav');
		objDetailsData.appendChild(objBottomNav);
	var objPrev = this.doc.createElement("a");
		objPrev.setAttribute('id','lbPrev');
		objPrev.setAttribute('title',(this.showHints ? (this.hintPrev + (this.easySave ? this.hintEasySave : '')) : ''));
		objPrev.setAttribute(((this.ie && !this.ie8) ? 'className' : 'class'), this.theme);
		objPrev.setAttribute('href','#');
		objHoverNav.appendChild(objPrev);
	var objNext = this.doc.createElement("a");
		objNext.setAttribute('id','lbNext');
		objNext.setAttribute('title',(this.showHints ? (this.hintNext + (this.easySave ? this.hintEasySave : '')) : ''));
		objNext.setAttribute(((this.ie && !this.ie8) ? 'className' : 'class'), this.theme);
		objNext.setAttribute('href','#');
		objHoverNav.appendChild(objNext);
	var objC2Cleft = this.doc.createElement("a");
		objC2Cleft.setAttribute('id','lbC2Cleft'); // We are creating special field used for Click to Close. Left part will appear on first image/slide in group instead of Prev navigation (navType=1)
		objC2Cleft.setAttribute('title',(this.showHints ? ((this.clickToClose ? this.hintClickToClose : '') + (this.easySave ? this.hintEasySave : '')) : ''));
		objC2Cleft.setAttribute(((this.ie && !this.ie8) ? 'className' : 'class'), this.theme);
		objC2Cleft.setAttribute('href','#'); // In case of single image in image/slide group, either right or left part (depends on settings above) will be used to fill all the natigation area and hide other part.
		objHoverNav.appendChild(objC2Cleft);
	var objC2Cright = this.doc.createElement("a");
		objC2Cright.setAttribute('id','lbC2Cright'); // Right part will appear on last image/slide in group instead of Next navigation (navType=1)
		objC2Cright.setAttribute('title',(this.showHints ? ((this.clickToClose ? this.hintClickToClose : '') + (this.easySave ? this.hintEasySave : '')) : ''));
		objC2Cright.setAttribute(((this.ie && !this.ie8) ? 'className' : 'class'), this.theme);
		objC2Cright.setAttribute('href','#');
		objHoverNav.appendChild(objC2Cright);
	var objNumberDisplay = this.doc.createElement("span");
		objNumberDisplay.setAttribute('id','lbNumberDisplay');
		objDetails.appendChild(objNumberDisplay);
	var objNavDisplay = this.doc.createElement("span");
		objNavDisplay.setAttribute('id','lbNavDisplay');
		objNavDisplay.style.display = 'none';
		objDetails.appendChild(objNavDisplay);
	var objClose = this.doc.createElement("a");
		objClose.setAttribute('id','lbClose');
		objClose.setAttribute('title',(this.showHints ? this.hintClose : '' ));
		objClose.setAttribute(((this.ie && !this.ie8) ? 'className' : 'class'), this.theme);
		objClose.setAttribute('href','#');
		objBottomNav.appendChild(objClose);
	var objPause = this.doc.createElement("a");
		objPause.setAttribute('id','lbPause');
		objPause.setAttribute('title',(this.showHints ? this.hintPause : ''));
		objPause.setAttribute(((this.ie && !this.ie8) ? 'className' : 'class'), this.theme);
		objPause.setAttribute('href','#');
		objPause.style.display = 'none';
		objBottomNav.appendChild(objPause);
	var objPlay = this.doc.createElement("a");
		objPlay.setAttribute('id','lbPlay');
		objPlay.setAttribute('title',(this.showHints ? this.hintPlay : ''));
		objPlay.setAttribute(((this.ie && !this.ie8) ? 'className' : 'class'), this.theme);
		objPlay.setAttribute('href','#');
		objPlay.style.display = 'none';
		objBottomNav.appendChild(objPlay);
	var objSave = this.doc.createElement("a");
		objSave.setAttribute('id','lbSave');
		objSave.setAttribute('title',(this.showHints ? this.hintSave : ''));
		objSave.setAttribute(((this.ie && !this.ie8) ? 'className' : 'class'), this.theme);
		objSave.setAttribute('href','#');
		objSave.style.display = 'none';
		objBottomNav.appendChild(objSave);
	var objResize = this.doc.createElement("a");
		objResize.setAttribute('id','lbResize');
		objResize.setAttribute('title',(this.showHints ? this.hintResize : ''));
		objResize.setAttribute(((this.ie && !this.ie8) ? 'className' : 'class'), this.theme);
		objResize.setAttribute('href','#');
		objResize.style.display = 'none';
		objBottomNav.appendChild(objResize);
	var objInfo = this.doc.createElement("a");
		objInfo.setAttribute('id','lbInfo');
		objInfo.setAttribute('title',(this.showHints ? this.hintInfo : ''));
		objInfo.setAttribute(((this.ie && !this.ie8) ? 'className' : 'class'), this.theme);
		objInfo.setAttribute('href','#');
		objInfo.style.display = 'none';
		objBottomNav.appendChild(objInfo);
	var objExif = this.doc.createElement("a");
		objExif.setAttribute('id','lbExif');
		objExif.setAttribute('title',(this.showHints ? this.hintExif : ''));
		objExif.setAttribute(((this.ie && !this.ie8) ? 'className' : 'class'), this.theme);
		objExif.setAttribute('href','#');
		objExif.style.display = 'none';
		objBottomNav.appendChild(objExif);
	var objGeo = this.doc.createElement("a");
		objGeo.setAttribute('id','lbGeo');
		objGeo.setAttribute('title',(this.showHints ? this.hintGeo : ''));
		objGeo.setAttribute(((this.ie && !this.ie8) ? 'className' : 'class'), this.theme);
		objGeo.setAttribute('href','#');
		objGeo.style.display = 'none';
		objBottomNav.appendChild(objGeo);
	var objBack = this.doc.createElement("a");
		objBack.setAttribute('id','lbBack');
		objBack.setAttribute('title',(this.showHints ? this.hintBack : ''));
		objBack.setAttribute(((this.ie && !this.ie8) ? 'className' : 'class'), this.theme);
		objBack.setAttribute('href','#');
		objBack.style.display = 'none';
		objBottomNav.appendChild(objBack);
};

LyteBox.prototype.updateLyteboxItems = function() {
	var anchors = (this.isFrame) ? window.parent.frames[window.name].document.getElementsByTagName('a') : document.getElementsByTagName('a');
	for (var i = 0; i < anchors.length; i++) {
		var anchor = anchors[i];
		var relAttribute = String(anchor.getAttribute('rel'));
		if (anchor.getAttribute('href')) {
			if (relAttribute.toLowerCase().match(this.tagBox)) {
				anchor.onclick = function () { myLytebox.start(this, false, false); return false; }
			} else if (relAttribute.toLowerCase().match(this.tagShow)) {
				anchor.onclick = function () { myLytebox.start(this, true, false); return false; }
			} else if (relAttribute.toLowerCase().match(this.tagFrame)) {
				anchor.onclick = function () { myLytebox.start(this, false, true); return false; }
			}
		}
	}
};

LyteBox.prototype.start = function(imageLink, doSlide, doFrame) {
	// 2007-10 coyaba, store scroll position
	this.yPos = this.getPageScroll();
	// 2007-10 coyaba, hide selects in ie and scrollbars
	this.toggleElements('hide');
	if (this.hideFlash) { this.toggleFlash('hide'); }
	this.isLyteframe = (doFrame ? true : false);
	this.isShowTempFrame = false;
	var pageSize	= this.getPageSize();
	var objOverlay	= this.doc.getElementById('lbOverlay');
	var objBody		= this.doc.getElementsByTagName("body").item(0);
	objOverlay.style.height = pageSize[1] + "px";
	objOverlay.style.display = '';
	this.appear('lbOverlay', (this.doAnimations ? 0 : this.maxOpacity));
	var anchors = (this.isFrame) ? window.parent.frames[window.name].document.getElementsByTagName('a') : document.getElementsByTagName('a');
	if (this.isLyteframe) {
		this.frameArray = [];
		this.frameNum = 0;
		if ((imageLink.getAttribute('rel') == this.tagFrame)) {
			var rev = imageLink.getAttribute('rev');
			this.frameArray.push(new Array(imageLink.getAttribute('href'), imageLink.getAttribute('title'), (rev == null || rev == '' ? this.LyteframeStyle : rev)));
		} else {
			if (imageLink.getAttribute('rel').indexOf(this.tagFrame) != -1) {
				for (var i = 0; i < anchors.length; i++) {
					var anchor = anchors[i];
					if (anchor.getAttribute('href') && (anchor.getAttribute('rel') == imageLink.getAttribute('rel'))) {
						var rev = anchor.getAttribute('rev');
						this.frameArray.push(new Array(anchor.getAttribute('href'), anchor.getAttribute('title'), (rev == null || rev == '' ? this.LyteframeStyle : rev)));
					}
				}
				this.frameArray.removeDuplicates();
				while(this.frameArray[this.frameNum][0] != imageLink.getAttribute('href')) { this.frameNum++; }
			}
		}
	} else {
		this.imageArray = [];
		this.imageNum = 0;
		this.slideArray = [];
		this.slideNum = 0;
		if ((imageLink.getAttribute('rel') == this.tagBox)) {
			this.imageArray.push(new Array(imageLink.getAttribute('href'), imageLink.getAttribute('title'), this.getInfoString(imageLink.getAttribute(this.specialParam)), this.getShowExif(imageLink.getAttribute(this.specialParam)), this.getShowGeo(imageLink.getAttribute(this.specialParam)), this.getOnLoadInfo(imageLink.getAttribute(this.specialParam)), this.getNoTitleInfo(imageLink.getAttribute(this.specialParam))));
		} else {
			if (imageLink.getAttribute('rel').indexOf(this.tagBox) != -1) {
				for (var i = 0; i < anchors.length; i++) {
					var anchor = anchors[i];
					if (anchor.getAttribute('href') && (anchor.getAttribute('rel') == imageLink.getAttribute('rel'))) {
						this.imageArray.push(new Array(anchor.getAttribute('href'), anchor.getAttribute('title'), this.getInfoString(anchor.getAttribute(this.specialParam)), this.getShowExif(anchor.getAttribute(this.specialParam)), this.getShowGeo(anchor.getAttribute(this.specialParam)), this.getOnLoadInfo(anchor.getAttribute(this.specialParam)), this.getNoTitleInfo(anchor.getAttribute(this.specialParam))));
					}
				}
				this.imageArray.removeDuplicates();
				while(this.imageArray[this.imageNum][0] != imageLink.getAttribute('href')) { this.imageNum++; }
			}
			if (imageLink.getAttribute('rel').indexOf(this.tagShow) != -1) {
				for (var i = 0; i < anchors.length; i++) {
					var anchor = anchors[i];
					if (anchor.getAttribute('href') && (anchor.getAttribute('rel') == imageLink.getAttribute('rel'))) {
						this.slideArray.push(new Array(anchor.getAttribute('href'), anchor.getAttribute('title'), this.getInfoString(anchor.getAttribute(this.specialParam)), this.getShowExif(anchor.getAttribute(this.specialParam)), this.getShowGeo(anchor.getAttribute(this.specialParam)), this.getOnLoadInfo(anchor.getAttribute(this.specialParam)), this.getNoTitleInfo(anchor.getAttribute(this.specialParam))));
					}
				}
				this.slideArray.removeDuplicates();
				while(this.slideArray[this.slideNum][0] != imageLink.getAttribute('href')) { this.slideNum++; }
			}
		}
	}
	var object = this.doc.getElementById('lbMain');
		object.style.top = (this.getPageScroll() + (pageSize[3] / 15)) + "px";
		// 2007-11 coyaba, for vertically centered tempFrame display: save last (top) position of Lytebox main DIV
		this.lastMainTop = object.style.top;
		object.style.display = '';
	if (!this.outerBorder) {
		this.doc.getElementById('lbOuterContainer').style.border	= 'none';
		this.doc.getElementById('lbDetailsContainer').style.border	= 'none';
	} else {
		this.doc.getElementById('lbOuterContainer').style.borderBottom = '';
		this.doc.getElementById('lbOuterContainer').setAttribute(((this.ie && !this.ie8) ? 'className' : 'class'), this.theme);
	}
	this.doc.getElementById('lbOverlay').onclick = function() { myLytebox.end(); return false; };
	this.doc.getElementById('lbMain').onclick = function(e) {
		var e = e;
		if (!e) {
			if (window.parent.frames[window.name] && (parent.document.getElementsByTagName('frameset').length <= 0)) {
				e = window.parent.window.event;
			} else {
				e = window.event;
			}
		}
		var id = (e.target ? e.target.id : e.srcElement.id);
		if (id == 'lbMain') { myLytebox.end(); return false; }
	};

	this.doc.getElementById('lbHoverNav').onclick	= function() { return false; };
	this.doc.getElementById('lbC2Cleft').onclick	= function() { myLytebox.end(); return false; };
	this.doc.getElementById('lbC2Cright').onclick	= function() { myLytebox.end(); return false; };
	this.doc.getElementById('lbClose').onclick		= function() { myLytebox.end(); return false; };
	this.doc.getElementById('lbPause').onclick		= function() { myLytebox.togglePlayPause("lbPause", "lbPlay"); return false; };
	this.doc.getElementById('lbPlay').onclick		= function() { myLytebox.togglePlayPause("lbPlay", "lbPause"); return false; };
	this.doc.getElementById('lbSave').onclick		= function() { return false; };
	this.doc.getElementById('lbResize').onclick		= function() { myLytebox.resize(); return false; };
	this.doc.getElementById('lbInfo').onclick		= function() { myLytebox.info(); return false; };
	this.doc.getElementById('lbExif').onclick		= function() { myLytebox.exif(); return false; };
	// 2007-10 coyaba, geo support
	this.doc.getElementById('lbGeo').onclick		= function() { myLytebox.geo(); return false; };
	this.doc.getElementById('lbBack').onclick		= function() { myLytebox.back(); return false; };
	// Below code is removing selection border when clicking on buttons. EXPERIMENTAL. Can't use just blur() because of issue with shortcuts being inactive then.
	this.doc.getElementById('lbHoverNav').onfocus	= function() { (!this.ie ? objBody.focus() : blur()); };
	this.doc.getElementById('lbC2Cleft').onfocus	= function() { (!this.ie ? objBody.focus() : blur()); };
	this.doc.getElementById('lbC2Cright').onfocus	= function() { (!this.ie ? objBody.focus() : blur()); };
	this.doc.getElementById('lbNext').onfocus		= function() { (!this.ie ? objBody.focus() : blur()); };
	this.doc.getElementById('lbPrev').onfocus		= function() { (!this.ie ? objBody.focus() : blur()); };
	this.doc.getElementById('lbClose').onfocus		= function() { (!this.ie ? objBody.focus() : blur()); };
	this.doc.getElementById('lbPause').onfocus		= function() { (!this.ie ? objBody.focus() : blur()); };
	this.doc.getElementById('lbPlay').onfocus		= function() { (!this.ie ? objBody.focus() : blur()); };
	this.doc.getElementById('lbSave').onfocus		= function() { (!this.ie ? objBody.focus() : blur()); };
	this.doc.getElementById('lbResize').onfocus		= function() { (!this.ie ? objBody.focus() : blur()); };
	this.doc.getElementById('lbInfo').onfocus		= function() { (!this.ie ? objBody.focus() : blur()); };
	this.doc.getElementById('lbExif').onfocus		= function() { (!this.ie ? objBody.focus() : blur()); };
	// 2007-10 coyaba, geo support
	this.doc.getElementById('lbGeo').onfocus		= function() { (!this.ie ? objBody.focus() : blur()); };
	this.doc.getElementById('lbBack').onfocus		= function() { (!this.ie ? objBody.focus() : blur()); };

	this.isSlideshow = doSlide;
	// 2007-11 coyaba, configurable slideshow start
	if ( this.isSlideshow ) {
		if ( this.slideAutoStart==0 ) this.isPaused = true;
		else if ( this.slideAutoStart==1 && this.slideNum!=0 ) this.isPaused = true;
		else this.isPaused = false;
	}
	if (this.isSlideshow && this.showPlayPause && this.isPaused) {
		this.doc.getElementById('lbPlay').style.display = '';
		this.doc.getElementById('lbPause').style.display = 'none';
	}
	if (this.isLyteframe) {
		this.changeContent(this.frameNum);
	} else {
		if (this.isSlideshow) {
			this.changeContent(this.slideNum);
		} else {
			this.changeContent(this.imageNum);
		}
	}
};

LyteBox.prototype.changeContent = function(imageNum) {
	this.clearFrame();

	if (this.isSlideshow) {
		for (var i = 0; i < this.slideshowIDCount; i++) { window.clearTimeout(this.slideshowIDArray[i]); }
	}
	this.activeImage = this.activeSlide = this.activeFrame = imageNum;
	if (!this.outerBorder) {
		this.doc.getElementById('lbOuterContainer').style.border	= 'none';
		this.doc.getElementById('lbDetailsContainer').style.border	= 'none';
	} else {
		this.doc.getElementById('lbOuterContainer').style.borderBottom = '';
		this.doc.getElementById('lbOuterContainer').setAttribute((this.ie ? 'className' : 'class') , this.theme);
	};

	this.doc.getElementById('lbLoading').style.display			= '';
	this.doc.getElementById('lbImage').style.display			= 'none';
	this.doc.getElementById('lbIframe').style.display			= 'none';
	this.doc.getElementById('lbPrev').style.display				= 'none';
	this.doc.getElementById('lbNext').style.display				= 'none';
	// 2007-10 coyaba: container for info overlay
	this.doc.getElementById('lbInfoDisplay').style.display		= 'none';
	this.doc.getElementById('lbC2Cleft').style.display			= 'none';
	this.doc.getElementById('lbC2Cright').style.display			= 'none';
	this.doc.getElementById('lbC2Cleft').style.width			= '49.9%';
	this.doc.getElementById('lbC2Cright').style.width			= '49.9%';
	this.doc.getElementById('lbIframeContainer').style.display	= 'none';
	this.doc.getElementById('lbDetailsContainer').style.display	= 'none';
	this.doc.getElementById('lbNumberDisplay').style.display	= 'none';

	if (this.navType == 2 || this.isLyteframe) {
		object = this.doc.getElementById('lbNavDisplay');
		object.innerHTML = '&nbsp;&nbsp;&nbsp;<span id="lbPrev2_Off" style="display: none;" class="' + this.theme + '">' + this.textNavPrev + '</span>' +
						   '<a href="#" id="lbPrev2" class="' + this.theme + '" style="display: none;">' + this.textNavPrev + '</a> ' +
						   '<b id="lbSpacer" class="' + this.theme + '">' + this.textNavDelim + '</b> ' +
						   '<span id="lbNext2_Off" style="display: none;" class="' + this.theme + '">' + this.textNavNext + '</span>' +
						   '<a href="#" id="lbNext2" class="' + this.theme + '" style="display: none;">' + this.textNavNext + '</a>';
		object.style.display = 'none';
	};

	if (this.isLyteframe || this.isShowTempFrame) {
		var iframe = myLytebox.doc.getElementById('lbIframe');
		var styles = (this.isShowTempFrame ? this.TempFrameStyle : this.frameArray[this.activeFrame][2]);
		var aStyles = styles.split(';');
		for (var i = 0; i < aStyles.length; i++) {
			if (aStyles[i].indexOf('width:') >= 0) {
				var w = aStyles[i].replace('width:', '');
				iframe.width = w.trim();
			} else if (aStyles[i].indexOf('height:') >= 0) {
				var h = aStyles[i].replace('height:', '');
				iframe.height = h.trim();
			} else if (aStyles[i].indexOf('scrolling:') >= 0) {
				var s = aStyles[i].replace('scrolling:', '');
				iframe.scrolling = s.trim();
			} else if (aStyles[i].indexOf('border:') >= 0) {
				// Not implemented yet, as there are cross-platform issues with setting the border (from a GUI standpoint)
				// var b = aStyles[i].replace('border:', '');
				// iframe.style.border = b.trim();
			}
		}
		iframe.src = (this.isShowTempFrame ? this.TempFrame[0] : this.frameArray[this.activeFrame][0]);
		this.resizeContainer(parseInt(iframe.width), parseInt(iframe.height));
		// 2007-11 coyaba, for vertically centered tempFrame display: save last (top) position of Lytebox main DIV
		this.lastMainTop = this.doc.getElementById('lbMain').style.top;
		// 2007-11 coyaba, center tempFrame vertically on screen
		this.doc.getElementById('lbMain').style.top = ((this.getPageSize()[3] - this.doc.getElementById('lbOuterContainer').offsetHeight - this.doc.getElementById('lbDetailsContainer').offsetHeight)/2) + "px";
	} else {
		// 2007-11 coyaba, for vertically centered tempFrame display: reset main top position to saved value
		this.doc.getElementById('lbMain').style.top = this.lastMainTop;
		imgPreloader = new Image();
		imgPreloader.onload = function() {
			var imageWidth = imgPreloader.width;
			var imageHeight = imgPreloader.height;
			if (myLytebox.autoResize) {
				var pagesize = myLytebox.getPageSize();
				var x = pagesize[2] - 150;
				var y = pagesize[3] - 150;
				if (imageWidth > x) {
					imageHeight = Math.round(imageHeight * (x / imageWidth));
					imageWidth = x;
					if (imageHeight > y) {
						imageWidth = Math.round(imageWidth * (y / imageHeight));
						imageHeight = y;
					}
				} else if (imageHeight > y) {
					imageWidth = Math.round(imageWidth * (y / imageHeight));
					imageHeight = y;
					if (imageWidth > x) {
						imageHeight = Math.round(imageHeight * (x / imageWidth));
						imageWidth = x;
					}
				}
			}
			var lbImage = myLytebox.doc.getElementById('lbImage');
			lbImage.src = (myLytebox.isSlideshow ? myLytebox.slideArray[myLytebox.activeSlide][0] : myLytebox.imageArray[myLytebox.activeImage][0]);
			lbImage.width = imageWidth;
			lbImage.height = imageHeight;
			myLytebox.resizeContainer(imageWidth, imageHeight);
			imgPreloader.onload = function() {};
		};
		imgPreloader.src = (this.isSlideshow ? this.slideArray[this.activeSlide][0] : this.imageArray[this.activeImage][0]);
	}
};

LyteBox.prototype.resizeContainer = function(imgWidth, imgHeight) {
	this.wCur = this.doc.getElementById('lbOuterContainer').offsetWidth;
	this.hCur = this.doc.getElementById('lbOuterContainer').offsetHeight;
	this.xScale = ((imgWidth + (this.borderSize * 2)) / this.wCur) * 100;
	this.yScale = ((imgHeight + (this.borderSize * 2)) / this.hCur) * 100;
	var wDiff = (this.wCur - this.borderSize * 2) - imgWidth;
	var hDiff = (this.hCur - this.borderSize * 2) - imgHeight;
	if (!(hDiff == 0)) {
		this.hDone = false;
		this.resizeH('lbOuterContainer', this.hCur, imgHeight + this.borderSize*2, this.getPixelRate(this.hCur, imgHeight));
	} else {
		this.hDone = true;
	}
	if (!(wDiff == 0)) {
		this.wDone = false;
		this.resizeW('lbOuterContainer', this.wCur, imgWidth + this.borderSize*2, this.getPixelRate(this.wCur, imgWidth));
	} else {
		this.wDone = true;
	}
	if ((hDiff == 0) && (wDiff == 0)) {
		if (this.ie){ this.pause(250); } else { this.pause(100); }
	}
	this.doc.getElementById('lbPrev').style.height = imgHeight + "px";
	this.doc.getElementById('lbNext').style.height = imgHeight + "px";
	this.doc.getElementById('lbDetailsContainer').style.width = (imgWidth + (this.borderSize * 2) + (this.ie && this.doc.compatMode == "BackCompat" && this.outerBorder ? 2 : 0)) + "px";
	this.showContent();
};

LyteBox.prototype.showContent = function() {
	if (this.wDone && this.hDone) {
		for (var i = 0; i < this.showContentTimerCount; i++) { window.clearTimeout(this.showContentTimerArray[i]); }
		if (this.outerBorder) {
			this.doc.getElementById('lbOuterContainer').style.borderBottom = 'none';
		}
		this.doc.getElementById('lbLoading').style.display = 'none';
		if (this.isShowTempFrame) {
			this.doc.getElementById('lbIframe').style.display = '';
			this.appear('lbIframe', (this.doAnimations ? 0 : 100));
		} else if (this.isLyteframe) {
			this.doc.getElementById('lbIframe').style.display = '';
			this.appear('lbIframe', (this.doAnimations ? 0 : 100));
		} else {
			this.doc.getElementById('lbImage').style.display = '';
			this.appear('lbImage', (this.doAnimations ? 0 : 100));
			this.preloadNeighborImages();
		}
		if (this.isShowTempFrame){
			this.doc.getElementById('lbHoverNav').style.display		= 'none';
			this.doc.getElementById('lbClose').style.display		= (this.showCloseInFrame ? '' : 'none');
			this.doc.getElementById('lbDetails').style.display		= (this.showDetails ? '' : 'none');
			this.doc.getElementById('lbPause').style.display		= 'none';
			this.doc.getElementById('lbPlay').style.display			= 'none';
			this.doc.getElementById('lbSave').style.display			= 'none';
			this.doc.getElementById('lbResize').style.display		= 'none';
			this.doc.getElementById('lbNavDisplay').style.display	= 'none';
			this.doc.getElementById('lbInfo').style.display			= 'none';
			this.doc.getElementById('lbExif').style.display			= 'none';
			// 2007-10 coyaba, geo support
			this.doc.getElementById('lbGeo').style.display			= 'none';
			this.doc.getElementById('lbBack').style.display			= (this.showBack ? '' : 'none');

		} else if (this.isSlideshow) {
			if(this.activeSlide == (this.slideArray.length - 1)) {
				if (this.autoEnd) {
					this.slideshowIDArray[this.slideshowIDCount++] = setTimeout("myLytebox.end('slideshow')", this.slideInterval);
				}
			} else {
				if (!this.isPaused) {
					this.slideshowIDArray[this.slideshowIDCount++] = setTimeout("myLytebox.changeContent("+(this.activeSlide+1)+")", this.slideInterval);
				}
			}
			this.HasInfo = (this.slideArray[this.activeSlide][2]!='' ? true : false);
			this.HasExif = (this.slideArray[this.activeSlide][3] ? true : false);
			// 2007-10 coyaba, geo support
			this.HasGeo = (this.slideArray[this.activeSlide][4] ? true : false);

			this.doc.getElementById('lbHoverNav').style.display		= (this.showNavigation && this.navType == 1 ? '' : 'none');
			this.doc.getElementById('lbClose').style.display		= (this.showClose ? '' : 'none');
			this.doc.getElementById('lbDetails').style.display		= (this.showDetails ? '' : 'none');
			this.doc.getElementById('lbPause').style.display		= (this.showPlayPause && !this.isPaused ? '' : 'none');
			this.doc.getElementById('lbPlay').style.display			= (this.showPlayPause && !this.isPaused ? 'none' : '');
			this.doc.getElementById('lbSave').style.display			= (this.showSave ? '' : 'none');
			this.doc.getElementById('lbResize').style.display		= (this.showResize && this.canResize ? '' : 'none');
			this.doc.getElementById('lbNavDisplay').style.display	= (this.showNavigation && this.navType == 2 ? '' : 'none');
			this.doc.getElementById('lbInfo').style.display			= (this.HasInfo && this.showInfo ? '' : 'none');
			this.doc.getElementById('lbExif').style.display			= (this.HasExif && this.showExif ? '' : 'none');
			// 2007-10 coyaba, geo support
			this.doc.getElementById('lbGeo').style.display			= (this.HasGeo && this.showGeo ? '' : 'none');
			this.doc.getElementById('lbBack').style.display			= 'none';

			if (this.showSave) {
				this.doc.getElementById('lbSave').href		= this.slideArray[this.activeSlide][0];
			}
			if (this.easySave) {
				this.doc.getElementById('lbHoverNav').href	= this.slideArray[this.activeSlide][0];
				this.doc.getElementById('lbPrev').href		= this.slideArray[this.activeSlide][0];
				this.doc.getElementById('lbNext').href		= this.slideArray[this.activeSlide][0];
				this.doc.getElementById('lbC2Cleft').href	= this.slideArray[this.activeSlide][0];
				this.doc.getElementById('lbC2Cright').href	= this.slideArray[this.activeSlide][0];
			}
		} else {
			this.doc.getElementById('lbHoverNav').style.display = (this.navType == 1 && !this.isLyteframe ? '' : 'none');
			if ((this.navType == 2 && !this.isLyteframe && this.imageArray.length > 1) || (this.frameArray.length > 1 && this.isLyteframe)) {
				this.doc.getElementById('lbNavDisplay').style.display = '';
			} else {
				this.doc.getElementById('lbNavDisplay').style.display = 'none';
			}
			this.HasInfo = (this.isLyteframe ? false : (this.imageArray[this.activeImage][2]!='' ? true : false));
			this.HasExif = (this.isLyteframe ? false : (this.imageArray[this.activeImage][3] ? true : false));
			// 2007-10 coyaba, geo support
			this.HasGeo = (this.isLyteframe ? false : (this.imageArray[this.activeImage][4] ? true : false));

			this.doc.getElementById('lbClose').style.display	= (!this.isLyteframe ? (this.showClose ? '' : 'none') : (this.showCloseInFrame ? '' : 'none'));
			this.doc.getElementById('lbDetails').style.display	= (this.showDetails ? '' : 'none');
			this.doc.getElementById('lbPause').style.display	= 'none';
			this.doc.getElementById('lbPlay').style.display		= 'none';
			this.doc.getElementById('lbSave').style.display		= (!this.isLyteframe && this.showSave ? '' : 'none');
			this.doc.getElementById('lbResize').style.display	= (!this.isLyteframe && this.showResize && this.canResize ? '' : 'none');
			this.doc.getElementById('lbInfo').style.display		= (this.HasInfo && this.showInfo ? '' : 'none');
			this.doc.getElementById('lbExif').style.display		= (this.HasExif && this.showExif ? '' : 'none');
			// 2007-10 coyaba, geo support
			this.doc.getElementById('lbGeo').style.display		= (this.HasGeo && this.showGeo ? '' : 'none');
			this.doc.getElementById('lbBack').style.display		= 'none';

			if (!this.isLyteframe && this.showSave) {
				this.doc.getElementById('lbSave').href		= this.imageArray[this.activeImage][0];
			}
			if (!this.isLyteframe && this.easySave) {
				this.doc.getElementById('lbHoverNav').href	= this.imageArray[this.activeImage][0];
				this.doc.getElementById('lbPrev').href		= this.imageArray[this.activeImage][0];
				this.doc.getElementById('lbNext').href		= this.imageArray[this.activeImage][0];
				this.doc.getElementById('lbC2Cleft').href	= this.imageArray[this.activeImage][0];
				this.doc.getElementById('lbC2Cright').href	= this.imageArray[this.activeImage][0];
			}
		}
		this.doc.getElementById('lbImageContainer').style.display	= (this.isLyteframe || this.isShowTempFrame ? 'none' : '');
		this.doc.getElementById('lbIframeContainer').style.display	= (this.isLyteframe || this.isShowTempFrame ? '' : 'none');
		try {
			this.doc.getElementById('lbIframe').src = this.frameArray[this.activeFrame][0];
		} catch(e) { }
	} else {
		this.showContentTimerArray[this.showContentTimerCount++] = setTimeout("myLytebox.showContent()", 200);
	}
};

LyteBox.prototype.updateDetails = function() {
	var object;
	var sTitle = (this.isShowTempFrame ? this.TempFrame[1] : (this.isSlideshow ? this.slideArray[this.activeSlide][1] : (this.isLyteframe ? this.frameArray[this.activeFrame][1] : this.imageArray[this.activeImage][1])));
	// 2007-10 coyaba, info overlay: info text present?
	if ( !this.showInfo && sTitle!=null && !this.isShowTempFrame && !this.isLyteframe && ((this.isSlideshow && this.slideArray[this.activeSlide][2]!='') || (!this.isSlideshow && this.imageArray[this.activeImage][2]!='')) ) {
		if ( (this.isSlideshow && this.slideArray[this.activeSlide][5]) || (!this.isSlideshow && this.imageArray[this.activeImage][5]) ) {
			// 2007-10 coyaba, if onLoadInfo is set show info overlay at once
			myLytebox.inlineInfo(1);
		} else {
			// 2007-10 coyaba, add info marker to caption if info text is present
			sTitle = sTitle + '<span id="lbInfoDisplayTrigger">(Info...)</span>';
		}
	}
	object = this.doc.getElementById('lbCaption');
	object.innerHTML = (sTitle == null ? '' : sTitle);
	object.style.display = '';

	// 2007-10 coyaba, add event handler for info marker if it has been defined
	object = this.doc.getElementById('lbInfoDisplayTrigger');
	if ( object!=undefined ) {
		this.doc.getElementById('lbInfoDisplayTrigger').onmouseover		= function() { myLytebox.inlineInfo(1); return false; };
		this.doc.getElementById('lbInfoDisplayTrigger').onmouseout		= function() { myLytebox.inlineInfo(0); return false; };
	}

	this.updateNav();
	this.doc.getElementById('lbDetailsContainer').style.display = '';
	object = this.doc.getElementById('lbNumberDisplay');
	if (this.isShowTempFrame){
		this.doc.getElementById('lbNavDisplay').style.display = 'none';
	} else if (this.isSlideshow && this.slideArray.length > 1) {
		object.style.display = '';
		object.innerHTML = this.compileSpecialString(this.textImageNum, eval(this.activeSlide + 1), this.slideArray.length);
		this.doc.getElementById('lbNavDisplay').style.display = (this.navType == 2 && this.showNavigation ? '' : 'none');
	} else if (this.imageArray.length > 1 && !this.isLyteframe) {
		object.style.display = '';
		object.innerHTML = this.compileSpecialString(this.textImageNum, eval(this.activeImage + 1), this.imageArray.length);
		this.doc.getElementById('lbNavDisplay').style.display = (this.navType == 2 ? '' : 'none');
	} else if (this.frameArray.length > 1 && this.isLyteframe) {
		object.style.display = '';
		object.innerHTML = this.compileSpecialString(this.textPageNum, eval(this.activeFrame + 1), this.frameArray.length);
		this.doc.getElementById('lbNavDisplay').style.display = '';
	} else {
		this.doc.getElementById('lbNavDisplay').style.display = 'none';
	}
	this.appear('lbDetailsContainer', (this.doDetailAnimations ? 0 : 100));
};

LyteBox.prototype.updateNav = function() {
	if (this.isSlideshow) {
		if (this.activeSlide != 0) { // Displays PREV if it is NOT a First slide
			var object = (this.navType == 2 ? this.doc.getElementById('lbPrev2') : this.doc.getElementById('lbPrev'));
				object.style.display = '';
				object.onclick = function() {
					if (myLytebox.pauseOnPrevClick) { myLytebox.togglePlayPause("lbPause", "lbPlay"); }
					myLytebox.changeContent(myLytebox.activeSlide - 1); return false;
				};
		} else { // Don't show PREV in navType = 1 if it IS a First slide
			if (this.clickToClose){
				if (this.slideArray.length == 1){
					this.doc.getElementById('lbC2Cleft').style.width	= (this.C2CrightSided ? '' : '100%');
					this.doc.getElementById('lbC2Cleft').style.display	= (this.C2CrightSided ? 'none' : '');
				} else {
				this.doc.getElementById('lbC2Cleft').style.display	= '';
				}
			}

			if (this.navType == 2) { this.doc.getElementById('lbPrev2_Off').style.display = ''; }
		}
		if (this.activeSlide != (this.slideArray.length - 1)) { // Displays NEXT if it is NOT a Last slide
			var object = (this.navType == 2 ? this.doc.getElementById('lbNext2') : this.doc.getElementById('lbNext'));
				object.style.display = '';
				object.onclick = function() {
					if (myLytebox.pauseOnNextClick) { myLytebox.togglePlayPause("lbPause", "lbPlay"); }
					myLytebox.changeContent(myLytebox.activeSlide + 1); return false;
				};
		} else { // Don't show NEXT in navType = 1 if it IS a Last slide
			if (this.clickToClose){
				if (this.slideArray.length == 1){
					this.doc.getElementById('lbC2Cright').style.width	= (this.C2CrightSided ? '100%' : '');
					this.doc.getElementById('lbC2Cright').style.display	= (this.C2CrightSided ? '' : 'none');
				} else {
					this.doc.getElementById('lbC2Cright').style.display	= '';
				}
			}

			if (this.navType == 2) { this.doc.getElementById('lbNext2_Off').style.display = ''; }
		}
	} else if (this.isLyteframe) {
		if(this.activeFrame != 0) {
			var object = this.doc.getElementById('lbPrev2');
				object.style.display = '';
				object.onclick = function() {
					myLytebox.changeContent(myLytebox.activeFrame - 1); return false;
				};
		} else {
			this.doc.getElementById('lbPrev2_Off').style.display = '';
		}
		if(this.activeFrame != (this.frameArray.length - 1)) {
			var object = this.doc.getElementById('lbNext2');
				object.style.display = '';
				object.onclick = function() {
					myLytebox.changeContent(myLytebox.activeFrame + 1); return false;
				};
		} else {
			this.doc.getElementById('lbNext2_Off').style.display = '';
		}
	} else {
		if(this.activeImage != 0) {
			var object = (this.navType == 2 ? this.doc.getElementById('lbPrev2') : this.doc.getElementById('lbPrev'));
				object.style.display = '';
				object.onclick = function() {
					myLytebox.changeContent(myLytebox.activeImage - 1); return false;
				};
		} else {
			if (this.clickToClose){
				if (this.imageArray.length == 1){
					this.doc.getElementById('lbC2Cleft').style.width	= (this.C2CrightSided ? '' : '100%');
					this.doc.getElementById('lbC2Cleft').style.display	= (this.C2CrightSided ? 'none' : '');
				} else {
				this.doc.getElementById('lbC2Cleft').style.display	= '';
				}
			}

			if (this.navType == 2) { this.doc.getElementById('lbPrev2_Off').style.display = ''; }
		}
		if(this.activeImage != (this.imageArray.length - 1)) {
			var object = (this.navType == 2 ? this.doc.getElementById('lbNext2') : this.doc.getElementById('lbNext'));
				object.style.display = '';
				object.onclick = function() {
					myLytebox.changeContent(myLytebox.activeImage + 1); return false;
				};
		} else {
			if (this.clickToClose){
				if (this.imageArray.length == 1){
					this.doc.getElementById('lbC2Cright').style.width	= (this.C2CrightSided ? '100%' : '');
					this.doc.getElementById('lbC2Cright').style.display	= (this.C2CrightSided ? '' : 'none');
				} else {
					this.doc.getElementById('lbC2Cright').style.display	= '';
				}
			}

			if (this.navType == 2) { this.doc.getElementById('lbNext2_Off').style.display = ''; }
		}
	}
	this.enableKeyboardNav();
};

LyteBox.prototype.enableKeyboardNav = function() {
	document.onkeydown = this.keyboardAction;
};

LyteBox.prototype.disableKeyboardNav = function() {
	document.onkeydown = '';
};

LyteBox.prototype.keyboardAction = function(e) {
	var keycode = key = escape = null;
	keycode	= (e == null) ? event.keyCode : e.which;
	key		= String.fromCharCode(keycode).toLowerCase();
	escape = (e == null) ? 27 : e.DOM_VK_ESCAPE;
	if ((key == 'x') || (key == myLytebox.hotkeyClose) || (keycode == escape)) {
		myLytebox.end();
	} else if ((key == myLytebox.hotkeyPrevious) || (keycode == 37)) {
		if (myLytebox.isShowTempFrame) {
				myLytebox.back();
		} else if (myLytebox.isSlideshow) {
			if(myLytebox.activeSlide != 0) {
				myLytebox.disableKeyboardNav();
				myLytebox.changeContent(myLytebox.activeSlide - 1);
			}
		} else if (myLytebox.isLyteframe) {
			if(myLytebox.activeFrame != 0) {
				myLytebox.disableKeyboardNav();
				myLytebox.changeContent(myLytebox.activeFrame - 1);
			}
		} else {
			if(myLytebox.activeImage != 0) {
				myLytebox.disableKeyboardNav();
				myLytebox.changeContent(myLytebox.activeImage - 1);
			}
		}
	} else if ((key == myLytebox.hotkeyNext) || (keycode == 39)) {
		if (myLytebox.isShowTempFrame) {
			// ignore
		} else if (myLytebox.isSlideshow) {
			if(myLytebox.activeSlide != (myLytebox.slideArray.length - 1)) {
				myLytebox.disableKeyboardNav();
				myLytebox.changeContent(myLytebox.activeSlide + 1);
			}
		} else if (myLytebox.isLyteframe) {
			if(myLytebox.activeFrame != (myLytebox.frameArray.length - 1)) {
				myLytebox.disableKeyboardNav();
				myLytebox.changeContent(myLytebox.activeFrame + 1);
			}
		} else {
			if(myLytebox.activeImage != (myLytebox.imageArray.length - 1)) {
				myLytebox.disableKeyboardNav();
				myLytebox.changeContent(myLytebox.activeImage + 1);
			}
		}
	} else if (key == myLytebox.hotkeyResize) {
		if (!myLytebox.isShowTempFrame && !myLytebox.isLyteframe && myLytebox.canResize && myLytebox.showResize) {
			myLytebox.disableKeyboardNav();
			myLytebox.resize();
		}
	} else if (key == myLytebox.hotkeyInfo) {
		if (!myLytebox.isShowTempFrame && !myLytebox.isLyteframe && myLytebox.HasInfo && myLytebox.showInfo) {
			myLytebox.disableKeyboardNav();
			myLytebox.info();
		}
	} else if (key == myLytebox.hotkeyExif) {
		if (!myLytebox.isShowTempFrame && !myLytebox.isLyteframe && myLytebox.HasExif && myLytebox.showExif) {
			myLytebox.disableKeyboardNav();
			myLytebox.exif();
		}
	} else if (key == myLytebox.hotkeyGeo) {
		if (!myLytebox.isShowTempFrame && !myLytebox.isLyteframe && myLytebox.HasGeo && myLytebox.showGeo) {
			myLytebox.disableKeyboardNav();
			myLytebox.geo();
		}
	}
};

LyteBox.prototype.preloadNeighborImages = function() {
	if (this.isSlideshow) {
		if ((this.slideArray.length - 1) > this.activeSlide) {
			preloadNextImage = new Image();
			preloadNextImage.src = this.slideArray[this.activeSlide + 1][0];
		}
		if(this.activeSlide > 0) {
			preloadPrevImage = new Image();
			preloadPrevImage.src = this.slideArray[this.activeSlide - 1][0];
		}
	} else {
		if ((this.imageArray.length - 1) > this.activeImage) {
			preloadNextImage = new Image();
			preloadNextImage.src = this.imageArray[this.activeImage + 1][0];
		}
		if(this.activeImage > 0) {
			preloadPrevImage = new Image();
			preloadPrevImage.src = this.imageArray[this.activeImage - 1][0];
		}
	}
};

LyteBox.prototype.togglePlayPause = function(hideID, showID) {
	if (this.isSlideshow && hideID == "lbPause") {
		for (var i = 0; i < this.slideshowIDCount; i++) { window.clearTimeout(this.slideshowIDArray[i]); }
	}
	this.doc.getElementById(hideID).style.display = 'none';
	this.doc.getElementById(showID).style.display = '';
	if (hideID == "lbPlay") {
		this.isPaused = false;
		if (this.activeSlide == (this.slideArray.length - 1)) {
			this.end();
		} else {
			this.changeContent(this.activeSlide + 1);
		}
	} else {
		this.isPaused = true;
	}
};

LyteBox.prototype.resize = function() {
	if (this.canResize) {
		if (this.autoResize) {
			this.autoResize	= false;
		} else {
			this.autoResize	= true;
		}
		if (this.isSlideshow) {
			this.changeContent(myLytebox.activeSlide);
		} else {
			this.changeContent(myLytebox.activeImage);
		}
	}
	this.enableKeyboardNav();
};

LyteBox.prototype.info = function() {
	if (this.isSlideshow) {
		var back	= this.activeSlide;
		var title	= this.slideArray[this.activeSlide][1];
		var info	= this.slideArray[this.activeSlide][2];
		// 2007-10 coyaba, additional file param
		var file	= this.slideArray[this.activeSlide][0];
	} else {
		var back	= this.activeImage;
		var title	= this.imageArray[this.activeImage][1];
		var info	= this.imageArray[this.activeImage][2];
		// 2007-10 coyaba, additional file param
		var file	= this.imageArray[this.activeImage][0];
	}
	this.isShowTempFrame = true;
	// 2007-10 coyaba, additional file param
	this.TempFrame[0] = this.compileSpecialString(this.linkInfo, info, file);
	this.TempFrame[1] = title;
	this.TempFrame[2] = back;
	this.changeContent();
};

LyteBox.prototype.exif = function() {
	if (this.isSlideshow) {
		var back	= this.activeSlide;
		var title	= this.slideArray[this.activeSlide][1];
		var file	= this.slideArray[this.activeSlide][0];
	} else {
		var back	= this.activeImage;
		var title	= this.imageArray[this.activeImage][1];
		var file	= this.imageArray[this.activeImage][0];
	}
	this.isShowTempFrame = true;
	this.TempFrame[0] = this.linkExif + file;
	this.TempFrame[1] = title;
	this.TempFrame[2] = back;
	this.changeContent();
};

// 2007-10 coyaba, geo support
LyteBox.prototype.geo = function() {
	if (this.isSlideshow) {
		var back	= this.activeSlide;
		var title	= this.slideArray[this.activeSlide][1];
		var file	= this.slideArray[this.activeSlide][0];
	} else {
		var back	= this.activeImage;
		var title	= this.imageArray[this.activeImage][1];
		var file	= this.imageArray[this.activeImage][0];
	}
	this.isShowTempFrame = true;
	this.TempFrame[0] = this.linkGeo + file;
	this.TempFrame[1] = title;
	this.TempFrame[2] = back;
	this.changeContent();
};

LyteBox.prototype.back = function() {
	this.isShowTempFrame = false;
	this.changeContent(this.TempFrame[2]);
};

LyteBox.prototype.clearFrame = function() {
	var iframe = myLytebox.doc.getElementById('lbIframe');
	if (iframe.src != null && iframe.src != '' && iframe.src != 'about:blank') {
		iframe.src = 'about:blank';
	}
};

LyteBox.prototype.end = function(caller) {
	var closeClick = (caller == 'slideshow' ? false : true);
	this.disableKeyboardNav();
	this.doc.getElementById('lbMain').style.display = 'none';
	this.clearFrame();
	if (this.isSlideshow && this.isPaused && !closeClick) { return; }
	this.fade('lbOverlay', (this.doAnimations ? this.maxOpacity : 0));
	// 2007-10 coyaba, show selects in ie and scrollbars
	this.toggleElements('visible');
	// 2007-10 coyaba, scroll back to last view position
	this.setScroll(0, this.yPos);
	if (this.hideFlash) { this.toggleFlash('visible'); }
	if (this.isSlideshow) {
		for (var i = 0; i < this.slideshowIDCount; i++) { window.clearTimeout(this.slideshowIDArray[i]); }
	}
};

LyteBox.prototype.checkFrame = function() {
	if (window.parent.frames[window.name] && (parent.document.getElementsByTagName('frameset').length <= 0)) {
		this.isFrame = true;
		this.lytebox = "window.parent." + window.name + ".myLytebox";
		this.doc = parent.document;
	} else {
		this.isFrame = false;
		this.lytebox = "myLytebox";
		this.doc = document;
	}
};

LyteBox.prototype.getPixelRate = function(cur, img) {
	var diff = (img > cur) ? img - cur : cur - img;
	if (diff >= 0 && diff <= 100) { return 10; }
	if (diff > 100 && diff <= 200) { return 15; }
	if (diff > 200 && diff <= 300) { return 20; }
	if (diff > 300 && diff <= 400) { return 25; }
	if (diff > 400 && diff <= 500) { return 30; }
	if (diff > 500 && diff <= 600) { return 35; }
	if (diff > 600 && diff <= 700) { return 40; }
	if (diff > 700) { return 45; }
};

LyteBox.prototype.appear = function(id, opacity) {
	var object = this.doc.getElementById(id).style;
	object.opacity = (opacity / 100);
	object.MozOpacity = (opacity / 100);
	object.KhtmlOpacity = (opacity / 100);
	object.filter = "alpha(opacity=" + (opacity + 10) + ")";
	if (opacity == 100 && (id == 'lbImage' || id == 'lbIframe')) {
		try { object.removeAttribute("filter"); } catch(e) {}	/* Fix added for IE Alpha Opacity Filter bug. */
		this.updateDetails();
	} else if (opacity >= this.maxOpacity && id == 'lbOverlay') {
		for (var i = 0; i < this.overlayTimerCount; i++) { window.clearTimeout(this.overlayTimerArray[i]); }
		return;
	} else if (opacity >= 100 && id == 'lbDetailsContainer') {
		try { object.removeAttribute("filter"); } catch(e) {}	/* Fix added for IE Alpha Opacity Filter bug. */
		for (var i = 0; i < this.imageTimerCount; i++) { window.clearTimeout(this.imageTimerArray[i]); }
		this.doc.getElementById('lbOverlay').style.height = this.getPageSize()[1] + "px";
	} else {
		if (id == 'lbOverlay') {
			this.overlayTimerArray[this.overlayTimerCount++] = setTimeout("myLytebox.appear('" + id + "', " + (opacity+20) + ")", 1);
		} else if ( id == 'lbInfoDisplay' ) {
			object.filter = "alpha(opacity=" + (opacity - 10) + ")";
			if ( opacity>0 ) {
				object.display = '';
			}
			this.infoTimerArray[this.infoTimerCount++] = setTimeout("myLytebox.appear('" + id + "', " + (opacity+10) + ")", 1);
			if ( opacity >= 80 ) {
				for (var i = 0; i < this.infoTimerCount; i++) {
					window.clearTimeout(this.infoTimerArray[i]);
				}
				return;
			}
		} else {
			this.imageTimerArray[this.imageTimerCount++] = setTimeout("myLytebox.appear('" + id + "', " + (opacity+10) + ")", 1);
		}
	}
};

LyteBox.prototype.fade = function(id, opacity) {
	var object = this.doc.getElementById(id).style;
	object.opacity = (opacity / 100);
	object.MozOpacity = (opacity / 100);
	object.KhtmlOpacity = (opacity / 100);
	object.filter = "alpha(opacity=" + opacity + ")";
	if (opacity <= 0) {
		try {
			object.display = 'none';
		} catch(err) { }
	} else if (id == 'lbOverlay') {
		this.overlayTimerArray[this.overlayTimerCount++] = setTimeout("myLytebox.fade('" + id + "', " + (opacity-20) + ")", 1);
	} else {
		this.timerIDArray[this.timerIDCount++] = setTimeout("myLytebox.fade('" + id + "', " + (opacity-10) + ")", 1);
	}
};

LyteBox.prototype.resizeW = function(id, curW, maxW, pixelrate, speed) {
	if (!this.hDone) {
		this.resizeWTimerArray[this.resizeWTimerCount++] = setTimeout("myLytebox.resizeW('" + id + "', " + curW + ", " + maxW + ", " + pixelrate + ")", 100);
		return;
	}
	var object = this.doc.getElementById(id);
	var timer = speed ? speed : (this.resizeDuration/2);
	var newW = (this.doAnimations ? curW : maxW);
	object.style.width = (newW) + "px";
	if (newW < maxW) {
		newW += (newW + pixelrate >= maxW) ? (maxW - newW) : pixelrate;
	} else if (newW > maxW) {
		newW -= (newW - pixelrate <= maxW) ? (newW - maxW) : pixelrate;
	}
	this.resizeWTimerArray[this.resizeWTimerCount++] = setTimeout("myLytebox.resizeW('" + id + "', " + newW + ", " + maxW + ", " + pixelrate + ", " + (timer+0.02) + ")", timer+0.02);
	if (parseInt(object.style.width) == maxW) {
		this.wDone = true;
		for (var i = 0; i < this.resizeWTimerCount; i++) { window.clearTimeout(this.resizeWTimerArray[i]); }
	}
};

LyteBox.prototype.resizeH = function(id, curH, maxH, pixelrate, speed) {
	var timer = speed ? speed : (this.resizeDuration/2);
	var object = this.doc.getElementById(id);
	var newH = (this.doAnimations ? curH : maxH);
	object.style.height = (newH) + "px";
	if (newH < maxH) {
		newH += (newH + pixelrate >= maxH) ? (maxH - newH) : pixelrate;
	} else if (newH > maxH) {
		newH -= (newH - pixelrate <= maxH) ? (newH - maxH) : pixelrate;
	}
	this.resizeHTimerArray[this.resizeHTimerCount++] = setTimeout("myLytebox.resizeH('" + id + "', " + newH + ", " + maxH + ", " + pixelrate + ", " + (timer+.02) + ")", timer+.02);
	if (parseInt(object.style.height) == maxH) {
		this.hDone = true;
		for (var i = 0; i < this.resizeHTimerCount; i++) { window.clearTimeout(this.resizeHTimerArray[i]); }
	}
};

LyteBox.prototype.getPageScroll = function() {
	if (self.pageYOffset) {
		return this.isFrame ? parent.pageYOffset : self.pageYOffset;
	} else if (this.doc.documentElement && this.doc.documentElement.scrollTop){
		return this.doc.documentElement.scrollTop;
	} else if (document.body) {
		return this.doc.body.scrollTop;
	}
};

LyteBox.prototype.getPageSize = function() {
	var xScroll, yScroll, windowWidth, windowHeight;
	if (window.innerHeight && window.scrollMaxY) {
		xScroll = this.doc.scrollWidth;
		yScroll = (this.isFrame ? parent.innerHeight : self.innerHeight) + (this.isFrame ? parent.scrollMaxY : self.scrollMaxY);
	} else if (this.doc.body.scrollHeight > this.doc.body.offsetHeight){
		xScroll = this.doc.body.scrollWidth;
		yScroll = this.doc.body.scrollHeight;
	} else {
		xScroll = this.doc.getElementsByTagName("html").item(0).offsetWidth;
		yScroll = this.doc.getElementsByTagName("html").item(0).offsetHeight;
		xScroll = (xScroll < this.doc.body.offsetWidth) ? this.doc.body.offsetWidth : xScroll;
		yScroll = (yScroll < this.doc.body.offsetHeight) ? this.doc.body.offsetHeight : yScroll;
	}
	if (self.innerHeight) {
		windowWidth = (this.isFrame) ? parent.innerWidth : self.innerWidth;
		windowHeight = (this.isFrame) ? parent.innerHeight : self.innerHeight;
	} else if (document.documentElement && document.documentElement.clientHeight) {
		windowWidth = this.doc.documentElement.clientWidth;
		windowHeight = this.doc.documentElement.clientHeight;
	} else if (document.body) {
		windowWidth = this.doc.getElementsByTagName("html").item(0).clientWidth;
		windowHeight = this.doc.getElementsByTagName("html").item(0).clientHeight;
		windowWidth = (windowWidth == 0) ? this.doc.body.clientWidth : windowWidth;
		windowHeight = (windowHeight == 0) ? this.doc.body.clientHeight : windowHeight;
	}
	var pageHeight = (yScroll < windowHeight) ? windowHeight : yScroll;
	var pageWidth = (xScroll < windowWidth) ? windowWidth : xScroll;
	return new Array(pageWidth, pageHeight, windowWidth, windowHeight);
};

LyteBox.prototype.toggleFlash = function(state) {
	var objects = this.doc.getElementsByTagName("object");
	for (var i = 0; i < objects.length; i++) {
		objects[i].style.visibility = (state == "hide") ? 'hidden' : 'visible';
	}
	var embeds = this.doc.getElementsByTagName("embed");
	for (var i = 0; i < embeds.length; i++) {
		embeds[i].style.visibility = (state == "hide") ? 'hidden' : 'visible';
	}
	if (this.isFrame) {
		for (var i = 0; i < parent.frames.length; i++) {
			try {
				objects = parent.frames[i].window.document.getElementsByTagName("object");
				for (var j = 0; j < objects.length; j++) {
					objects[j].style.visibility = (state == "hide") ? 'hidden' : 'visible';
				}
			} catch(e) { }
			try {
				embeds = parent.frames[i].window.document.getElementsByTagName("embed");
				for (var j = 0; j < embeds.length; j++) {
					embeds[j].style.visibility = (state == "hide") ? 'hidden' : 'visible';
				}
			} catch(e) { }
		}
	}
};

// 2007-10 coyaba, show/hide select boxes (ie 6 and below only) and show/hide scrollbars
LyteBox.prototype.toggleElements = function(state) {
	// show/hide select boxes
	if (this.ie && !this.ie7) {
		var selects = this.doc.getElementsByTagName("select");
		for (var i = 0; i < selects.length; i++ ) {
			selects[i].style.visibility = (state == "hide") ? 'hidden' : 'visible';
		}
		if (this.isFrame) {
			for (var i = 0; i < parent.frames.length; i++) {
				try {
					selects = parent.frames[i].window.document.getElementsByTagName("select");
					for (var j = 0; j < selects.length; j++) {
						selects[j].style.visibility = (state == "hide") ? 'hidden' : 'visible';
					}
				} catch(e) { }
			}
		}
	}

	// enable page scrolling
	if (this.isFrame) {
		if (this.ie5) {	// hide/show any iframe(s) in the parent window
			for (var i = 0; i < parent.frames.length; i++) {
				parent.document.all[parent.frames[i].window.name].style.visibility = (state == "hide") ? 'hidden' : 'visible';
			}
		}

		if ((this.ie6 || this.ie7) && this.compat != 'BackCompat') { // IE6 and above in standards mode
			parent.document.getElementsByTagName('html')[0].style.overflow = (state == "hide") ? "hidden" : '';
		} else {
			parent.document.body.style.overflow = (state == "hide") ? "hidden" : '';
		}
	} else {
		if ((this.ie6 || this.ie7) && this.compat != 'BackCompat') { // IE6 and above in standards mode
			document.getElementsByTagName('html')[0].style.overflow = (state == "hide") ? "hidden" : '';
		} else {
			document.body.style.overflow = (state == "hide") ? "hidden" : '';
		}
	}
};

// 2007-10 coyaba
LyteBox.prototype.setScroll = function(x, y){
	window.scrollTo(x, y);
};

LyteBox.prototype.pause = function(numberMillis) {
	var now = new Date();
	var exitTime = now.getTime() + numberMillis;
	while (true) {
		now = new Date();
		if (now.getTime() > exitTime) { return; }
	}
};

LyteBox.prototype.getInfoString = function(string){
	if (string == null || string == '')
		return '';

	var string = string.replace(/\r\n/g,"<br/>");
	var string = string.replace(/\n/g,"<br/>");
	var string = string.replace(/\r/g,"<br/>");
	var info = /\[info\](.*?)\[\/info\]/i.exec(string);
	if (info!=null)
		return info[1];
	else
		return '';
};

LyteBox.prototype.getShowExif = function(string){
	if (string == null || string == '')
		return false;

	var exif = /\[exif=true\]/i.exec(string);
	if (exif!=null)
		return true;
	else
		return false;
};

// 2007-10 coyaba, geo support
LyteBox.prototype.getShowGeo = function(string){
	if (string == null || string == '')
		return false;

	var geo = /\[geo=true\]/i.exec(string);
	if (geo!=null)
		return true;
	else
		return false;
};

// 2007-10 coyaba, show info overlay on startup?
LyteBox.prototype.getOnLoadInfo = function(string){
	if (string == null || string == '')
		return false;

	var onLoadInfo = /\[onLoadInfo=true\]/i.exec(string);
	if (onLoadInfo!=null)
		return true;
	else
		return false;
};

// 2007-10 coyaba, hide title from info overlay?
LyteBox.prototype.getNoTitleInfo = function(string){
	if (string == null || string == '')
		return false;

	var noTitleInfo = /\[noTitleInfo=true\]/i.exec(string);
	if (noTitleInfo!=null)
		return true;
	else
		return false;
};

LyteBox.prototype.compileSpecialString = function() {
	if (arguments.length==0){
		return false;
	} else if (arguments.length==1){
		return arguments[0];
	} else {
		var items = arguments.length;
		var str = arguments[0];
			for (i = 1;i < items;i++){
			str = str.replace('%' + i,arguments[i]);
			}
		return str;
	}
};

// 2007-10 coyaba, handler for info overlay
LyteBox.prototype.inlineInfo = function(int_onoff) {
	var object = this.doc.getElementById('lbInfoDisplay');
	if ( !this.isShowTempFrame && !this.isLyteframe ) {
		var str_info = '';
		if ( this.isSlideshow && this.slideArray[this.activeSlide][2]!='' ) {
			str_info = this.slideArray[this.activeSlide][2];
			if ( !this.slideArray[this.activeSlide][6] ) {
				str_info = '<strong>Extra Information:'/* + this.slideArray[this.activeSlide][1]*/ + '</strong><br />' +
						   str_info;
			}
		} else if ( !this.isSlideshow && this.imageArray[this.activeImage][2]!='' ) {
			str_info = this.imageArray[this.activeImage][2];
			if ( !this.imageArray[this.activeImage][6] ) {
				str_info = '<strong>Extra Information:'/* + this.imageArray[this.activeImage][1]*/ + '</strong><br />' +
						   str_info;
			}
		}
		if ( str_info!='' ) {
			if ( int_onoff==1 ) {
				object.innerHTML = str_info;
				this.appear("lbInfoDisplay", (this.doInfoAnimations ? 0 : this.infoMaxOpacity));
			} else {
				this.fade("lbInfoDisplay", (this.doInfoAnimations ? this.infoMaxOpacity : 0));
			}
		}
	}
};

// 2007-10 coyaba, replaces onload handler by 'on_dom_load'
addDOMLoadEvent(function() {
	myLytebox = new LyteBox();
	if ( typeof(lyteboxNavType)!="undefined" && (lyteboxNavType==1 || lyteboxNavType==2) ) {
		myLytebox.navType = lyteboxNavType;
	}
});

/*
 * (c)2006 Dean Edwards/Matthias Miller/John Resig
 * Special thanks to Dan Webb's domready.js Prototype extension
 * and Simon Willison's addLoadEvent
 *
 * For more info, see:
 * http://dean.edwards.name/weblog/2006/06/again/
 * http://www.vivabit.com/bollocks/2006/06/21/a-dom-ready-extension-for-prototype
 * http://simon.incutio.com/archive/2004/05/26/addLoadEvent
 *
 * Thrown together by Jesse Skinner (http://www.thefutureoftheweb.com/)
 *
 *
 * To use: call addDOMLoadEvent one or more times with functions, ie:
 *
 * function something() {
 *    // do something
 * }
 * addDOMLoadEvent(something);
 *
 * addDOMLoadEvent(function() {
 *     // do other stuff
 * });
 *
 */

function addDOMLoadEvent(func) {
	if (!window.__load_events) {
		var init = function () {
			// quit if this function has already been called
			if (arguments.callee.done) return;

			// flag this function so we don't do the same thing twice
			arguments.callee.done = true;

			// kill the timer
			if (window.__load_timer) {
				clearInterval(window.__load_timer);
				window.__load_timer = null;
			}

			// execute each function in the stack in the order they were added
			for (var i=0;i < window.__load_events.length;i++) {
				window.__load_events[i]();
			}
			window.__load_events = null;
		};

		// for Mozilla/Opera9
		if (document.addEventListener) {
			document.addEventListener("DOMContentLoaded", init, false);
		}

		// for Internet Explorer
		/*@cc_on @*/
		/*@if (@_win32)
			document.write("<scr"+"ipt id=__ie_onload defer src=//0><\/scr"+"ipt>");
			var script = document.getElementById("__ie_onload");
			script.onreadystatechange = function() {
				if (this.readyState == "complete") {
					init(); // call the onload handler
				}
			};
		/*@end @*/

		// for Safari
		if (/WebKit/i.test(navigator.userAgent)) { // sniff
			window.__load_timer = setInterval(function() {
				if (/loaded|complete/.test(document.readyState)) {
					init(); // call the onload handler
				}
			}, 10);
		}

		// for other browsers
		window.onload = init;

		// create event function stack
		window.__load_events = [];
	}

	// add function to event stack
	window.__load_events.push(func);
}

YAHOO.namespace('galleryLayouts');if(!YD)var YD=YAHOO.util.Dom;if(!YE)var YE=YAHOO.util.Event;if(!$)var $=YD.get;var subURL='http://webservices.sitebuilder.customerstreet.com/rapidsite/xstandard/';var clientID;document.createParamElement=function(type,name,value){var element;try{element=document.createElement('<'+type+' name="'+name+'" value="'+value+'">');}catch(e){}
if(!element||!element.name){element=document.createElement(type)
element.name=name;element.value=value;}
return element;}
YAHOO.galleryLayouts.xsEdit={xsDialog:null,submitUrl:"/plugins/gallery_layouts/extras/gallery_layouts_ajax.php",imageHeight:null,imageWidth:null,self:this,setup:function(o){if(document.getElementById('admin_toolbar')){$('gallery_layouts_plugin').style.display='none';var clientEdit=YD.getElementsByClassName('client_edit','div','content_inner_wrapper');YE.addListener(clientEdit,'click',this.editElement);var clientEdit=YD.getElementsByClassName('client_edit','h2','content_inner_wrapper');YE.addListener(clientEdit,'click',this.editElement);this.addTooltips(clientEdit);var xStandard=YD.getElementsByClassName('gallery_layouts_plugin','form','extra_2')[0];YE.on(xStandard,'submit',this.catchXSSubmit);}},catchXSSubmit:function(e){var pageCopy=document.getElementById('page_copy');pageCopy.EscapeUnicode=true;document.getElementById('xhtml').value=pageCopy.value;},getNodeName:function(tag){tag=tag.toLowerCase();switch(tag){case'h2':var tagName='Main Heading';break;case'h3':var tagName='Sub-Heading';break;case'h4':var tagName='Minor Heading';break;case'p':var tagName='Paragraph';break;case'li':case'ul':case'ol':var tagName='List';break;case'img':var tagName='Image';break;default:var tagName=false;}
return tagName;},getEditNode:function(queryNode){while(queryNode.nodeType!=3&&queryNode.nodeName.toLowerCase()!='img'){queryNode=queryNode.hasChildNodes?queryNode.firstChild:queryNode.nextSibling;}
if(queryNode.parentNode.nodeName.toLowerCase()=='strong'||queryNode.parentNode.nodeName.toLowerCase()=='em'||queryNode.nodeType==3){queryNode=queryNode.parentNode;}
return queryNode;},addTooltips:function(elementList){if(elementList.length){var wrapper=document.getElementById("content_inner_wrapper");if(!YD.hasClass(wrapper,'yui-skin-sam'))YD.addClass(wrapper,'yui-skin-sam');var tagList=['h3','p','img','ul'];var idList=[];var thisNode;var contentType;for(var i=0;i<elementList.length;i++){if(!elementList[i].getElementsByTagName)continue;for(var n=0;n<tagList.length;n++){var nodes=elementList[i].getElementsByTagName(tagList[n]);for(var x=0;x<nodes.length;x++){var thisNode=nodes[x];if(!thisNode.hasAttribute('id')){thisNode.setAttribute('id','tooltip_node_'+x);}
contentType=YX.getNodeName(thisNode.nodeName);content='Edit this '+contentType+' by clicking on it.';thisNode.setAttribute('title',content);idList[idList.length]=thisNode.getAttribute('id');}}}
YX.toolTip=new YAHOO.widget.Tooltip("simple_tooltip",{context:idList,container:wrapper});}else{return false;}},closeDialog:function(){YX.xsDialog.destroy();YX.xsDialog=null;return true;},updateDom:function(elementId,domNode){var oldNode=document.getElementById(elementId);if(oldNode.hasChildNodes()){var oldChild=oldNode.firstChild;while(oldChild){var nextChild=oldChild.nextSibling;oldChild.parentNode.removeChild(oldChild);oldChild=nextChild;}}
if(domNode.hasChildNodes()){newChild=domNode.firstChild;while(newChild){var nextChild=newChild.nextSibling;oldNode.appendChild(newChild);newChild=nextChild;}}
return true;},getXmlFromString:function(xml_string){if(window.ActiveXObject){var xml_doc=new ActiveXObject('Microsoft.XMLDOM');xml_doc.async='false';xml_doc.loadXML(xml_string);}else{var xml_parser=new DOMParser();var xml_doc=xml_parser.parseFromString(xml_string,'text/xml');if(xml_doc.documentElement.nodeName=='parsererror'){return false;}}
var xml_root=xml_doc.documentElement;return xml_root;},getXmlFromDom:function(domNode){if(domNode.hasAttribute("style"))domNode.removeAttribute('style');var children=YD.getChildren(domNode);for(var i=0;i<children.length;i++){if(children[i].hasAttribute('style'))children[i].removeAttribute('style');}
if(domNode.xml){var xmlValue=domNode.xml;}else{var newDom=document.implementation.createDocument("http://www.w3.org/1999/xhtml","html",null);var newNode=newDom.importNode(domNode,true);newDom.documentElement.appendChild(newNode);var xmlSerialiser=new XMLSerializer();var xmlValue=xmlSerialiser.serializeToString(newDom.documentElement);}
return xmlValue;},createEditor:function(editNode,xsId,xsForm,dimxy,buttons,tagName){this.method;this.newParam=[];this.newParam.toolbar={'name':'ToolbarWysiwyg','value':buttons};this.newParam.styles={'name':'ShowStyles','value':'yes'};this.newParam.victim={'name':'Victim','value':editNode.id};this.newParam.timestamp={'name':'EnableTimestamp','value':'no'};var xsEditor=xsForm.cloneNode(true);var id=xsId;var width=dimxy[0];var height=dimxy[1];if(editNode.hasChildNodes()){var child=editNode.firstChild;while(child){if(child.nodeType!=3){var xmlValue=editNode.innerHTML;break;}
child=child.nextSibling;}}
if(typeof xmlValue=='undefined'){if(navigator.appVersion.indexOf("MSIE")!==-1){var xmlValue='<h2>'+$('header_1').innerHTML+'</h2>';}else{var xmlValue=YX.getXmlFromDom(editNode);}}
var self=this;var xsObject=xsEditor.getElementsByTagName('object')[0];var editor=document.createElement('div');var editHead=document.createElement('div');var editHeadText=document.createTextNode('Edit this '+tagName);var editBody=document.createElement('div');var setParameters=function(xs){if(navigator.appVersion.indexOf("MSIE")!==-1){var objParametersOut=document.getElementById('page_copy');var objParameters=objParametersOut.getElementsByTagName("param");}else{var objParameters=xs.getElementsByTagName("param");}
for(var i=0;i<objParameters.length;i++){var paramName=objParameters[i].getAttribute('name');var paramValue=objParameters[i].getAttribute('value');switch(paramName){case'width':objParameters[i].value=width;break;case'height':objParameters[i].value=height;break;case'Value':if(navigator.appVersion.indexOf("MSIE")!==-1){xmlValue=str_replace('"','&quot;',xmlValue);}
objParameters[i].value=xmlValue;break;case'ClientID':clientID=objParameters[i].value;break;default:continue;}}};var createParameters=function(xs){if(navigator.appVersion.indexOf("MSIE")!==-1){subURL=$('xstandardBase').value;paramNode=document.createParamElement('param','ClientID',clientID);xs.appendChild(paramNode);paramNode=document.createParamElement('param','License',subURL+'license.txt');xs.appendChild(paramNode);paramNode=document.createParamElement('param','Styles',subURL+'styles.xml');xs.appendChild(paramNode);paramNode=document.createParamElement('param','ImageLibraryURL',subURL+'image_library/imagelibrary.php '+subURL+'image_library/publiclibrary.php');xs.appendChild(paramNode);paramNode=document.createParamElement('param','Base',subURL+'document_library');xs.appendChild(paramNode);paramNode=document.createParamElement('param','AttachmentLibraryURL',subURL+'document_library/attachmentlibrary.php');xs.appendChild(paramNode);paramNode=document.createParamElement('param','SpellCheckerURL',subURL+'spellchecker/spellchecker.php');xs.appendChild(paramNode);paramNode=document.createParamElement('param','Options','66054');xs.appendChild(paramNode);paramNode=document.createParamElement('param','Value',xmlValue);xs.appendChild(paramNode);}
for(var param in self.newParam){paramNode=document.createParamElement('param',self.newParam[param].name,self.newParam[param].value);xs.appendChild(paramNode);}};if(xsObject){xsObject.setAttribute("id","xsedit");xsObject.setAttribute("width",width);xsObject.setAttribute("height",height);setParameters(xsObject);createParameters(xsObject);}
editor.setAttribute("id",xsId);editHead.setAttribute("class","hd");editHead.setAttribute("className","hd");editHead=editor.appendChild(editHead);editHead.appendChild(editHeadText);editBody.setAttribute("class","bd");editBody.setAttribute("className","bd");editBody=editor.appendChild(editBody);xsEditor.setAttribute("action",YX.submitUrl);xsEditor=editBody.appendChild(xsEditor);var keyWordHead=document.createElement('h3');keyWordHead.setAttribute('id','keyWordHead');editor.appendChild(keyWordHead);keyWordHead.appendChild(document.createTextNode('Your Page Key Phrases'));var keyWords=document.getElementById('keyphraseList');keyWords=keyWords.cloneNode(true);keyWords.id='keyphraseListClone';editor.appendChild(keyWords);keyWords.style.display='block';var containerSave=document.createElement('div');editor.appendChild(containerSave);containerSave.setAttribute('id','container-save');YE.on(containerSave,'click',saveButtonClicked);return editor;},getEditor:function(element,buttons,tagName){var editExists=YD.getElementsByClassName('yui-dialog','div','extra_2');if(editExists.length>0){if(YX.xsDialog!=null)YX.xsDialog.destroy();if(YX.imgDialog!=null)YX.imgDialog.destroy();}
editExists=null;width=600;height=400;if(tagName=='Image'){width=parseInt(YD.getStyle(element,'width'))+30;height=parseInt(YD.getStyle(element,'height'))+60;}
if(document.forms["gallery_layouts_plugin"]=='undefined'){return false;}
var xsForm=document.forms["gallery_layouts_plugin"];var xsEditor=YX.createEditor(element,'editor',xsForm,[width,height],buttons,tagName);var parent=document.getElementById('extra_2');parent.appendChild(xsEditor);YX.xsDialog=new YAHOO.widget.Dialog(xsEditor,{fixedcenter:true,modal:true,close:true,width:"620px",zIndex:1000});YX.xsDialog.render();YX.xsDialog.show();var editorMask=$('editor_mask');if(editorMask){maskHeight=editorMask.style.cssText;maskHeight=maskHeight.split('; ');newMaskHeight=new Array();var j=0;for(var i=0;i<maskHeight.length;i++){newMaskHeight[j]=maskHeight[i].split(': ');j++;}
for(var i=0;i<newMaskHeight.length;i++){theMaskHeight=newMaskHeight[i].toString();theMaskHeight=theMaskHeight.split(',');if(theMaskHeight[0].toLowerCase()=='height'){i++;var theRealMaskHeight=theMaskHeight[1];}}
maskHeight=theRealMaskHeight.split('px');maskHeight=maskHeight[0];maskHeight=parseFloat(maskHeight);maskHeight=maskHeight-520;editorMask.style.cssText='z-index: 1001; height: '+maskHeight+'px; width: 1263px; display: block;';}
return true;},saveContent:{copy:null,siteId:null,pageId:null,nodeId:null,submitUrl:null,update:function(){this.siteId=document.getElementById("siteid_gallery_layouts_plugin").value;this.pageId=document.getElementById("pageid_gallery_layouts_plugin").value;this.copy=escape(this.copy);if(this.copy==''){this.copy='<p style="padding: 5px;"></p>';}
this.copy=str_replace('+','#105;',this.copy);this.submitUrl="/plugins/gallery_layouts/extras/gallery_layouts_ajax.php";var postData='siteid='+this.siteId+'&pageid='+this.pageId+'&nodeid='+this.nodeId+'&copy='+this.copy;this.copy=YAHOO.util.Connect.asyncRequest('POST',this.submitUrl,updateComplete,postData);},success:function(objResponse){YX.closeDialog();var existingAnalyserToolbar=document.getElementById('analyser_toolbar');var responseDiv=document.createElement('div');var wrapper=document.getElementById('wrapper');wrapper.appendChild(responseDiv);var newHTML=objResponse.responseText;},failure:function(objResponse){}},contentChanged:function(xsEditor){xsContent=xsEditor.value;if(xsContent.indexOf('<img ')!=-1){xsDom=YX.getXmlFromString(xsContent);if(xsDom){xsDom=document.importNode(xsDom,true);xsDom=document.body.appendChild(xsDom);var imageTags=xsDom.getElementsByTagName('img');if(imageTags.length>1){var classValue='none';for(var i=0;i<imageTags.length;i++){if(imageTags[i].hasAttribute('class')){classValue=String(imageTags[i].getAttribute('class'));}
if(classValue.indexOf('client_edit')!=-1){var oldImage=imageTags[i];}else{var newImage=imageTags[i];}}
if(typeof oldImage!='undefined'&&typeof newImage!='undefined'){oldImage.setAttribute('src',newImage.getAttribute('src'));if(newImage.getAttribute('src')!=''){oldImage.setAttribute('src',newImage.getAttribute('src'));}
xsEditor.value=YX.getXmlFromDom(oldImage);}}else{if(imageTags[0].hasAttribute('height')){var imgHeight=parseInt(imageTags[0].getAttribute('height'));if(typeof(YX.imageHeight)!='number'){YX.imageHeight=imgHeight;}else{if(YX.imageHeight!=imgHeight){imageTags[0].setAttribute('height',YX.imageHeight);}}}
if(imageTags[0].hasAttribute('width')){var imgWidth=parseInt(imageTags[0].getAttribute('width'));if(typeof(YX.imageWidth)!='number'){YX.imageWidth=imgWidth;}else{if(YX.imageWidth!=imgWidth){imageTags[0].setAttribute('width',YX.imageWidth);}}}
xsEditor.value=YX.getXmlFromDom(imageTags[0]);}
xsDom.parentNode.removeChild(xsDom);}}
return true;},editElement:function(e,objTag){if(objTag==null)objTag=this;if(typeof objTag.nodeName=='string'){var tagType=objTag.nodeName.toLowerCase()
switch(tagType){case"h2":YX.editHeading(objTag);break;case"h3":case"h4":case"ul":case"ol":case"li":case"p":case"span":case"strong":case"em":YX.editParagraph(objTag);break;case"div":if(objTag.firstChild.nodeName.toLowerCase()=='img'){YX.editImage(objTag);}else{YX.editParagraph(objTag);}
break;default:alert("Tag Select Failed:"+objTag.nodeName);}}else{alert("Tag node name is undefined");}},editHeading:function(objHead){var buttons='spellchecker, copy, paste,,help';var editor=YX.getEditor(objHead,buttons,'Heading');},editList:function(objList){if(objList.nodeName.toLowerCase()=="li"){objList=YD.getAncestorByClassName(objList,'client_edit');}
var buttons='strong, em, underline, hyperlink, attachment,, spellchecker, copy, paste,,help';var editor=YX.getEditor(objList,buttons,'List');},editParagraph:function(objPara){if(objPara.nodeName.toLowerCase()!='div'){itemNode=objPara;while(itemNode.parentNode.nodeName.toLowerCase()!='div'){itemNode=itemNode.parentNode;}
objPara=itemNode;}
var buttons='strong, em, underline, sup, sub,, hyperlink, attachment, unordered-list, ordered-list, draw-data-table,, spellchecker, copy, paste,,help';var editor=YX.getEditor(objPara,buttons,'Text');}};if(!YX)var YX=YAHOO.galleryLayouts.xsEdit;YE.onDOMReady(YX.setup,YX,true);updateComplete={success:YX.saveContent.success,failure:YX.saveContent.failure,scope:YX.saveContent};xsButtonClicked=function(id,button,state){document.getElementById(id).EscapeUnicode=true;var xsEditor=document.getElementById(id);switch(button){case'save':var xsParameters=xsEditor.getElementsByTagName('param');for(var i=0;i<xsParameters.length;i++){if(xsParameters[i].getAttribute('name')=='Victim'){var oldNodeId=xsParameters[i].getAttribute('value');}
if(xsParameters[i].getAttribute('name')=='Value'){var startText=xsParameters[i].getAttribute('value');}}
YX.saveContent.nodeId=oldNodeId;var victimType=oldNodeId.substring(0,oldNodeId.indexOf('_'));var victim=document.getElementById(oldNodeId);if(xsEditor.value!==''){switch(victimType){case'header':if(navigator.appVersion.indexOf("MSIE")!==-1){newValue=xsEditor.value;newValue=newValue.toString();newValue=stripTags(newValue,null);victim.innerHTML=newValue;YX.saveContent.copy='<h2>'+newValue+'</h2>';}else{var domHeader=YX.getXmlFromString(xsEditor.value);if(domHeader){domHeader=document.importNode(domHeader,true);domHeader=document.body.appendChild(domHeader);var headerTag=domHeader.getElementsByTagName('h2')[0];if(headerTag)victim.textContent=headerTag.textContent;}
domHeader.parentNode.removeChild(domHeader);YX.saveContent.copy=xsEditor.value;}
break;case'text':victim.innerHTML=xsEditor.value;YX.saveContent.copy=xsEditor.value;break;case'extratext':victim.innerHTML=xsEditor.value;YX.saveContent.copy=xsEditor.value;break;default:;}}else{var youSure=confirm("Warning: removing all content will remove this section from the page completely and cannot be recovered");if(youSure){switch(victimType){case'header':victim.innerHTML='<h2>This Is Major Heading 1</h2>';YX.saveContent.copy='<h2>This Is Major Heading 1</h2>';break;case'text':victim.innerHTML='<p style="padding: 5px;"></p>';YX.saveContent.copy='<p style="padding: 5px;"></p>';break;case'extratext':victim.innerHTML='<p style="padding: 5px;"></p>';YX.saveContent.copy='<p style="padding: 5px;"></p>';break;default:break;}}else{xsEditor.value=startText;return false;}}
YX.saveContent.update();break;case'image':break;}
return true;};xsTagListChanged=function(id){xsEditor=document.getElementById(id);var update=YX.contentChanged(xsEditor);if(!update)alert('Could not change content');return true;}
xsContentChanged=function(id){xsEditor=document.getElementById(id);var update=YX.contentChanged(xsEditor);if(!update)alert('Could not change content');return true;};function saveButtonClicked(){xsButtonClicked('xsedit','save',null)}