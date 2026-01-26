/*
	Dimension by HTML5 UP
	html5up.net | @ajlkn
	Free for personal and commercial use under the CCA 3.0 license (html5up.net/license)
*/
// sliding image comparison script
function initComparisons() {
	var x, i;
	/* Find all elements with an "overlay" class: */
	x = document.getElementsByClassName("img-comp-overlay");
	for (i = 0; i < x.length; i++) {
		/* Once for each "overlay" element:
		pass the "overlay" element as a parameter when executing the compareImages function: */
		compareImages(x[i]);
	}
	function compareImages(img) {
		var slider, clicked = 0, w, h, percent = 0.5;
		var overlay = img; // overlay element (the one with class img-comp-overlay)
		var container = overlay.parentElement;

		/* Get the width and height of the container element */
		w = container.offsetWidth;
		h = container.offsetHeight;
		/* Start at center (50%) unless percent was changed by user) */
		percent = (typeof percent === 'number' && percent >= 0 && percent <= 1) ? percent : 0.5;

		/* Ensure overlay covers the container and will be clipped rather than resized */
		overlay.style.position = 'absolute';
		overlay.style.top = '0';
		overlay.style.left = '0';
		overlay.style.width = '100%';
		overlay.style.height = '100%';
		overlay.style.overflow = 'hidden';

		/* Initial clip: hide the right side based on percent */
		var initX = Math.round(percent * w);
		overlay.style.clipPath = 'inset(0 ' + (Math.max(0, w - initX)) + 'px 0 0)';
		overlay.style.webkitClipPath = 'inset(0 ' + (Math.max(0, w - initX)) + 'px 0 0)';

		/* Create slider: */
		slider = document.createElement("DIV");
		slider.setAttribute("class", "img-comp-slider");
		/* Insert slider */
		container.insertBefore(slider, overlay);
		/* Position the slider according to percent: */
		slider.style.top = (h / 2) - (slider.offsetHeight / 2) + "px";
		slider.style.left = (initX - (slider.offsetWidth / 2)) + "px";

		/* Recalculate sizes & positions on window resize to keep slider in sync */
		var _resizeTimer = null;
		function doResize() {
			// update container dimensions
			w = container.offsetWidth;
			h = container.offsetHeight;
			// clamp percent
			if (isNaN(percent) || percent < 0) percent = 0;
			if (percent > 1) percent = 1;
			var x = Math.round(percent * (w || 0));
			// update overlay clip and slider position
			var rightInset = Math.max(0, w - x);
			overlay.style.clipPath = 'inset(0 ' + rightInset + 'px 0 0)';
			overlay.style.webkitClipPath = 'inset(0 ' + rightInset + 'px 0 0)';
			slider.style.left = (x - (slider.offsetWidth / 2)) + "px";
			slider.style.top = (h / 2) - (slider.offsetHeight / 2) + "px";
		}
		function handleResize() {
			// debounce to avoid layout thrashing
			if (_resizeTimer) clearTimeout(_resizeTimer);
			_resizeTimer = setTimeout(function () {
				_resizeTimer = null;
				doResize();
			}, 40);
		}
		window.addEventListener('resize', handleResize);

		// If available, observe size changes of the container (covers show/hide and responsive changes)
		var _ro = null;
		if (typeof ResizeObserver !== 'undefined') {
			try {
				_ro = new ResizeObserver(function () { handleResize(); });
				_ro.observe(container);
			} catch (e) { _ro = null; }
		}

		// Also watch for body class changes (the app toggles visibility by changing body classes)
		var _mo = null;
		if (typeof MutationObserver !== 'undefined') {
			_mo = new MutationObserver(function (mutations) {
				mutations.forEach(function (m) {
					if (m.attributeName === 'class') {
						// If container has a width now, resize immediately; otherwise debounce
						if (container.offsetWidth > 0) handleResize();
						else setTimeout(handleResize, 80);
					}
				});
			});
			_mo.observe(document.body, { attributes: true, attributeFilter: ['class'] });
		}

		/* Create or update container-level corner labels and populate from data attributes.
		   These labels follow which image is visible at each corner and are updated during slide(). */
		var baseLabel = container.dataset.leftLabel || '';
		var overlayLabel = container.dataset.rightLabel || '';

		// var cornerLeft = container.querySelector('.img-corner-label.left');
		// var cornerRight = container.querySelector('.img-corner-label.right');
		// if (!cornerLeft) {
		// 	cornerLeft = document.createElement('span');
		// 	cornerLeft.className = 'img-corner-label left';
		// 	container.appendChild(cornerLeft);
		// }
		// if (!cornerRight) {
		// 	cornerRight = document.createElement('span');`
		// 	cornerRight.className = 'img-corner-label right';
		// 	container.appendChild(cornerRight);
		// }

		/* updateLabels: set text & visibility depending on slider pos x (pixels) */
		function updateLabels(x) {
			// overlay covers from left edge to x. base visible from x to right edge.
			var showingOverlayAtLeft = x > 0; // overlay reaches left corner if x>0
			var showingOverlayAtRight = x > w; // overlay reaches right corner only when x >= w

			// left corner should describe whichever image is visible there
			// if (showingOverlayAtLeft) {
			// 	cornerLeft.textContent = overlayLabel;
			// } else {
			// 	cornerLeft.textContent = baseLabel;
			// }

			// // right corner: overlay only when fully extended; otherwise base
			// if (showingOverlayAtRight) {
			// 	cornerRight.textContent = overlayLabel;
			// } else {
			// 	cornerRight.textContent = baseLabel;
			// }

			// Visibility rules: hide a corner label when its corresponding image is not present at that corner
			// (keep both visible when corners show different images)
			// left corner hidden only when neither image is naturally visible (shouldn't happen) — keep shown
			// right corner hidden when overlay fully covers and we want only overlay label visible (already set)
			// Use opacity to smoothly hide if needed; here both labels remain visible but show proper text
			// If you prefer to hide when text matches empty, add classes accordingly.
			// cornerLeft.classList.toggle('hidden', cornerLeft.textContent === '');
			// cornerRight.classList.toggle('hidden', cornerRight.textContent === '');
		}

		// initialize labels at starting position (slider centered by default in original script)
		updateLabels(w / 2);

		/* Execute a function when the mouse button is pressed: */
		slider.addEventListener("mousedown", slideReady);
		/* And another function when the mouse button is released: */
		window.addEventListener("mouseup", slideFinish);
		/* Or touched (for touch screens: */
		slider.addEventListener("touchstart", slideReady);
		/* And released (for touch screens: */
		window.addEventListener("touchend", slideFinish);

		function slideReady(e) {
			e.preventDefault();
			clicked = 1;
			window.addEventListener("mousemove", slideMove);
			window.addEventListener("touchmove", slideMove);
		}

		function slideFinish() {
			clicked = 0;
		}

		function slideMove(e) {
			var pos;
			if (clicked == 0) return false;
			pos = getCursorPos(e);
			if (pos < 0) pos = 0;
			if (pos > w) pos = w;
			slide(pos);
		}

		function getCursorPos(e) {
			var a, x = 0;
			e = (e.changedTouches) ? e.changedTouches[0] : e;
			/* Use container bounds (not overlay) so clipping doesn't affect coordinates */
			a = container.getBoundingClientRect();
			x = e.pageX - a.left;
			x = x - window.pageXOffset;
			return x;
		}

		function slide(x) {
			/* Keep percent (ratio) so we can update on resize */
			percent = (w > 0) ? (x / w) : 0;
			/* Calculate how much of the right side should be hidden (in pixels) */
			var rightInset = Math.max(0, Math.min(w, w - x));
			overlay.style.clipPath = 'inset(0 ' + rightInset + 'px 0 0)';
			overlay.style.webkitClipPath = 'inset(0 ' + rightInset + 'px 0 0)';
			/* Position the slider at the cursor */
			slider.style.left = (x - (slider.offsetWidth / 2)) + "px";
		}
	}
}

(function ($) {
	initComparisons();

	var $window = $(window),
		$body = $('body'),
		$wrapper = $('#wrapper'),
		$header = $('#header'),
		$footer = $('#footer'),
		$main = $('#main'),
		$main_articles = $main.children('article');

	// Breakpoints.
	breakpoints({
		xlarge: ['1281px', '1680px'],
		large: ['981px', '1280px'],
		medium: ['737px', '980px'],
		small: ['481px', '736px'],
		xsmall: ['361px', '480px'],
		xxsmall: [null, '360px']
	});

	// Play initial animations on page load.
	$window.on('load', function () {
		window.setTimeout(function () {
			$body.removeClass('is-preload');
		}, 100);
	});

	// Fix: Flexbox min-height bug on IE.
	if (browser.name == 'ie') {

		var flexboxFixTimeoutId;

		$window.on('resize.flexbox-fix', function () {

			clearTimeout(flexboxFixTimeoutId);

			flexboxFixTimeoutId = setTimeout(function () {

				if ($wrapper.prop('scrollHeight') > $window.height())
					$wrapper.css('height', 'auto');
				else
					$wrapper.css('height', '100vh');

			}, 250);

		}).triggerHandler('resize.flexbox-fix');

	}

	// Nav.
	var $nav = $header.children('nav'),
		$nav_li = $nav.find('li');

	// Add "middle" alignment classes if we're dealing with an even number of items.
	if ($nav_li.length % 2 == 0) {

		$nav.addClass('use-middle');
		$nav_li.eq(($nav_li.length / 2)).addClass('is-middle');

	}

	// Main.
	var delay = 325,
		locked = false;

	// Methods.
	$main._show = function (id, initial) {

		var $article = $main_articles.filter('#' + id);

		// No such article? Bail.
		if ($article.length == 0)
			return;

		// Handle lock.

		// Already locked? Speed through "show" steps w/o delays.
		if (locked || (typeof initial != 'undefined' && initial === true)) {

			// Mark as switching.
			$body.addClass('is-switching');

			// Mark as visible.
			$body.addClass('is-article-visible');

			// Deactivate all articles (just in case one's already active).
			$main_articles.removeClass('active');

			// Hide header, footer.
			$header.hide();
			$footer.hide();


			// Special case for Chill section: focus on background only
			if (id === 'chill') {
				// Hide all content except #bg
				$main.hide();
				$header.hide();
				$footer.hide();
				$('#bg').show();
				// Hide all children of body except #bg
				$body.children().not('#bg').hide();
				// Hide the chill article itself so no window appears
				$article.hide();
				// Ensure focused bg element exists and show it via class
				var $bg = $('#bg');
				if ($bg.find('.bg-focus').length === 0) $bg.append('<div class="bg-focus"></div>');
				// Fade the blurred bg out first, then fade the focused image in
				$body.addClass('chill-bg-fadeout');
				// show chill audio toggle
				$('#chill-audio-toggle').show();
				// show next-track button as well (only in Chill)
				$('#chill-next-track').show();
				// Shuffle/reset chill playlist when entering Chill
				try { var _ca = $('#chill-audio'); if (_ca.length && _ca[0].resetChill) _ca[0].resetChill(); } catch (e) { }
				setTimeout(function () { $body.addClass('chill-bg-focus'); }, 200);
			} else {
				// Show main, article.
				$main.show();
				$article.show();
				// hide chill audio toggle when not in Chill
				$('#chill-audio-toggle').hide();
				$('#chill-next-track').hide();
				// Activate article.
				$article.addClass('active');
			}

			// Unlock.
			locked = false;

			// Unmark as switching.
			setTimeout(function () {
				$body.removeClass('is-switching');
			}, (initial ? 1000 : 0));

			return;

		}

		// Lock.
		locked = true;

		// Article already visible? Just swap articles.
		if ($body.hasClass('is-article-visible')) {

			// Deactivate current article.
			var $currentArticle = $main_articles.filter('.active');

			$currentArticle.removeClass('active');

			// Show article.
			setTimeout(function () {

				// Hide current article.
				$currentArticle.hide();

				// Special-case: Chill should not display an article window.
				if (id === 'chill') {
					$main.hide();
					$header.hide();
					$footer.hide();
					$('#bg').show();
					$body.children().not('#bg').hide();
					$article.hide();
					var $bg = $('#bg');
					if ($bg.find('.bg-focus').length === 0) $bg.append('<div class="bg-focus"></div>');
					$body.addClass('chill-bg-fadeout');
					// show chill audio toggle
					$('#chill-audio-toggle').show();
					// show next-track button as well (only in Chill)
					$('#chill-next-track').show();
					// Shuffle/reset chill playlist when entering Chill
					try { var _ca = $('#chill-audio'); if (_ca.length && _ca[0].resetChill) _ca[0].resetChill(); } catch (e) { }
					setTimeout(function () { $body.addClass('chill-bg-focus'); }, 200);
					// Window stuff.
					$window
						.scrollTop(0)
						.triggerHandler('resize.flexbox-fix');

					// Unlock.
					setTimeout(function () {
						locked = false;
					}, delay);

					return;
				}

				// Show article.
				$article.show();
				// hide chill audio toggle when not in Chill
				$('#chill-audio-toggle').hide();
				$('#chill-next-track').hide();

				// Activate article.
				setTimeout(function () {

					$article.addClass('active');

					// Window stuff.
					$window
						.scrollTop(0)
						.triggerHandler('resize.flexbox-fix');

					// Unlock.
					setTimeout(function () {
						locked = false;
					}, delay);

				}, 25);

			}, delay);

		}

		// Otherwise, handle as normal.
		else {

			// Mark as visible.
			$body
				.addClass('is-article-visible');

			// Show article.
			setTimeout(function () {

				// Hide header, footer.
				$header.hide();
				$footer.hide();

				// Special-case: Chill should focus background only.
				if (id === 'chill') {
					$main.hide();
					$header.hide();
					$footer.hide();
					$('#bg').show();
					$body.children().not('#bg').hide();
					$article.hide();
					var $bg = $('#bg');
					if ($bg.find('.bg-focus').length === 0) $bg.append('<div class="bg-focus"></div>');
					$body.addClass('chill-bg-fadeout');
					// show chill audio toggle
					$('#chill-audio-toggle').show();
					// show next-track button as well (only in Chill)
					$('#chill-next-track').show();
					// Shuffle/reset chill playlist when entering Chill
					try { var _ca = $('#chill-audio'); if (_ca.length && _ca[0].resetChill) _ca[0].resetChill(); } catch (e) { }
					setTimeout(function () { $body.addClass('chill-bg-focus'); }, 200);
					// Window stuff.
					$window
						.scrollTop(0)
						.triggerHandler('resize.flexbox-fix');

					// Unlock.
					setTimeout(function () {
						locked = false;
					}, delay);

					return;
				}

				// Show main, article.
				$main.show();
				$article.show();
				// hide chill audio toggle when not in Chill
				$('#chill-audio-toggle').hide();
				$('#chill-next-track').hide();

				// Activate article.
				setTimeout(function () {

					$article.addClass('active');

					// Window stuff.
					$window
						.scrollTop(0)
						.triggerHandler('resize.flexbox-fix');

					// Unlock.
					setTimeout(function () {
						locked = false;
					}, delay);

				}, 25);

			}, delay);

		}

	};

	$main._hide = function (addState) {

		var $article = $main_articles.filter('.active');

		// Ensure next-track button is hidden immediately on any hide/exit
		try { $('#chill-next-track').hide(); } catch (e) { }


		// Restore everything if Chill was focused (stagger fade-out with blur-on-top)
		if ($body.hasClass('chill-bg-focus') || $body.hasClass('chill-bg-fadeout')) {
			var $bg = $('#bg'), $focus = $bg.find('.bg-focus');
			// Pause chill audio if playing and hide the toggle
			var $chillAudio = $('#chill-audio');
			var $chillToggle = $('#chill-audio-toggle');
			if ($chillAudio.length) {
				try { $chillAudio[0].pause(); } catch (e) { }
			}
			if ($chillToggle.length) {
				$chillToggle.removeClass('playing');
				$chillToggle.hide();
				// hide next-track immediately as well
				var $chillNext = $('#chill-next-track');
				if ($chillNext.length) $chillNext.hide();
			}
			// trigger the restore state: bring blurred bg on top and fade it in while focus fades out
			$body.removeClass('chill-bg-focus');
			$body.addClass('chill-restore');
			if ($focus.length) {
				// after both fades complete, remove helper classes and element, then restore content
				setTimeout(function () {
					$body.removeClass('chill-bg-fadeout chill-restore');
					$focus.remove();
					// Show all children except #bg
					$body.children().not('#bg').show();
					$('#bg').show();
				}, 700);
			} else {
				$body.removeClass('chill-bg-fadeout chill-restore');
				$body.children().not('#bg').show();
				$('#bg').show();
			}
		}


		// Article not visible? Bail.
		if (!$body.hasClass('is-article-visible'))
			return;

		// Add state?
		if (typeof addState != 'undefined'
			&& addState === true)
			history.pushState(null, null, '#');

		// Handle lock.

		// Already locked? Speed through "hide" steps w/o delays.
		if (locked) {

			// Mark as switching.
			$body.addClass('is-switching');

			// Deactivate article.
			$article.removeClass('active');

			// Hide article, main.
			$article.hide();
			$main.hide();

			// Show footer, header.
			$footer.show();
			$header.show();

			// Unmark as visible.
			$body.removeClass('is-article-visible');

			// Unlock.
			locked = false;

			// Unmark as switching.
			$body.removeClass('is-switching');

			// Window stuff.
			$window
				.scrollTop(0)
				.triggerHandler('resize.flexbox-fix');

			return;

		}

		// Lock.
		locked = true;

		// Deactivate article.
		$article.removeClass('active');

		// Hide article.
		setTimeout(function () {

			// Hide article, main.
			$article.hide();
			$main.hide();

			// Show footer, header.
			$footer.show();
			$header.show();

			// Unmark as visible.
			setTimeout(function () {

				$body.removeClass('is-article-visible');

				// Window stuff.
				$window
					.scrollTop(0)
					.triggerHandler('resize.flexbox-fix');

				// Unlock.
				setTimeout(function () {
					locked = false;
				}, delay);

			}, 25);

		}, delay);


	};

	// Articles.
	$main_articles.each(function () {

		var $this = $(this);

		// Close.
		$('<div class="close">Close</div>')
			.appendTo($this)
			.on('click', function () {
				location.hash = '';
			});

		// Prevent clicks from inside article from bubbling.
		$this.on('click', function (event) {
			event.stopPropagation();
		});

	});

	// Audio toggle handling for Chill mode (button inside #bg)
	var $chillAudioEl = $('#chill-audio'),
		$chillToggleBtn = $('#chill-audio-toggle');

	// Chill playlist. When Chill is entered we shuffle
	// the playback order. After the last track finishes we wrap back to the first
	// in the shuffled order so playback cycles through the shuffled list.
	(function setupChillPlaylist() {
		var tracks = [
			'music/phonk1.mp3',
			'music/phonk2.mp3',
			'music/phonk3.mp3'
		];

		function shuffleArray(a) {
			for (var i = a.length - 1; i > 0; i--) {
				var j = Math.floor(Math.random() * (i + 1));
				var t = a[i]; a[i] = a[j]; a[j] = t;
			}
		}

		if ($chillAudioEl.length) {
			var audio = $chillAudioEl[0];
			// Ensure we don't loop single file; we'll manage sequence ourselves
			try { audio.loop = false; } catch (e) { }

			// attach playlist data and methods
			audio._chillTracks = tracks;
			audio._chillOrder = [];
			audio._chillIndex = 0;

			// helper: if a data-URI mapping was generated (audio-data.js), prefer it when running from file://
			function _getTrackSrc(trackPath) {
				try {
					if (window && window.EMBEDDED_AUDIO && window.EMBEDDED_AUDIO[trackPath]) return window.EMBEDDED_AUDIO[trackPath];
				} catch (e) { }
				return trackPath;
			}

			audio.resetChill = function () {
				audio._chillOrder = tracks.map(function (_, i) { return i; });
				shuffleArray(audio._chillOrder);
				audio._chillIndex = 0;
				audio.src = _getTrackSrc(tracks[audio._chillOrder[audio._chillIndex]]);
			};

			audio.playNextChill = function () {
				audio._chillIndex = (audio._chillIndex + 1) % audio._chillOrder.length;
				audio.src = _getTrackSrc(tracks[audio._chillOrder[audio._chillIndex]]);
				audio.play().catch(function () { });
			};

			// When a track ends, go to next (wraps automatically via modulo above)
			audio.addEventListener('ended', function () {
				try { audio.playNextChill(); } catch (e) { }
			});

			// Initialize order once so the user can toggle play immediately
			try { audio.resetChill(); } catch (e) { }
		}
	})();

	// Simple Chill audio visualizer: draws frequency bars into a canvas appended to #bg or .bg-focus
	(function setupChillVisualizer() {
		var audioEl = $chillAudioEl.length ? $chillAudioEl[0] : null;
		if (!audioEl) return;
		var AudioCtx = window.AudioContext || window.webkitAudioContext;
		var actx = null, src = null, analyser = null, dataArray = null, bufferLength = 0;
		var canvas = null, cctx = null, rafId = null;
		var barCount = 38; // number of bars to draw
		// visual appearance: fraction of slot width used by bar (0..1). Smaller -> thinner bars, larger gaps
		var barFillRatio = 0.35;

		// visualizer helpers
		var _bands = null; // array of {start,end} for each visual bar (log-spaced)
		var _barHeights = null; // smoothed heights [0..1]
		var _lfoPhase = null, _lfoFreq = null, _lfoAmp = null;
		var _lastTimestamp = null;

		function ensureCanvas() {
			var bg = document.getElementById('bg');
			if (!bg) bg = document.body;
			if (!canvas) {
				canvas = document.createElement('canvas');
				canvas.className = 'chill-visualizer-canvas';
				canvas.style.position = 'absolute';
				// center horizontally and place a bit above vertical center
				canvas.style.left = '50%';
				canvas.style.right = 'auto';
				canvas.style.top = '70%';
				canvas.style.bottom = 'auto';
				canvas.style.transform = 'translate(-50%, -60%)';
				// width as percent so canvas centers responsively; height controls visual size
				canvas.style.width = '40%';
				canvas.style.maxWidth = '1200px';
				canvas.style.height = '100px';
				canvas.style.pointerEvents = 'none';
				canvas.style.zIndex = 40;
				bg.appendChild(canvas);
				cctx = canvas.getContext('2d');
				resizeCanvas();
				window.addEventListener('resize', resizeCanvas);
			}
		}

		function resizeCanvas() {
			if (!canvas) return;
			var rect = canvas.getBoundingClientRect();
			canvas.width = Math.max(300, rect.width * (window.devicePixelRatio || 1));
			canvas.height = Math.max(64, rect.height * (window.devicePixelRatio || 1));
			if (cctx) cctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
		}

		function connectAudio() {
			if (!AudioCtx) return;
			if (!actx) actx = new AudioCtx();
			try {
				if (!src) src = actx.createMediaElementSource(audioEl);
				if (!analyser) {
					analyser = actx.createAnalyser();
					analyser.fftSize = 2048;
					bufferLength = analyser.frequencyBinCount;
					dataArray = new Uint8Array(bufferLength);
					// create a gain node so we can fade in/out via WebAudio
					var gainNode = actx.createGain();
					gainNode.gain.value = 1.0;
					src.connect(gainNode);
					gainNode.connect(analyser);
					analyser.connect(actx.destination);
					// store references on the element for use by other code (fade control)
					audioEl._actx = actx;
					audioEl._gainNode = gainNode;
					audioEl._srcNode = src;

					// prepare log-frequency bands (map frequency ranges to FFT bins)
					_bands = [];
					_barHeights = new Array(barCount).fill(0);
					// per-band time-based LFOs for subtle jiggle on low-frequency bands
					_lfoPhase = new Array(barCount);
					_lfoFreq = new Array(barCount);
					_lfoAmp = new Array(barCount);
					for (var li = 0; li < barCount; li++) {
						_lfoPhase[li] = Math.random() * Math.PI * 2;
						// faster LFOs for more rapid jiggle: 1.2 - 6.0 Hz
						_lfoFreq[li] = 1.2 + Math.random() * 4.8;
						// only low bands get noticeable amplitude; others near zero
						var lowCount = Math.max(4, Math.floor(barCount * 0.4));
						if (li < lowCount) _lfoAmp[li] = 0.01 + Math.random() * 0.005; else _lfoAmp[li] = 0.0;
					}
					var sampleRate = actx.sampleRate || 44100;
					var fftSize = analyser.fftSize || (bufferLength * 2);
					var fMin = 10; // lower bound frequency to visualize (Hz)
					// Option: limit upper frequency visualized to avoid many silent high bands
					var fMaxCut = 22000; // default cutoff (Hz) — set to null to use Nyquist
					var fMax = (fMaxCut && fMaxCut > fMin) ? Math.min(fMaxCut, sampleRate / 2) : sampleRate / 2;
					// Use log spacing between fMin and fMax
					for (var bi = 0; bi < barCount; bi++) {
						var frac1 = bi / barCount;
						var frac2 = (bi + 1) / barCount;
						var f1 = fMin * Math.pow(fMax / fMin, frac1);
						var f2 = fMin * Math.pow(fMax / fMin, frac2);
						// convert frequency to bin index: bin = freq * fftSize / sampleRate
						var start = Math.floor(f1 * fftSize / sampleRate);
						var end = Math.floor(f2 * fftSize / sampleRate);
						// clamp and ensure at least one bin
						start = Math.max(0, Math.min(bufferLength - 1, start));
						end = Math.max(0, Math.min(bufferLength - 1, end));
						if (end <= start) end = Math.min(start + 1, bufferLength - 1);
						_bands.push({ start: start, end: end });
					}
				}
			} catch (e) { }
		}

		function draw(timestamp) {
			// compute frame delta (seconds) for time-based LFOs
			var dt = 1 / 60;
			if (typeof timestamp !== 'undefined') {
				if (_lastTimestamp) dt = Math.max(0.001, (timestamp - _lastTimestamp) / 1000);
				_lastTimestamp = timestamp;
			}


			if (!analyser || !cctx || !canvas) return;
			analyser.getByteFrequencyData(dataArray);
			var w = canvas.width / (window.devicePixelRatio || 1);
			var h = canvas.height / (window.devicePixelRatio || 1);
			cctx.clearRect(0, 0, w, h);
			var slotW = w / barCount;
			var barW = Math.max(1, slotW * (barFillRatio || 0.35));
			var sideGap = (slotW - barW) / 2;
			// If bands not prepared (analyser not ready), fall back to linear mapping
			if (!_bands) {
				var step = Math.max(1, Math.floor(bufferLength / barCount));
				for (var i = 0; i < barCount; i++) {
					var sum = 0;
					for (var j = 0; j < step; j++) sum += dataArray[(i * step) + j] || 0;
					var avg = sum / step / 255;
					var barH = Math.max(2, avg * h);
					var x = (i * slotW) + sideGap;
					var grd = cctx.createLinearGradient(0, h - barH, 0, h);
					grd.addColorStop(0, 'rgba(255,255,255,0.6)');
					grd.addColorStop(1, 'rgba(255,255,255,0.25)');
					cctx.fillStyle = grd;
					cctx.fillRect(x, h - barH, Math.max(1, barW), barH);
				}
			} else {
				for (var i = 0; i < barCount; i++) {
					var band = _bands[i];
					var sum = 0;
					var count = 0;
					for (var k = band.start; k <= band.end; k++) { sum += dataArray[k] || 0; count++; }
					var avg = (count > 0) ? (sum / count / 255) : 0;
					// compress dynamic range and slightly boost higher bands to even the spread
					var compressed = Math.pow(avg, 0.6); // gamma compression
					var boost = 0.6 + 0.8 * (i / (barCount - 1)); // 0.6..1.4
					var value = Math.min(1, compressed * boost);
					// subtle LFO-based jiggle for low bands (helps constant bass appear alive)
					try {
						if (typeof _lfoPhase !== 'undefined' && _lfoAmp && _lfoFreq) {
							_lfoPhase[i] += (2 * Math.PI * (_lfoFreq[i] || 0)) * dt;
							var l = Math.sin(_lfoPhase[i]) * (_lfoAmp[i] || 0);
							// modulate jiggle by current energy so it feels responsive
							value = Math.max(0, Math.min(1, value + l * (0.6 + compressed * 0.8)));
						}
					} catch (e) { }
					// smooth (exponential moving average)
					_barHeights[i] = (_barHeights[i] * 0.7) + (value * 0.3);
					var barH = Math.max(2, _barHeights[i] * h);
					var x = (i * slotW) + sideGap;
					var grd = cctx.createLinearGradient(0, h - barH, 0, h);
					grd.addColorStop(0, 'rgba(255,255,255,0.6)');
					grd.addColorStop(1, 'rgba(255,255,255,0.25)');
					cctx.fillStyle = grd;
					cctx.fillRect(x, h - barH, Math.max(1, barW), barH);
				}
			}
			rafId = requestAnimationFrame(draw);
		}

		function startVisualizer() {
			ensureCanvas();
			connectAudio();
			if (actx && actx.state === 'suspended') try { actx.resume(); } catch (e) { }
			if (!rafId) draw();
		}

		function stopVisualizer() {
			if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
			if (cctx && canvas) { cctx.clearRect(0, 0, canvas.width, canvas.height); }
		}

		// Hook into audio play/pause events
		audioEl.addEventListener('play', function () { startVisualizer(); });
		audioEl.addEventListener('playing', function () { startVisualizer(); });
		audioEl.addEventListener('pause', function () { stopVisualizer(); });
		audioEl.addEventListener('ended', function () { stopVisualizer(); });

		// When Chill is exited we remove the canvas to avoid leftover visuals
		$('#chill-exit').on('click', function () { stopVisualizer(); if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas); canvas = null; });

	})();

	// fade helpers: prefer WebAudio gain if available, otherwise fall back to element.volume ramps
	function fadeInAudio(el, durationMs) {
		durationMs = durationMs || 600;
		try {
			var actx = el._actx;
			var gainNode = el._gainNode;
			if (actx && gainNode) {
				if (actx.state === 'suspended') actx.resume().catch(function () { });
				var now = actx.currentTime;
				gainNode.gain.cancelScheduledValues(now);
				gainNode.gain.setValueAtTime(0.0, now);
				// start playback immediately with gain at 0
				el.play().catch(function () { });
				gainNode.gain.linearRampToValueAtTime(1.0, now + (durationMs / 1000));
				return;
			}
		} catch (e) { }
		// fallback to element.volume ramp
		try {
			el.volume = 0;
			el.play().catch(function () { });
			var step = 30; // ms
			var inc = step / Math.max(1, durationMs);
			var iv = setInterval(function () {
				el.volume = Math.min(1, el.volume + inc);
				if (el.volume >= 0.999) { el.volume = 1; clearInterval(iv); }
			}, step);
		} catch (e) { }
	}

	function fadeOutAudio(el, durationMs) {
		durationMs = durationMs || 500;
		try {
			var actx = el._actx;
			var gainNode = el._gainNode;
			if (actx && gainNode) {
				var now = actx.currentTime;
				gainNode.gain.cancelScheduledValues(now);
				gainNode.gain.setValueAtTime(gainNode.gain.value || 1.0, now);
				gainNode.gain.linearRampToValueAtTime(0.0, now + (durationMs / 1000));
				// pause after ramp completes (small buffer)
				setTimeout(function () { try { el.pause(); } catch (e) { } }, durationMs + 50);
				return;
			}
		} catch (e) { }
		// fallback to element.volume ramp
		try {
			var step = 30; // ms
			var dec = step / Math.max(1, durationMs);
			var iv2 = setInterval(function () {
				el.volume = Math.max(0, el.volume - dec);
				if (el.volume <= 0.001) { try { el.pause(); } catch (e) { } el.volume = 1; clearInterval(iv2); }
			}, step);
		} catch (e) { }
	}

	$chillToggleBtn.on('click', function (e) {
		e.preventDefault();
		e.stopPropagation();
		if (!$chillAudioEl.length) return;
		var audio = $chillAudioEl[0];
		if (audio.paused) {
			fadeInAudio(audio, 600);
			$chillToggleBtn.addClass('playing');
		} else {
			fadeOutAudio(audio, 500);
			$chillToggleBtn.removeClass('playing');
		}
	});

	// Next-track button: skip to the next track in the chill queue and start playback
	var $chillNextBtn = $('#chill-next-track');
	$chillNextBtn.on('click', function (e) {
		e.preventDefault();
		e.stopPropagation();
		if (!$chillAudioEl.length) return;
		var audio = $chillAudioEl[0];
		try {
			if (audio.playNextChill) {
				audio.playNextChill();
				$chillToggleBtn.addClass('playing');
			} else {
				// fallback: just play (no playlist available)
				audio.play().catch(function () { });
				$chillToggleBtn.addClass('playing');
			}
		} catch (err) { }
	});

	// Chill exit/close button: stop audio and return to main
	$('#chill-exit').on('click', function (e) {
		e.preventDefault();
		e.stopPropagation();
		// Pause audio if present
		var ca = $('#chill-audio');
		if (ca.length) {
			try { ca[0].pause(); } catch (err) { }
		}
		$('#chill-audio-toggle').removeClass('playing');
		// Hide chill / go back to main
		$main._hide(true);
	});

	// Events.
	$body.on('click', function (event) {

		// If Chill background is active/in-transition, ignore clicks so Chill stays open.
		if ($body.hasClass('chill-bg-focus') || $body.hasClass('chill-bg-fadeout') || $body.hasClass('chill-restore'))
			return;

		// Article visible? Hide.
		if ($body.hasClass('is-article-visible'))
			$main._hide(true);

	});

	$window.on('keyup', function (event) {

		switch (event.keyCode) {

			case 27:

				// Article visible? Hide.
				if ($body.hasClass('is-article-visible'))
					$main._hide(true);

				break;

			default:
				break;

		}

	});

	$window.on('hashchange', function (event) {

		// Empty hash?
		if (location.hash == ''
			|| location.hash == '#') {

			// Prevent default.
			event.preventDefault();
			event.stopPropagation();

			// Hide.
			$main._hide();

		}

		// Otherwise, check for a matching article.
		else if ($main_articles.filter(location.hash).length > 0) {

			// Prevent default.
			event.preventDefault();
			event.stopPropagation();

			// Show article.
			$main._show(location.hash.substr(1));

		}

	});

	// Scroll restoration.
	// This prevents the page from scrolling back to the top on a hashchange.
	if ('scrollRestoration' in history)
		history.scrollRestoration = 'manual';
	else {

		var oldScrollPos = 0,
			scrollPos = 0,
			$htmlbody = $('html,body');

		$window
			.on('scroll', function () {

				oldScrollPos = scrollPos;
				scrollPos = $htmlbody.scrollTop();

			})
			.on('hashchange', function () {
				$window.scrollTop(oldScrollPos);
			});

	}

	// Initialize.

	// Hide main, articles.
	$main.hide();
	$main_articles.hide();
	// Ensure chill audio toggle and next button are hidden by default until Chill is entered
	$('#chill-audio-toggle').hide();
	$('#chill-next-track').hide();

	// Initial article.
	if (location.hash != ''
		&& location.hash != '#')
		$window.on('load', function () {
			$main._show(location.hash.substr(1), true);
		});

})(jQuery);