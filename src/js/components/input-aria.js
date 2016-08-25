// ᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏ
// ------  ACCESSIBILTY MODULE  ------
// ᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏ

// TODO:
// ACCESSIBILE RADIO https://www.w3.org/TR/wai-aria-practices/examples/radio/radio.html

/**
 * Toggle aria attributes &
 * keyboard access
 */

(function() {
  document.body.addEventListener('click', detectInputEvent);
  document.body.addEventListener('keydown', detectInputEvent);

  /**
   * @param {element} container —
   * input container
   */
  function toggleInputState(container) {
    var input = container.querySelector('input');
    var inputIsChecked = input.hasAttribute('checked');
    var inputIsBlocked = input.hasAttribute('disabled');
    if (!inputIsBlocked) {
      if (inputIsChecked) {
        input.removeAttribute('checked');
        container.setAttribute('aria-checked', false);
      } else {
        input.setAttribute('checked', true);
        container.setAttribute('aria-checked', true);
      }
    }
  }

  /**
   * @param {object} e —
   * event object
   */
  function detectInputEvent(e) {
    if (e.type === 'click' ||
       (e.type === 'keydown' && e.keyCode === 32)) {
      var target = e.target;
      while (target !== document.body) {
        if (target.classList.contains('js-checkbox')) {
          e.preventDefault();
          toggleInputState(target);
          return;
        }
        target = target.parentNode;
      }
    }
  }
})();
