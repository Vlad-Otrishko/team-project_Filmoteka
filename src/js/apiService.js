export default class ApiService {
  constructor() {
    this.query = '';
    this.page = 1;
    this.searchIndex = 0;
    this.totalResultsFound = 0;
    this.totalPagesFound = 0;
    this.key = '47af3f3eb3cebf089eb55cbdac9542a5';
    this.moviesUrls = [];
  }

  defineUrls(language) {
    // метод задает массив из 4 url - для разных вариантов запроса - популярное, по слову, по ИД, по жанру
    this.moviesUrls = [
      `https://api.themoviedb.org/3/trending/movie/day?api_key=${this.key}&language=${language}&page=${this.page}&include_adult=false`,
      `https://api.themoviedb.org/3/search/movie?api_key=${this.key}&language=${language}&query=${this.query}&page=${this.page}&include_adult=false`,
      `https://api.themoviedb.org/3/movie/${this.query}?api_key=${this.key}&language=${language}&page=${this.page}&include_adult=false`,
      `https://api.themoviedb.org/3/discover/movie?api_key=${this.key}&language=${language}&with_genres=${this.query}&page=${this.page}`,
    ];
  }

  searchMovies() {
    this.defineUrls(localStorage.getItem('language') || 'en-US');
    let url = this.moviesUrls[this.searchIndex];

    return fetch(url)
      .then(response => response.json())
      .then(res => {
        if (this.searchIndex !== 2) localStorage.setItem('LastSearchIndex', this.searchIndex);
        localStorage.setItem('LastQuery', this.query);
        this.totalResultsFound = res.total_results;
        localStorage.setItem('TotalFound', JSON.stringify(res.total_results));
         //возможно, понадобится для пагинации
        this.totalPagesFound = res.total_pages;
        return res;
      })
      .catch(err => console.log(err));
  }

  searchGenres() {
    //тут жестко заданный url, т.к. подгрузка жанров осуществляется без запросов пользователя, один раз,в самом начале работы

    const language = localStorage.getItem('language') || 'en-US';
    return fetch(
      `https://api.themoviedb.org/3/genre/movie/list?api_key=${this.key}&language=${language}`,
    )
      .then(response => response.json())
      .then(res => {
        return res;
      })
      .then(data => localStorage.setItem('Genres', JSON.stringify(data.genres)))
      .catch(err => console.log(err));
  }

  searchTrailer() {
    const language = localStorage.getItem('language') || 'en-US';
    return fetch(
      `https://api.themoviedb.org/3/movie/${this.query}/videos?&api_key=${this.key}&language=${language}&page=${this.page}&include_adult=false`,
    )
      .then(response => response.json())
      .then(res => {
        return res;
      })
      .catch(err => console.warn(err));
  }

  searchReset() {
    this.page = 1;
    this.searchIndex = 0;
    localStorage.setItem('LastSearchIndex', 0);
    localStorage.setItem('LastQuery', '');
    localStorage.setItem('LastPage',1);
    this.totalResultsFound = 0;
    this.totalPagesFound = 0;
  }

  set searchRequest(newRequest) {
    this.query = newRequest;
  }

  set searchType(index) {
    this.searchIndex = index;
  }

  set pageNumber(newPageNumber) {
    //это для пагинации, установка номера страницы
    this.page = newPageNumber;
    localStorage.setItem('LastPage', this.page)
  }
}
// В зависимости от типа запроса, указываем apiService.searchType = 0 - для поиска "популярных"
//  apiService.searchType = 1 - для поиска по словам
//  apiService.serchType =2 - для поиска по конкретному ID
