import * as utilities from "./utils.js";

export const createAutoComplete = function ({
  root,
  renderOption,
  onOptionSelect,
  inputValue,
  fetchData,
}) {
  root.insertAdjacentHTML(
    "afterbegin",
    `
    <label><b>Search:</b></label>
    <input class="input"/>
    <div class="dropdown">
    <div class="dropdown-menu">
      <div class="results"></div>
    </div>
    </div>
    `
  );

  const input = root.querySelector(".input");
  const dropDown = root.querySelector(".dropdown");
  const results = root.querySelector(".results");

  const onInput = async (event) => {
    const items = await fetchData(event.target.value);

    if (!items.length) {
      dropDown.classList.remove("is-active");
      return;
    }

    results.innerHTML = "";
    dropDown.classList.add("is-active");

    items.map((item) => {
      const option = document.createElement("a");

      option.classList.add("dropdown-item");
      option.insertAdjacentHTML("afterbegin", renderOption(item));
      option.addEventListener("click", function () {
        dropDown.classList.remove("is-active");
        input.value = inputValue(item);
        onOptionSelect(item);
      });

      results.appendChild(option);
    });
  };

  input.addEventListener("input", utilities.debounce(onInput, 800));

  document.addEventListener("click", function (event) {
    if (!root.contains(event.target)) {
      results.innerHTML = "";
      dropDown.classList.remove("is-active");
    }
  });
};
