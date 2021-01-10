import * as autocomplete from "./autocomplete.js";

const autocompleteConfig = {
  renderOption(movie) {
    const imgSrc = movie.Poster === "N/A" ? "" : movie.Poster;
    return `
    <img src="${imgSrc}" />

    ${movie.Title} (${movie.Year})
    `;
  },

  inputValue(movie) {
    return movie.Title;
  },

  async fetchData(searchTerm) {
    const resp = await fetch(
      `http://www.omdbapi.com/?apikey=4f064761&s=${searchTerm}`
    );
    const data = await resp.json();
    if (data.Error) return [];
    return data.Search;
  },
};

autocomplete.createAutoComplete({
  ...autocompleteConfig,
  onOptionSelect(movie) {
    document.querySelector(".tutorial").classList.add("is-hidden");
    onMovieSelect(movie, "#left-summary", "left");
  },
  root: document.querySelector("#left-autocomplete"),
});

autocomplete.createAutoComplete({
  ...autocompleteConfig,
  onOptionSelect(movie) {
    document.querySelector(".tutorial").classList.add("is-hidden");
    onMovieSelect(movie, "#right-summary", "right");
  },
  root: document.querySelector("#right-autocomplete"),
});

let leftMovie;
let rightMovie;

const onMovieSelect = async function (movie, element, side) {
  const resp = await fetch(
    `http://www.omdbapi.com/?apikey=4f064761&i=${movie.imdbID}`
  );
  let data = await resp.json();
  document.querySelector(element).innerHTML = movieMarkup(data);
  if (side === "left") {
    leftMovie = data;
  } else {
    rightMovie = data;
  }

  if (leftMovie && rightMovie) {
    runComparison();
  }
};

const runComparison = function () {
  const leftStats = document.querySelectorAll("#left-summary .notification");
  const rightStats = document.querySelectorAll("#right-summary .notification");

  leftStats.forEach((leftStat, index) => {
    const rightStat = rightStats[index];

    const leftValue = leftStat.dataset.value;
    const rightValue = rightStat.dataset.value;

    console.log(rightValue, leftValue);

    if (rightValue > leftValue) {
      rightStat.classList.remove("is-primary");
      rightStat.classList.add("is-success");

      leftStat.classList.remove("is-primary");
      leftStat.classList.add("is-danger");
    } else {
      leftStat.classList.remove("is-primary");
      leftStat.classList.add("is-success");

      rightStat.classList.remove("is-primary");
      rightStat.classList.add("is-danger");
    }
  });
};

const movieMarkup = function (movieDetail) {
  const dollars = parseInt(
    movieDetail.BoxOffice.replace(/\$/g, "").replace(/,/g, "")
  );
  const metascore = parseInt(movieDetail.Metascore);
  const imdbRating = parseFloat(movieDetail.imdbRating);
  const imdbVotes = parseInt(movieDetail.imdbVotes.replace(/,/g, ""));
  const awards = movieDetail.Awards.split(" ").reduce((prev, word) => {
    const value = parseInt(word);
    if (isNaN(value)) {
      return prev;
    } else {
      return prev + value;
    }
  }, 0);

  return `
<article class="media">
<figure class="media-left">
<p class="image">
<img src="${movieDetail.Poster}" />
</p>
</figure>
<div class="media-content">
<div class="content">
<h1>${movieDetail.Title}</h1>
<h4>${movieDetail.Genre}</h4>
<p>${movieDetail.Plot}</p>
</div>
</div>
</article>
<article data-value="${awards}" class="notification is-primary">
<p class="title">${movieDetail.Awards}</p>
<p class="subtitle">Awards</p>
</article>
<article data-value="${dollars}" class="notification is-primary">
<p class="title">${movieDetail.BoxOffice}</p>
<p class="subtitle">Box Office</p>
</article>
<article data-value="${metascore}" class="notification is-primary">
<p class="title">${movieDetail.Metascore}</p>
<p class="subtitle">Meta Score</p>
</article>
<article  data-value="${imdbRating}" class="notification is-primary">
<p class="title">${movieDetail.imdbRating}</p>
<p class="subtitle">IMDB Rating</p>
</article>
<article data-value="${imdbVotes}" class="notification is-primary">
<p class="title">${movieDetail.imdbVotes}</p>
<p class="subtitle">IMDB Votes</p>
</article>
`;
};
