import "regenerator-runtime/runtime";
import "core-js/stable";

import * as autocomplete from "./autocomplete.js";

const autocompleteConfig = {
  renderOption(movie) {
    const imgSrc = movie.Poster === "N/A" ? "" : movie.Poster;
    return `
    <img src="${imgSrc}" />

    <span>${movie.Title} (${movie.Year})</span>
    `;
  },

  inputValue(movie) {
    return movie.Title;
  },

  async fetchData(searchTerm) {
    const resp = await fetch(
      `https://www.omdbapi.com/?apikey=4f064761&s=${searchTerm}`
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
    `https://www.omdbapi.com/?apikey=4f064761&i=${movie.imdbID}`
  );
  let data = await resp.json();
  document.querySelector(element).innerHTML = itemMarkup(data);
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
  const leftStats = document.querySelectorAll(
    "#left-summary .item-info article"
  );
  const rightStats = document.querySelectorAll(
    "#right-summary .item-info article"
  );

  leftStats.forEach((leftStat, index) => {
    const rightStat = rightStats[index];

    const leftValue = leftStat.dataset.value;
    const rightValue = rightStat.dataset.value;

    if (rightValue > leftValue) {
      rightStat.classList.add("item-winner");
      leftStat.classList.add("item-looser");
    } else {
      leftStat.classList.add("item-winner");
      rightStat.classList.add("item-looser");
    }
  });
};

const itemMarkup = function (itemDetail) {
  const dollars = parseInt(
    itemDetail.BoxOffice.replace(/\$/g, "").replace(/,/g, "")
  );
  const metascore = parseInt(itemDetail.Metascore);
  const imdbRating = parseFloat(itemDetail.imdbRating);
  const imdbVotes = parseInt(itemDetail.imdbVotes.replace(/,/g, ""));
  const awards = itemDetail.Awards.split(" ").reduce((prev, word) => {
    const value = parseInt(word);
    if (isNaN(value)) {
      return prev;
    } else {
      return prev + value;
    }
  }, 0);

  return `
<article class="item">
<figure class="item-left">
<img src="${itemDetail.Poster}" />
</figure>
<figure class="item-right">
<h1>${itemDetail.Title}</h1>
<h4>${itemDetail.Genre}</h4>
<p>${itemDetail.Plot}</p>
</figure>
</article>
<div class="item-info mar-t">
<article data-value="${awards}">
<p class="title">${itemDetail.Awards}</p>
<p class="subtitle">Awards</p>
</article>
<article data-value="${dollars}">
<p class="title">${itemDetail.BoxOffice}</p>
<p class="subtitle">Box Office</p>
</article>
<article data-value="${metascore}">
<p class="title">${itemDetail.Metascore}</p>
<p class="subtitle">Meta Score</p>
</article>
<article  data-value="${imdbRating}">
<p class="title">${itemDetail.imdbRating}</p>
<p class="subtitle">IMDB Rating</p>
</article>
<article data-value="${imdbVotes}">
<p class="title">${itemDetail.imdbVotes}</p>
<p class="subtitle">IMDB Votes</p>
</article>
</div>
`;
};
