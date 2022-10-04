import ApiService from './apiService';
import Pagination from 'tui-pagination';
// import moviesList from '../templates/main-cards.hbs';
import objectTransformations from './objectTransformations.js';
import resetRender from './resetRender';

const { renderMoviesList, clearGalleryContainer } = resetRender;
const finder = new ApiService();
// const container = document.getElementById('tui-pagination-container');

let visiblePages =
  document.documentElement.clientWidth > 767 ? 7 : 2;

 const options = {
  totalItems: undefined,
  itemsPerPage: 20,
  visiblePages,
  page: 1,
  centerAlign: false,
  firstItemClassName: 'tui-first-child',
  lastItemClassName: 'tui-last-child',
  template: {
    page: '<a href="#" class="tui-page-btn">{{page}}</a>',
    currentPage: '<strong class="tui-page-btn tui-is-selected">{{page}}</strong>',
    moveButton:
      '<a href="#" class="tui-page-btn tui-{{type}}">' +
      '<span class="tui-ico-{{type}}">{{type}}</span>' +
      '</a>',
    disabledMoveButton:
      '<span class="tui-page-btn tui-is-disabled tui-{{type}}">' +
      '<span class="tui-ico-{{type}}">{{type}}</span>' +
      '</span>',
    moreButton:
      '<a href="#" class="tui-page-btn tui-{{type}}-is-ellip">' +
      '<span class="tui-ico-ellip">...</span>' +
      '</a>',
  },
};

options.totalItems = localStorage.getItem('TotalFound') || 20000;

window.pagination = new Pagination('tui-pagination-container', options);//,options
// console.dir(container);

const container = document.getElementById('tui-pagination-container');


//__________________________________________________________________________________________
container.addEventListener('click', onClick);
function onClick(e) {
  onPagination(pagination.getCurrentPage());
}

function onPagination(pageNumber) {
  finder.pageNumber = pageNumber;
  finder.searchType = localStorage.getItem('LastSearchIndex');
  finder.searchRequest = localStorage.getItem('LastQuery');

  finder
    .searchMovies()
    .then(res => {
      if (res.total_results > 10000) { pagination.reset(10000) }
      else { pagination.reset(res.total_results); }
      pagination.movePageTo(pageNumber);
      return res;
    })
    .then(({ results }) => {
      return objectTransformations(results);
    })
    .then(data => {
      renderMoviesList(data);
      window.scrollTo(0, 230);
      return data;
    })
    .then(data => localStorage.setItem('LastSearchResults', JSON.stringify(data)))
    .catch(err => console.warn(err));
}

// ========= resetPage ============
const searchForm = document.getElementById('search-form');
const logoBtn = document.getElementById('logo-home');
const homeBtn = document.getElementById('btn-home');

searchForm.addEventListener('input', resetPage);
logoBtn.addEventListener('click', resetPage);
homeBtn.addEventListener('click', resetPage);

function resetPage() {
  pagination.reset();
};
