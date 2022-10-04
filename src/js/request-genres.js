// import moviesList from '../templates/main-cards.hbs';
import { Pagination } from 'tui-pagination';
import menuTemplate from '../templates/genres-menu.hbs';
import ApiService from './apiService.js';
import Loader from './loader.js';
import objectTransformations from './objectTransformations.js';
import resetRender from './resetRender';

const { renderMoviesList, clearGalleryContainer } = resetRender;
const genresMenuRef = document.querySelector('#genre');
const searchForm = document.getElementById('search-form');

const finder = new ApiService();
const changeLoader = new Loader('.loader');
createGenresMenu();


export function genrelanguageSelection() {
  let langdata;
  switch (localStorage.getItem('language')) {
    case 'ru': langdata = { id: 'none', name: 'жанрам' }; break;
    default: langdata = { id: 'none', name: 'genres' };
  }
       return langdata;
}

export default function createGenresMenu() {
  const genresArray = JSON.parse(localStorage.getItem('Genres'));
  genresArray.unshift(genrelanguageSelection());
  genresMenuRef.insertAdjacentHTML('beforeend', menuTemplate(genresArray));
}

genresMenuRef.addEventListener('input', onInput);

function onInput(event) {
  event.preventDefault();
  changeLoader.addLoader();
  clearGalleryContainer();
  searchForm.firstElementChild.reset();

  if (event.target[event.target.selectedIndex].value === '') {
    renderMoviesList(JSON.parse(localStorage.getItem('LastSearchResults')));
    changeLoader.clearLoader();
    return;
  }

  finder.searchType = 3;
  finder.searchRequest = event.target[event.target.selectedIndex].value;
  finder
    .searchMovies()
    .then(({ results }) => {
      if (results.total_results > 10000) {
        pagination.reset(10000);
      }
      else { pagination.reset(results.total_results); }
      pagination.movePageTo(1);
      return objectTransformations(results);
    })
    .then(data => {
      localStorage.setItem('LastSearchResults', JSON.stringify(data));
      renderMoviesList(data);
      changeLoader.clearLoader();
    })
    .catch(err => console.warn(err));
}
