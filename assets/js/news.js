(() => {
  const debounce = (fn, wait = 160) => {
    let timer;
    return (...args) => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => fn(...args), wait);
    };
  };

  const normalize = (value) => String(value || "").toLowerCase().trim();

  const initListing = (listing) => {
    const form = listing.querySelector("[data-news-filter]");
    const list = listing.querySelector("[data-news-list]");
    const empty = listing.querySelector("[data-news-empty]");
    const count = listing.querySelector("[data-news-count]");
    const loadMore = listing.querySelector("[data-news-load-more]");
    const reset = listing.querySelector("[data-news-reset]");
    const search = listing.querySelector("[data-news-search]");
    const category = listing.querySelector("[data-news-category]");
    const source = listing.querySelector("[data-news-source]");
    const sort = listing.querySelector("[data-news-sort]");

    if (!form || !list) return;

    const allItems = Array.from(list.querySelectorAll("[data-news-item]"));
    const initialCount = Number(listing.dataset.initialCount || 8);
    let visibleLimit = initialCount;

    const params = new URLSearchParams(window.location.search);
    if (form.dataset.newsSearchPage === "true" && params.get("q") && search) {
      search.value = params.get("q");
    }

    const apply = () => {
      const query = normalize(search?.value);
      const selectedCategory = category?.value || "all";
      const selectedSource = source?.value || "all";
      const selectedSort = sort?.value || "newest";

      let matches = allItems.filter((item) => {
        const haystack = normalize([
          item.dataset.title,
          item.dataset.excerpt,
          item.dataset.tags,
          item.dataset.category,
          item.dataset.source,
        ].join(" "));
        const categoryMatches = selectedCategory === "all" || item.dataset.category === selectedCategory;
        const sourceMatches = selectedSource === "all" || item.dataset.source === selectedSource;
        const queryMatches = !query || haystack.includes(query);
        return categoryMatches && sourceMatches && queryMatches;
      });

      matches.sort((a, b) => {
        if (selectedSort === "oldest") {
          return new Date(a.dataset.date) - new Date(b.dataset.date);
        }
        if (selectedSort === "featured") {
          return Number(b.dataset.priority || 0) - Number(a.dataset.priority || 0);
        }
        return new Date(b.dataset.date) - new Date(a.dataset.date);
      });

      matches.forEach((item) => list.appendChild(item));
      allItems.forEach((item) => {
        item.hidden = true;
      });

      matches.slice(0, visibleLimit).forEach((item) => {
        item.hidden = false;
      });

      if (empty) {
        empty.hidden = matches.length > 0;
      }

      if (count) {
        const shown = Math.min(visibleLimit, matches.length);
        count.textContent = matches.length
          ? `Showing ${shown} of ${matches.length} updates`
          : "No matching updates";
      }

      if (loadMore) {
        loadMore.hidden = visibleLimit >= matches.length;
      }
    };

    const resetLimitAndApply = () => {
      visibleLimit = initialCount;
      apply();
    };

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      resetLimitAndApply();

      if (form.dataset.newsSearchPage === "true") {
        const url = new URL(window.location.href);
        const query = search?.value?.trim();
        if (query) {
          url.searchParams.set("q", query);
        } else {
          url.searchParams.delete("q");
        }
        window.history.replaceState({}, "", url);
      }
    });

    search?.addEventListener("input", debounce(resetLimitAndApply));
    category?.addEventListener("change", resetLimitAndApply);
    source?.addEventListener("change", resetLimitAndApply);
    sort?.addEventListener("change", resetLimitAndApply);

    reset?.addEventListener("click", () => {
      if (search) search.value = "";
      if (category) category.value = "all";
      if (source) source.value = "all";
      if (sort) sort.value = "newest";
      if (form.dataset.newsSearchPage === "true") {
        window.history.replaceState({}, "", window.location.pathname);
      }
      resetLimitAndApply();
      search?.focus();
    });

    loadMore?.addEventListener("click", () => {
      visibleLimit += 6;
      apply();
    });

    apply();
  };

  document.querySelectorAll("[data-news-listing]").forEach(initListing);
})();