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
		var slider, clicked = 0, w, h;
		var overlay = img; // overlay element (the one with class img-comp-overlay)
		var container = overlay.parentElement;

		/* Get the width and height of the container element */
		w = container.offsetWidth;
		h = container.offsetHeight;

		/* Ensure overlay covers the container and will be clipped rather than resized */
		overlay.style.position = 'absolute';
		overlay.style.top = '0';
		overlay.style.left = '0';
		overlay.style.width = '100%';
		overlay.style.height = '100%';
		overlay.style.overflow = 'hidden';

		/* Initial clip: hide the right half */
		overlay.style.clipPath = 'inset(0 ' + (w / 2) + 'px 0 0)';
		overlay.style.webkitClipPath = 'inset(0 ' + (w / 2) + 'px 0 0)';

		/* Create slider: */
		slider = document.createElement("DIV");
		slider.setAttribute("class", "img-comp-slider");
		/* Insert slider */
		container.insertBefore(slider, overlay);
		/* Position the slider in the middle: */
		slider.style.top = (h / 2) - (slider.offsetHeight / 2) + "px";
		slider.style.left = (w / 2) - (slider.offsetWidth / 2) + "px";

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
				setTimeout(function () { $body.addClass('chill-bg-focus'); }, 200);
			} else {
				// Show main, article.
				$main.show();
				$article.show();
				// hide chill audio toggle when not in Chill
				$('#chill-audio-toggle').hide();
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

	$chillToggleBtn.on('click', function (e) {
		e.preventDefault();
		e.stopPropagation();
		if (!$chillAudioEl.length) return;
		var audio = $chillAudioEl[0];
		if (audio.paused) {
			audio.play().catch(function () { });
			$chillToggleBtn.addClass('playing');
		} else {
			audio.pause();
			$chillToggleBtn.removeClass('playing');
		}
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
	// Ensure chill audio toggle is hidden by default until Chill is entered
	$('#chill-audio-toggle').hide();

	// Initial article.
	if (location.hash != ''
		&& location.hash != '#')
		$window.on('load', function () {
			$main._show(location.hash.substr(1), true);
		});

})(jQuery);