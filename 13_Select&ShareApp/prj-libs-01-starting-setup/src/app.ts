// Code goes here!

// api key: AIzaSyD8DXjnYbaaa3ATDmc2mULcbq1W-D7jXpk
// api url: https://maps.googleapis.com/maps/api/geocode/json?address=1600+Amphitheatre+Parkway,+Mountain+View,+CA&key=YOUR_API_KEY


// 1. Get user input

// store elements in variables:
// add '!' to tell TS it will not be null 
const form = document.querySelector('form')!;
const addressInput = document.getElementById('address')! as HTMLInputElement;
const GOOGLE_API_KEY = 'AIzaSyD8DXjnYbaaa3ATDmc2mULcbq1W-D7jXpk';

// callback function
function searchAddressHandler(event: Event) {
    // prevent default
    event.preventDefault();
    // store user's input into variable
    const enteredAddress = addressInput.value;

    // send input to Google's API:
}

// add event listener to form
form.addEventListener('submit', searchAddressHandler);