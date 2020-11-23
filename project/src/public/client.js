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
    return currentRover ? getLatestImagesAndDetails(currentRover) : `Select any rover to see the data`;
}

const getLatestImagesAndDetails = (currentRover) => {
    const latestPhotos = store.get("roversData").get(currentRover).photos;
    const roverDetails = store.get("roversData").get(currentRover).roverDetails;
    const { date, landingDate, launchDate, rovername, status } = roverDetails;

    // TODO: pagination can be done later.
    const latestPhotosInHTML = latestPhotos.reduce((finalString, singlePhoto) => {
        return finalString += `<li><img src="${singlePhoto.img_src}"</li>`;
    }, '');

    const finalHTMLString =
        `<section class="rover-details-section">
            <h1>Rover name: ${rovername}</h1>
            <p>Launch date: ${launchDate}</p>
            <p>Landing Date: ${landingDate}</p>
            <p>Photos taken on: ${date}</p>
            <p>Status: ${status}</p>
        </section>
        <section class="latest-photos">
            <ul>
            ${latestPhotosInHTML}
            </ul>
        </section>
    `
    return finalHTMLString;
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
            let date = data.roverData[0].earth_date;
            const { name, launch_date, landing_date, status } = data.roverData[0].rover;
            const roverDetails = { date, rovername: name, launchDate: launch_date, landingDate: landing_date, status };
            console.log(roverDetails);
            const roverObject = { photos: data.roverData, roverDetails }
            let newState = store.set("currentRover", rover).setIn(["roversData", `${rover}`], roverObject);
            updateStore(store, newState);

        }).catch(error => {
            console.log(error.message);
        });
}
