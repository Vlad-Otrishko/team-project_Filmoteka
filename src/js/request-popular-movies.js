// import moviesList from '../templates/main-cards.hbs';
// import menuTemplate from '../templates/genres-menu.hbs';
import ApiService from './apiService.js';
import objectTransformations from './objectTransformations.js';
import Loader from './loader.js';
import resetRender from './resetRender';


const { renderMoviesList, clearGalleryContainer } = resetRender;

const changeLoader = new Loader('.loader');
const finder = new ApiService();
finder.searchType = 0;

finder.searchGenres();

export function popularMovies() {
  changeLoader.addLoader();
  clearGalleryContainer();
  finder.searchReset();

  finder
    .searchMovies()
    .then(res => {
      if (res.total_results > 20000) {
        pagination.reset(20000);
      } else {
        pagination.reset(res.total_results);
      }
      return res;
    })
    .then(({ results }) => {
      return objectTransformations(results);
    })
    .then(data => {
      renderMoviesList(data);
      changeLoader.clearLoader();
      return data;
    })
    .then(data => {
      // localStorage.setItem('Popular', JSON.stringify(data));
      localStorage.setItem('LastSearchResults', JSON.stringify(data));
      return data;
    })
    .catch(err => console.warn(err));
}

popularMovies();
