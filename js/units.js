'use strict';

(function () {
  var unitsToggleList = document.getElementsByClassName('units__btn');

  for (var i = 0; i < unitsToggleList.length; i++) {
    unitsToggleList[i].addEventListener('click', function (evt) {
      evt.preventDefault();
      var parent = this.parentElement;
      var list = parent.querySelector('.units__sublist-hide');
      if (list) {
        list.classList.toggle('units__sublist');
      }
      // parent.classList.toggle('active');
    });
  }

})();
