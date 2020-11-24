// The store object
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
const App = (state) => completeUI(state, header, getRoverData);

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
/** This is a higher order function which takes two functions for the header and main content section & returns the complete UI. */
const completeUI = (state, header, mainContent) => {
    return `
    <header>
      <ul>
        ${header(state)}
      </ul>
    </header>
    <section class="main">
        <section>
        ${mainContent(state.get("currentRover"))}
        </section>
    </section>
    <footer></footer>
    `;
}
/** This function returns the HTML content for the header section. */
const header = (state) => {
    return state.get("rovers")
        .map((item) => `<li class="${state.get("currentRover") === item ? "active" : "no-active"}" onClick=itemClicked("${item}")>${item}</li>`)
        .reduce((result, rover) => result += rover);
}
/** This checks whether any rover is selected or not. 
 * If selected, it returns the corresponding rover details
 * Otherwise it will ask the user to select any rover to see the details. */
const getRoverData = (currentRover) => {
    return currentRover ? getLatestImagesAndDetails(currentRover) : `<section class="main-content">Select any rover to see the data</section>`;
}

/** This function returns the HTML content for rover details and its latest photos. */
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
            <p><span>Rover name:</span> ${rovername}</p>
            <p><span>Launch date:</span> ${launchDate}</p>
            <p><span>Landing Date:</span> ${landingDate}</p>
            <p><span>Photos taken on:</span> ${date}</p>
            <p><span>Status:</span> ${status}</p>
        </section>
        <section class="latest-photos">
            <ul>
            ${latestPhotosInHTML}
            </ul>
        </section>
    `
    return finalHTMLString;
}

const finalHTMLBuilder = (rovername, launchDate, landingDate, date, status, latestPhotosInHTML) => {
    return `<section class="rover-details-section">
                <p><span>Rover name:</span> ${rovername}</p>
                <p><span>Launch date:</span> ${launchDate}</p>
                <p><span>Landing Date:</span> ${landingDate}</p>
                <p><span>Photos taken on:</span> ${date}</p>
                <p><span>Status:</span> ${status}</p>
            </section>
            <section class="latest-photos">
                <ul>
                    ${latestPhotosInHTML}
                </ul>
            </section>
            `;
}

// ------------------------------------------------------  API CALLS ------------------------------------------------------
/** This API call fetch rover details & latest photos from the backend. */
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
            const date = data.roverData[0].earth_date;
            const { name, launch_date, landing_date, status } = data.roverData[0].rover;
            const roverDetails = { date, rovername: name, launchDate: launch_date, landingDate: landing_date, status };
            const roverObject = { photos: data.roverData, roverDetails }
            const newState = store.set("currentRover", rover).setIn(["roversData", `${rover}`], roverObject);
            updateStore(store, newState);
        }).catch(error => {
            console.log(error.message);
        });
}
