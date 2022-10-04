import ApiService from './apiService.js';
import createGenresMenu from './request-genres';
import resetRender from './resetRender';
import Loader from './loader.js';
import objectTransformations from './objectTransformations.js';


const genresMenuRef = document.querySelector('#genre');
const { renderMoviesList, clearGalleryContainer } = resetRender;
const changeLoader = new Loader('.loader');


const newApiService = new ApiService();

const refs = {
  switchBtn: document.getElementById('language-switch-toggle'),
  // header
  homeBtn: document.getElementById('btn-home'),
  libraryBtn: document.getElementById('btn-library'),
  input: document.querySelector('.search__input'),
  inputGenresLabel: document.querySelector('.select-wrapper'),
  watchedBtn: document.getElementById('liberary').firstElementChild,
  queueBtn: document.getElementById('liberary').lastElementChild,
  // footer
  footerFirstText: document.getElementById('footer__first-text'),
  footerSecondText: document.querySelector('.footer__second-text'),
  footerThirdText: document.getElementById('footer__third-text'),
  footerTeamText: document.querySelector('#open_taem'),
};
refs.switchBtn.checked = Boolean(localStorage.getItem('language')); // Задаем кнопке сохраненное ранее значение

if (!refs.switchBtn.checked) {
  translateToEnglish();
} //Если "Выкл"
if (refs.switchBtn.checked) {
  translateToRussian();
} // Если "Вкл"

refs.switchBtn.addEventListener('click', changeLanguage);

function changeLanguage(event) {
  if (!event.target.checked) {
    localStorage.setItem('language', '');
    translateToEnglish();
  }

  if (event.target.checked) {
    localStorage.setItem('language', 'ru');
    translateToRussian();
  }
}
function displayChanges() {
  genresMenuRef.innerHTML = '';
  newApiService.searchGenres().then(() => createGenresMenu());

  changeLoader.addLoader();
  clearGalleryContainer();

  newApiService.searchType = localStorage.getItem('LastSearchIndex');
  newApiService.searchRequest = localStorage.getItem('LastQuery');
  newApiService.pageNumber = localStorage.getItem('LastPage');
  newApiService
    .searchMovies()
    .then(({ results }) => {
      if (newApiService.searchType === 0 && results.total_results > 20000) {
        pagination.reset(20000);
      } else if (results.total_results > 10000) {
        pagination.reset(10000);
      } else {
        pagination.reset(results.total_results);
      }
      pagination.movePageTo(localStorage.getItem('LastPage'));
      return objectTransformations(results);
    })
    .then(data => {
      localStorage.setItem('LastSearchResults', JSON.stringify(data));
      renderMoviesList(data);
      changeLoader.clearLoader();
    })
    .catch(err => console.warn(err));
}

function translateToEnglish() {
  // genresMenuRef.innerHTML = '';
  // newApiService.searchGenres().then(() => createGenresMenu());
  displayChanges();

  refs.homeBtn.textContent = 'home';
  refs.libraryBtn.textContent = 'my library';
  refs.input.placeholder = 'Movie search...';
  refs.inputGenresLabel.firstChild.textContent = 'Search by ';
  refs.watchedBtn.textContent = 'Watched';
  refs.queueBtn.textContent = 'Queue';
  refs.footerFirstText.textContent = ' All Rights Reserved |';
  refs.footerSecondText.textContent = 'Developed with';
  refs.footerThirdText.textContent = 'by';
  refs.footerTeamText.textContent = 'GoIT Students';
}

function translateToRussian() {
  // genresMenuRef.innerHTML = '';
  // newApiService.searchGenres().then(() => createGenresMenu());
    displayChanges();


  refs.homeBtn.textContent = 'главная';
  refs.libraryBtn.textContent = 'моя библиотека';
  refs.input.placeholder = 'Поиск фильмов...';
  refs.inputGenresLabel.firstChild.textContent = 'Поиск по ';
  refs.watchedBtn.textContent = 'просмотренные';
  refs.queueBtn.textContent = 'в очереди';
  refs.footerFirstText.textContent = ' Все права защищены |';
  refs.footerSecondText.textContent = 'Разработано с';
  refs.footerThirdText.textContent = '';
  refs.footerTeamText.textContent = 'студентами GoIT';
}
