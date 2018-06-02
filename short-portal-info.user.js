// ==UserScript==
// @id             iitc-plugin-short-portal-info@eccenux
// @namespace      https://github.com/jonatkins/ingress-intel-total-conversion
// @name           IITC plugin: Short portal info
// @category       Misc
// @version        0.0.1
// @description    [0.0.1] Shows small box with a basic portal information. This is similar to mobile info.
// @include        https://*.ingress.com/intel*
// @include        http://*.ingress.com/intel*
// @match          https://*.ingress.com/intel*
// @match          http://*.ingress.com/intel*
// @grant          none
// ==/UserScript==

function wrapper(plugin_info) {
// ensure plugin framework is there, even if iitc is not yet loaded
if(typeof window.plugin !== 'function') window.plugin = function() {};


//PLUGIN START ////////////////////////////////////////////////////////
/**
	CSS based on #mobileinfo CSS.
*/
var pluginCss = `
	#shortportalinfo {
		float: left;
		width: 50%;
		text-overflow: ellipsis;
		white-space: nowrap;
		overflow: hidden;
		position:relative;
		padding: 4px 0;
		-moz-box-sizing: border-box;
		-webkit-box-sizing: border-box;
		box-sizing: border-box;
	}

	#shortportalinfo .portallevel {
		padding: 0 0.25em;
		color: #FFF;
	}

	#shortportalinfo .resonator {
		position: absolute;
		width: 12%; /* a little less that 1/8 to have a small distance */
		height: 100%;
		top: 0;
		border-top: 3px solid red;
		box-sizing: border-box;
		-moz-box-sizing: border-box;
		-webkit-box-sizing: border-box;
	}

	#shortportalinfo .resonator.north:before {
		content: "";
		background-color: red;
		border-radius: 100%;
		display: block;
		height: 6px;
		width: 6px;
		left: 50%;
		top: -3px; 
		margin-left: -3px;
		position: absolute;
		z-index: -1;
	}

	#shortportalinfo .filllevel {
		position: absolute;
		bottom: 0;
		height: 3px;
	}

	#shortportalinfo .enl .filllevel {
		background-color: #03fe03 !important;
	}

	#shortportalinfo .res .filllevel {
		background-color: #00c5ff !important;
	}
`;

/**
	Render portal for the short info.
*/
function renderPortal(data) {
	var guid = data.selectedPortalGuid;
	if(!window.portals[guid]) return;

	var data = window.portals[selectedPortal].options.data;
	var details = window.portalDetail.get(guid);

	var lvl = data.level;
	if(data.team === "NEUTRAL")
		var t = '<span class="portallevel">L0</span>';
	else
		var t = '<span class="portallevel" style="background: '+COLORS_LVL[lvl]+';">L' + lvl + '</span>';

	var percentage = data.health;
	if(details) {
		var totalEnergy = getTotalPortalEnergy(details);
		if(getTotalPortalEnergy(details) > 0) {
			percentage = Math.floor(getCurrentPortalEnergy(details) / totalEnergy * 100);
		}
	}
	t += ' ' + percentage + '% ';
	t += data.title;

	if(details) {
		var l,v,max,perc;
		var eastAnticlockwiseToNorthClockwise = [2,1,0,7,6,5,4,3];

		for(var ind=0;ind<8;ind++)
		{
			if (details.resonators.length == 8) {
				var slot = eastAnticlockwiseToNorthClockwise[ind];
				var reso = details.resonators[slot];
			} else {
				var slot = null;
				var reso = ind < details.resonators.length ? details.resonators[ind] : null;
			}

			var className = TEAM_TO_CSS[getTeam(details)];
			if(slot !== null && OCTANTS[slot] === 'N')
				className += ' north'
			if(reso) {
				l = parseInt(reso.level);
				v = parseInt(reso.energy);
				max = RESO_NRG[l];
				perc = v/max*100;
			} else {
				l = 0;
				v = 0;
				max = 0;
				perc = 0;
			}

			t += '<div class="resonator '+className+'" style="border-top-color: '+COLORS_LVL[l]+';left: '+(100*ind/8.0)+'%;">';
			t += '<div class="filllevel" style="width:'+perc+'%;"></div>';
			t += '</div>'
		}
	}
	
	return t;
}

/**
	Function to run when current portal change.
*/
function updatePortalInfo(portalData) {
	var html = renderPortal(portalData);
	$('#shortportalinfo').html(html);
}

//PLUGIN SETUP //////////////////////////////////////////////////////////

var setup = function() {
	if(isSmartphone()) return;
	
	// html
	$('#updatestatus').prepend('<div id="shortportalinfo"></div>');
	$('#shortportalinfo').click(function(){
		$('#sidebartoggle').click();
	});
	
	// css
	var css = document.createElement("style");
	css.type = "text/css";
	css.innerHTML = pluginCss;
	document.body.appendChild(css);

	// hooks
	window.addHook('portalSelected', updatePortalInfo);
};

//PLUGIN END //////////////////////////////////////////////////////////


setup.info = plugin_info; //add the script info data to the function as a property
if(!window.bootPlugins) window.bootPlugins = [];
window.bootPlugins.push(setup);
// if IITC has already booted, immediately run the 'setup' function
if(window.iitcLoaded && typeof setup === 'function') setup();
} // wrapper end
// inject code into site context
var script = document.createElement('script');
var info = {};
if (typeof GM_info !== 'undefined' && GM_info && GM_info.script) info.script = { version: GM_info.script.version, name: GM_info.script.name, description: GM_info.script.description };
script.appendChild(document.createTextNode('('+ wrapper +')('+JSON.stringify(info)+');'));
(document.body || document.head || document.documentElement).appendChild(script);

