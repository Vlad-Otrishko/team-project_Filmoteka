import moviesCard from '../templates/modal-movie.hbs';
import moviesCardRu from '../templates/modal-movie-ru.hbs';
import ApiService from './apiService.js';
import mainCards from '../templates/main-cards.hbs';
import { trailerRun } from './trailer';

const refs = {
  galleryList: document.getElementById('gallery'),
  modalWindow: document.querySelector('#modal-window'),
  btnLibrary: document.getElementById('btn-library'),
  library: document.getElementById('liberary'),
  errors: document.getElementById('errors'),
  body: document.querySelector('body'),
  switchBtn: document.getElementById('language-switch-toggle'),
};
const finder = new ApiService();
let tempContainerLastQuery = null; // переменная для временного хранения значения LastQuery из LocalStorage

refs.galleryList.addEventListener('click', onSearchID);

function onSearchID(e) {
  if (e.target.nodeName === 'UL') {
    return;
  }
  tempContainerLastQuery = localStorage.getItem('LastQuery'); // записали последнее значения LastQuery
  finder.searchRequest = e.target.parentNode.id;
  finder.searchType = 2;
  finder
    .searchMovies()
    .then(data => {
      if (!refs.switchBtn.checked) {
        refs.modalWindow.innerHTML = moviesCard(data);
      } //Если "Выкл"
      if (refs.switchBtn.checked) {
        refs.modalWindow.innerHTML = moviesCardRu(data);
      } // Если "Вкл"

      openModalWindow();

      const watchBtn = document.querySelector('.btn__watch');
      const queueBtn = document.querySelector('.btn__queue');
      const trailerBtn = document.querySelector('#trailer');

      const popularFilm = JSON.parse(localStorage.getItem('LastSearchResults'));
      const arrayPopFilm = localStorage.getItem('watched');
      const arrayPopFilmQ = localStorage.getItem('queue');

      // ================= начало работы кнопки Add to watched =================
      getIncludesFilms(e.target.parentNode.id); // проверяем текст-контент кнопки
      watchBtn.addEventListener('click', onWatch); // добавили слушателя на кнопку

      function getIncludesFilms(id) {
        // если фильм есть в библиотеке, кнопка -> delete
        if (arrayPopFilm.includes(id)) {
          doContentBtnDelete(watchBtn);
        }
        // если нет, то кнопка -> add
        if (!arrayPopFilm.includes(id)) {
          doContentBtnAdd(watchBtn);
        }
      }

      function onWatch(event) {
        // удаления карточки из библиотеки
        if (
          event.target.innerHTML === 'Delete from watched' ||
          event.target.innerHTML === 'Удалить из просмотренных'
        ) {
          deleteFromWatched(event);

        } else {
          // добавление карточки в библиотеку
          addToWatched(event);
        }

        // ререндер списка карточек в библиотеке, если открытая модалка
        updateDisplayedLibrary('watched');
      }

      // - подмена текст-контента кнопок в зависимости от выбраного языка -
      function doContentBtnAdd(button) {
        if (!refs.switchBtn.checked) {
          button.textContent = 'Add to watched';
        } //Если "Выкл"
        if (refs.switchBtn.checked) {
          button.textContent = 'Добавить в просмотренные';
        } // Если "Вкл"
      }

      function doContentBtnDelete(button) {
        if (!refs.switchBtn.checked) {
          button.textContent = 'Delete from watched';
        } //Если "Выкл"
        if (refs.switchBtn.checked) {
          button.textContent = 'Удалить из просмотренных';
        } // Если "Вкл"
      }

      function addToWatched(event) {
        const filteredFilm = popularFilm.filter(film => {
          if (+film.id === +event.target.dataset.id) {
            return film;
          }
        });

        var a = [];
        a = JSON.parse(localStorage.getItem('watched')) || [];
        a.push(filteredFilm[0]);

        localStorage.setItem('watched', JSON.stringify(a));
        if (JSON.parse(localStorage.getItem('queue')) //при добавлении в "просмотренные" удалаем фильм из "очереди",если он там был 
          .map(el => el.id).includes(filteredFilm[0].id)) {
          deleteFromQueue(event);
        };
        updateDisplayedLibrary('queue');//"визуальное" уделение фильма из очереди
          doContentBtnDelete(watchBtn);
       }

      function deleteFromWatched(event) {
        const arrObjectWatch = JSON.parse(localStorage.getItem('watched'));
        let indx = null;

        for (let i = 0; i < arrObjectWatch.length; i += 1) {
          if (+arrObjectWatch[i].id === +event.target.dataset.id) {
            indx = i;
          }
        }

        arrObjectWatch.splice(indx, 1);
        localStorage.setItem('watched', JSON.stringify(arrObjectWatch));
        doContentBtnAdd(watchBtn);
      }
      // ================= конец работы кнопки watched =================

      // ================= начало работы кнопки Add to queue =================
      getIncludesFilmsQ(e.target.parentNode.id); // проверяем текст-контент кнопки
      queueBtn.addEventListener('click', onQueue); // добавили слушателя на кнопку

      function getIncludesFilmsQ(id) {
        if (arrayPopFilmQ.includes(id)) {
          doContentBtnDeleteQueue(queueBtn); // queueBtn.textContent = 'Delete from queue';
        }

        if (!arrayPopFilmQ.includes(id)) {
          doContentBtnAddQueue(queueBtn); // queueBtn.textContent = 'Add to queue';
        }
      }

      function onQueue(event) {
        // удаления карточки из библиотеки
        if (
          event.target.innerHTML === 'Delete from queue' ||
          event.target.innerHTML === 'Удалить из очереди'
        ) {
          deleteFromQueue(event);
        } else {
          // добавление карточки в библиотеку
          addToQueue(event);
        }

        // ререндер списка карточек в библиотеке, если открытая модалка
        updateDisplayedLibrary('queue');
      }
      // - подмена текст-контента кнопок в зависимости от выбраного языка -
      function doContentBtnAddQueue(button) {
        if (!refs.switchBtn.checked) {
          button.textContent = 'Add to queue';
        } //Если "Выкл"
        if (refs.switchBtn.checked) {
          button.textContent = 'Добавить в очередь';
        } // Если "Вкл"
      }

      function doContentBtnDeleteQueue(button) {
        if (!refs.switchBtn.checked) {
          button.textContent = 'Delete from queue';
        } //Если "Выкл"
        if (refs.switchBtn.checked) {
          button.textContent = 'Удалить из очереди';
        } // Если "Вкл"
      }
      function addToQueue(event) {
        const filteredFilm = popularFilm.filter(film => {
          if (+film.id === +event.target.dataset.id) {
            return film;
          }
        });
        let a = [];
        a = JSON.parse(localStorage.getItem('queue')) || [];
        a.push(filteredFilm[0]);

        localStorage.setItem('queue', JSON.stringify(a));
        doContentBtnDeleteQueue(queueBtn); // queueBtn.textContent = 'Delete from queue';
      }

      function deleteFromQueue(event) {
        const arrObjectQueue = JSON.parse(localStorage.getItem('queue'));
        let indx = null;

        for (let i = 0; i < arrObjectQueue.length; i += 1) {
          if (+arrObjectQueue[i].id === +event.target.dataset.id) {
            indx = i;
          }
        }
        arrObjectQueue.splice(indx, 1);
        localStorage.setItem('queue', JSON.stringify(arrObjectQueue));
        doContentBtnAddQueue(queueBtn); // queueBtn.textContent = 'Add to queue';
      }
      // ================= конец работы кнопки  queue=================
      //================== функция для обновления отображамого содержимого библиотеки====
      function updateDisplayedLibrary(currentLibrary) {
        let selector = undefined;
        switch (currentLibrary) {
          case 'watched': selector = refs.library.firstElementChild; break;
          case 'queue': selector = refs.library.lastElementChild; break;
            default: selector = undefined;
        }
        if (
          refs.btnLibrary.classList.contains('navigation__btn-current') &&
          selector.classList.contains('liberary__btn-current')
        ) {
          renderCardsList(JSON.parse(localStorage.getItem(currentLibrary)));
        }
      }

      // ================= начало работы кнопки trailer ==================
      trailerBtn.addEventListener('click', onStartWatch);
      function onStartWatch(e) {
        document.querySelector('.modal__container').classList.add('hidden');
        trailerRun();
      }
      // ==================== конец работы кнопки trailer ==================
    })
    .catch(err => console.warn(err));
}

// ==================== Управление модалкой ====================
function openModalWindow() {
  setTimeout(function () {
    refs.modalWindow.classList.add('is-open');
  }, 150); //показали модалку ()== ТАЙМАУТ для красивого открытия (Яша)
  document.querySelector('.close__button').addEventListener('click', closeModalWindow);
  refs.modalWindow.addEventListener('click', onControlClick);
  window.addEventListener('keydown', onControlKey);
  refs.body.style.overflow = 'hidden';
}

function onControlClick(event) {
  if (event.target.classList.value === 'modal__backdrop') {
    closeModalWindow();
  }
  return;
}

function onControlKey(event) {
  if (refs.modalWindow.classList.value.includes('is-open')) {
    if (event.keyCode === 27) {
      closeModalWindow();
    }
  }
}

function closeModalWindow() {
  refs.modalWindow.classList.remove('is-open');
  setTimeout(function () {
    document.querySelector('.image').src = '';
  }, 150); // Испарвил баг, когда закрывалась подалка на долю секунды картинка прыгала
  refs.body.style.overflow = '';
  document.querySelector('.frame__container').innerHTML = '';
  localStorage.setItem('LastQuery', tempContainerLastQuery);
}

// ============== Рендер списка карточек в библиотеках ==============
function renderCardsList(movie) {
  if (movie.length === 0) {
    refs.errors.lastElementChild.classList.remove('hidden');
  }
  refs.galleryList.innerHTML = mainCards(movie);
}

// ADD TO WATCHED
