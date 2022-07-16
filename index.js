const UNSPLASH = "L2zLfnhSbAaYKMOnPsXBTgAzJ9mZMv5YcWDBYvgObVg";
const PEXELS = "563492ad6f91700001000001af5d93fda7494db1a99cf51cb0c1fa4e";
const PIXABAY = "28592329-c299fde86a306469f2bbfb404";

const radioBtns = document.getElementsByName("source");
const searchInput = document.getElementById("search__item");
const searchBtn = document.querySelector(".search__button");
const alertModal = document.querySelector(".custom__alert");
const backdrop = document.querySelector(".backdrop");
const imageContainer = document.querySelector(".image__container");
const goToTopBtn = document.querySelector(".fa-angles-up");
const showMore = document.querySelector(".show__more");
let siteChoice, query;
let pageNumber = 1;
let isEnd = false;

const authorisation = {
    method: "GET",
    headers: {
        Accept: "application/json",
        Authorization: PEXELS,
    },
};

const updateUI = (imageURL, photographer, hotlink, platform) => {
    document.body.style.justifyContent = "flex-start";
    document.querySelector(".fa-angles-up").classList.remove("hidden");
    const image = document.createElement("img");
    image.setAttribute("src", imageURL);
    image.setAttribute("title", `Photo by ${photographer} on ${platform}`);
    image.addEventListener("click", () => {
        window.open(hotlink, "_blank");
    });
    imageContainer.appendChild(image);
};

const errorMessageRenderer = (error) => {
    alertModal.innerHTML = " ";
    alertModal.innerHTML = `<h2>Oops!! Failed to fetch the images</h2>`;
    const errorMessage = document.createElement("h3");
    errorMessage.innerHTML = error.message;
    errorMessage.style.textAlign = "center";
    alertModal.appendChild(errorMessage);
};

const noResultFound = () => {
    showBackdrop();
    showAlertModal();
    alertModal.innerHTML = "";
    alertModal.innerHTML = `<h3 style="text-align:center">No results found 😟</h3>`;
};

const noMoreResults = () => {
    isEnd = true;
    showBackdrop();
    showAlertModal();
    alertModal.innerHTML = "";
    alertModal.innerHTML = `<h3 style="text-align:center">End of search results</h3>`;
    showMore.classList.add("hidden");
};

async function getImagesFromUnsplash(query) {
    let apiURL = `https://api.unsplash.com/search/photos/?client_id=${UNSPLASH}&query=${query}&per_page=15`;
    try {
        let data = await fetch(apiURL);
        if (!data.ok) {
            if (data.status == 403) {
                throw new Error(
                    `API rate limit exceeded, please try again later!!\n
                    (current maximum API rate limit is 50 / hour)`
                );
            }
        }
        let response = await data.json();
        let pageCount = response.total_pages;
        if (pageNumber <= pageCount) {
            apiURL = `https://api.unsplash.com/search/photos/?client_id=${UNSPLASH}&query=${query}&page=${pageNumber}&per_page=15`;
            pageNumber++;
            data = await fetch(apiURL);
            response = await data.json();
            response.results.forEach((photo) => {
                const imageURL = photo.urls.regular;
                const firstName = photo.user.first_name;
                const lastName = photo.user.last_name;
                const photographer = firstName + " " + lastName;
                const hotlink = photo.links.html;
                updateUI(imageURL, photographer, hotlink, "Unsplash");
            });
        } else {
            noMoreResults();
        }
    } catch (error) {
        showBackdrop();
        showAlertModal();
        errorMessageRenderer(error);
    }
}

async function getImagesFromPexels(query) {
    let apiURL = `https://api.pexels.com/v1/search?query=${query}&per_page=15`;
    try {
        let data = await fetch(apiURL, authorisation);
        if (!data.ok) {
            if (data.status == 429) {
                throw new Error(
                    `API rate limit exceeded, please try again later!!\n
                    (current maximum API rate limit is 200 / hour)`
                );
            }
        }
        let response = await data.json();
        let pageCount = Math.floor(response.total_results / 15);
        console.log(pageCount);
        if (pageNumber <= pageCount) {
            apiURL = `https://api.pexels.com/v1/search?query=${query}&page=${pageNumber}&per_page=15`;
            pageNumber++;
            data = await fetch(apiURL, authorisation);
            response = await data.json();
            if (response.total_results === 0) {
                noResultFound();
            }
            response.photos.forEach((photo) => {
                const imageURL = photo.src.large2x;
                const photographer = photo.photographer;
                const hotlink = photo.url;
                updateUI(imageURL, photographer, hotlink, "Pexels");
            });
        } else {
            noMoreResults();
        }
    } catch (error) {
        showBackdrop();
        showAlertModal();
        errorMessageRenderer(error);
    }
}

async function getImagesFromPixabay(query) {
    let apiURL = `https://pixabay.com/api/?key=${PIXABAY}&q=${query}&per_page=15`;
    try {
        let data = await fetch(apiURL);
        if (!data.ok) {
            if (data.status == 429) {
                throw new Error(
                    `API rate limit exceeded, please try again later!!`
                );
            }
        }
        let response = await data.json();
        let pageCount = Math.floor(response.totalHits / 15);
        console.log(pageCount);
        if (pageNumber <= pageCount) {
            apiURL = `https://pixabay.com/api/?key=${PIXABAY}&q=${query}&page=${pageNumber}&per_page=15`;
            pageNumber++;
            data = await fetch(apiURL);
            response = await data.json();
            if (response.totalHits === 0) {
                noResultFound();
            }
            response.hits.forEach((photo) => {
                const imageURL = photo.largeImageURL;
                const photographer = photo.user;
                const hotlink = photo.pageURL;
                updateUI(imageURL, photographer, hotlink, "Pixabay");
            });
        } else {
            noMoreResults();
        }
    } catch (error) {
        showBackdrop();
        showAlertModal();
        errorMessageRenderer(error);
    }
}

const showBackdrop = () => {
    backdrop.classList.remove("hidden");
};

const hideBackdrop = () => {
    backdrop.classList.add("hidden");
};

const showAlertModal = () => {
    alertModal.style.top = "3rem";
    alertModal.style.opacity = "1";
};

const hideAlertModal = () => {
    alertModal.style.top = "-10rem";
    alertModal.style.opacity = "0";
};

const customAlert = (param) => {
    if (param === "radio") {
        alertModal.innerHTML = " ";
        alertModal.innerHTML = `<h3 style="text-align: center;">Please select any source website</h3>`;
    } else if (param === "search") {
        alertModal.innerHTML = " ";
        alertModal.innerHTML = `<h3 style="text-align: center;">Please enter a search term</h3>`;
    }
};

const radioButtonInputChecker = () => {
    let result;
    for (let i = 0; i < radioBtns.length; i++) {
        if (radioBtns[i].checked) {
            result = radioBtns[i].id;
        }
    }
    if (!result) {
        showBackdrop();
        showAlertModal();
        customAlert("radio");
        return;
    }
    return result;
};

const userInputChecker = () => {
    const searchTerm = searchInput.value;
    if (!searchTerm) {
        showBackdrop();
        showAlertModal();
        customAlert("search");
        return;
    }
    return searchTerm;
};

const inputCleaner = () => {
    searchInput.value = "";
    for (let i = 0; i < radioBtns.length; i++) {
        radioBtns[i].checked = false;
    }
};

const getValue = (sourceChoice, searchItem) => {
    siteChoice = sourceChoice;
    query = searchItem;
};

const searchBtnClickHandler = () => {
    pageNumber = 1;
    const sourceChoice = radioButtonInputChecker();
    const searchItem = userInputChecker();
    getValue(sourceChoice, searchItem);
    if (sourceChoice && searchItem) {
        inputCleaner();
        if (sourceChoice === "unsplash") {
            imageContainer.innerHTML = "";
            getImagesFromUnsplash(searchItem);
        } else if (sourceChoice === "pexels") {
            imageContainer.innerHTML = "";
            getImagesFromPexels(searchItem);
        } else if (sourceChoice === "pixabay") {
            imageContainer.innerHTML = "";
            getImagesFromPixabay(searchItem);
        }
    }
};

const backdropClickHandler = () => {
    hideAlertModal();
    hideBackdrop();
};

const goToTop = () => {
    window.scrollTo({
        top: 0,
        behavior: "smooth",
    });
};

searchBtn.addEventListener("click", searchBtnClickHandler);
backdrop.addEventListener("click", backdropClickHandler);
goToTopBtn.addEventListener("click", goToTop);
window.addEventListener("scroll", () => {
    if (
        window.scrollY + window.innerHeight >=
        imageContainer.scrollHeight - 100
    ) {
        showMore.classList.remove("hidden");
        if (isEnd) {
            showMore.classList.add("hidden");
        }
    }
});

showMore.addEventListener("click", () => {
    showMore.classList.add("hidden");
    if (siteChoice === "unsplash") {
        getImagesFromUnsplash(query);
    } else if (siteChoice === "pexels") {
        getImagesFromPexels(query);
    } else if (siteChoice === "pixabay") {
        getImagesFromPixabay(query);
    }
});
