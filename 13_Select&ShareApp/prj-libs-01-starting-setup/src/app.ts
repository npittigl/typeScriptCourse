// Code goes here!

// api key: AIzaSyD8DXjnYbaaa3ATDmc2mULcbq1W-D7jXpk
// api url: https://maps.googleapis.com/maps/api/geocode/json?address=1600+Amphitheatre+Parkway,+Mountain+View,+CA&key=YOUR_API_KEY

import axios from 'axios';
// in axios folder (found in node modules folder), file 'index.d.ts' lists all ts features you can use

// declare 'google' as variable at top, set type to 'any' -> telling TS "It's fine, this will exist, don't worry."
// can declare 'google' b/c imported from SDK/script tag we added to html from API docs

// can comment out declare var google b/c downloaded npm package for types/googlemaps

declare var google: any;



// 1. Get user input

// store elements in variables:
// add '!' to tell TS it will not be null 
const form = document.querySelector('form')!;
const addressInput = document.getElementById('address')! as HTMLInputElement;
const GOOGLE_API_KEY = 'AIzaSyD8DXjnYbaaa3ATDmc2mULcbq1W-D7jXpk';

// or can create a custom type & pass in .get()<>:
// can add as many fields as you are interested in
// will also use 'status' which tells us whether Google succeeded or not
// status values will either be 'ok' or a coouple of other values
// in official google maps docs we can learn which kind of response we might get back
type GoogleGeocodingResponse = {
    results: {geometry: {location: {lat: number, lng: number}}}[];
    status: 'OK' | 'ZERO_RESULTS';
}

// callback function
function searchAddressHandler(event: Event) {
    // prevent default
    event.preventDefault();
    // store user's input into variable
    const enteredAddress = addressInput.value;

    // send input to Google's API
    // encode URI function is a built in TS/JS fn that converts entered string into a URL compatible string
    // axios get gives us a promise b/c sending such a request as an asynchronous task
        // then log if succeeds
        // catch if error
    // now, how would TS know that will be in the response of any URL we're sending a request to?
        // we can tell TS what we expect to be in the response by defining type in the get() method:
        // axios.get<{results: {geometry: {location: {lat: number, lng: number}}}[]}>(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURI(enteredAddress)}&key=${GOOGLE_API_KEY}`)
        // here we add our response type & we tell TS that we expect:
            // an object with a 'results' key
                // 'results' key has an array full of objects
                    // where every object has a geometry key
                        // which in turn has a location key
                            // which in turn is an object
                                // which has:
                                    //  1. latitude that is a number and
                                    // 2. longitude, also a number
    axios
        .get<GoogleGeocodingResponse>(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURI(enteredAddress)}&key=${GOOGLE_API_KEY}`
        )
        .then(response => {
            // if statement based on status response
            if(response.data.status !== 'OK') {
                throw new Error('Could not fetch location!');
            }
            // access latitude & longitude objs in (response) data object
            // we will be able to render lat & lng on a map later
            // search 'Google JavaScript Maps' to find official docs for JS Google Maps API on how to render a map
            const coordinates = response.data.results[0].geometry.location;
            // copied from Google Maps API docs
            // declare 'google' as variable at top, set type to 'any'
            // 'google' imported from API b/c of SDK/script tag we added to html
            // for center (which is latitude & longitude), we sub in our 'coordinates' variable
            // need to make sure this map renders in right correct place
            // by default it looks for an element with an id of 'map'
            // in html we added div with id 'map' (if use another id name, be sure to update it here):
                //<div id="map">
                  //<p>Please enter an address!</p>
                //</div>
            const map = new google.maps.Map(document.getElementById("map"), {
                center: coordinates,
                zoom: 16,
            });
            
            // we also want to render a marker, use 'map created' & create a marker with this command and point at this map
            // pass 'coordinates' variable to 'position' key
            new google.maps.Marker({position: coordinates, map: map});
        })
        .catch(err => {
            alert(err.message);
            console.log(err);
        });
}

// add event listener to form
form.addEventListener('submit', searchAddressHandler);

// to get type support for using google maps download a npm package:

    // npm install --save @types/googlemaps

// this package will install global types for this particular package

    // get error if type .map instead of .maps (before downloading paackage, it didn't show as an error)
    // get autocompletion
    // tells us that the Map constructor needs a 'div' or an 'element' where is should render the map as 1st argument, and then some options for the map (in this case we chose center & zoom )

// this project shows how you can work with 3rd party libraries (axios, api)
    // some like axios bring their own types
    // others aren't even installed with NPM and yet you can add types with an appropriate types package (@types/googlemaps)
