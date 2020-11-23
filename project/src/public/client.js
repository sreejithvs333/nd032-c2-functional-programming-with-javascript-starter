let store = Immutable.Map({
    user: Immutable.Map({ name: "Sreejith" }),
    apod: '',
    currentRover: '',
    rovers: Immutable.List(['Curiosity', 'Opportunity', 'Spirit']),
    roversData: Immutable.Map({
        "Curiosity": '',
        "Opportunity": '',
        "Spirit": ''
    })
});

// add our markup to the page
const root = document.getElementById('root')

const updateStore = (state, newState) => {
    store = state.merge(newState);
    render(root, store);
}

const render = async (root, state) => {
    root.innerHTML = App(state);
}

// create content
const App = (state) => {

    return `
    <header>
      <ul>
        ${header(state)}
      </ul>
    </header>
        <section class="main">
            <section>
            ${getRoverData(state, state.get("currentRover"))}
            </section>
        </section>
        <footer></footer>
    `
}

// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
    render(root, store)
});

// Utility functions
const getTodaysDate = () => {
    const today = new Date();
    return `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`
}

const itemClicked = (item) => {
    store.get("roversData").item ? updateStore(store, { currentRover: item }) : getRoverDatafromApi(item);
};

// ------------------------------------------------------  COMPONENTS

const header = (state) => {
    return state.get("rovers")
        .map((item) => `<li onClick=itemClicked("${item}")>${item}</li>`)
        .reduce((result, rover) => result += rover);
}

const getRoverData = (state, currentRover) => {
    return currentRover ? getLatestImages(currentRover) : `Select any rover to see the data`;
}

const getLatestImages = (currentRover) => {
    let latestPhotos = store.get("roversData").get(currentRover);
    //TODO: temporarily limiting the array. Later can use pagination/lazy-loading for better UX
    if (latestPhotos.length > 10) latestPhotos = latestPhotos.slice(0, 10);
    const resultHTMLString = latestPhotos.reduce((finalString, singlePhoto) => {
        return finalString += `<li><img src="${singlePhoto.img_src}"</li>`;
    }, '');
    return resultHTMLString;
}

// ------------------------------------------------------  API CALLS ------------------------------------------------------

const getRoverDatafromApi = (rover) => {
    let url = new URL("http://localhost:3000/rover");
    url.searchParams.append("name", rover);
    fetch(url)
        .then(res => {
            if (res.ok) {
                return res.json();
            } else {
                throw new Error('Oops! Something went wrong! Please try again.');
            }
        }).then(data => {
            let newState = store.set("currentRover", rover).setIn(["roversData", `${rover}`], data.roverData);
            updateStore(store, newState);

        }).catch(error => {
            console.log(error.message);
        });
}
