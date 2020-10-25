'use strict';

(function () {
  var unitsToggleList = document.getElementsByClassName('units__btn');

  for (var i = 0; i < unitsToggleList.length; i++) {
    unitsToggleList[i].addEventListener('click', function (evt) {
      evt.preventDefault();
      var parent = this.parentElement;
      var list = parent.querySelector('.units__sublist');
      if (list) {
        list.classList.toggle('hidden');
      }
      parent.classList.toggle('active');
    });
  }

})();
