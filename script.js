//Globl variable to store the timer interval ID, so we can clera it later 
let timerInterval;

// ---- 1. Get DOM Elements ----
// Get inut fields and the start button
const targetDateInput = document.getElementById('targetDate');
const targetTimeInput = document.getElementById('targetTime');
const startButton = document.getElementById('startButton');

//Get the display elements for days, hours, minutes, seconds.
const daysSpan = document.getElementById('days');
const hoursSpan = document.getElementById('hours');
const minutesSpan = document.getElementById('minutes');
const secondsSpan = document.getElementById('seconds');

//Get the message display area
const messageDisplay = document.getElementById('message');

//Get the forground circles (the 'line' that moves) for the progress rings
 const daysFg = daysSpan.closest('.time-circle-inner').querySelector('.progress-ring-fg');
 const hoursFg = hoursSpan.closest('.time-circle-inner').querySelector('.progress-ring-fg');
 const minutesFg = minutesSpan.closest('.time-circle-inner').querySelector('.progress-ring-fg');
 const secondsFg = secondsSpan.closest('.time-circle-inner').querySelector('.progress-ring-fg');

 //--- 2. Constants for SVG Progress Rigns ---
 // Radius of the circle form your SVG 'r' attribute
 const radius = 56;
 // Circumference of the circle: 2 * pi * r. Used for stroke-dasharray/offset.
 const circumference = 2 * Math.PI * radius;


 //--- 3. Function to Update SVG Progress Rings ---
 /**
  * Update the visual progress of a given SVG circle elements.
  *  @param {SVGElement} circleElement the forground circle element.
  * @param {number} percentage A value between 0 (empty) and 1 (full).
  */

 function setProgress(circleElement, percentage) {
    // We want the line to be full when percentage is 1, and empty when percentage is 0.
   // stroke-dashoffset = 0 means full circle visible.
   // stroke-dashoffset = circumference means empty circle.
  // So, offset should be `circumferenve * (1 - percentage)`.

  const offset = circumference * (1 - percentage);
  console.log(`Updating ${circleElement.classList[1]} - Percentage: ${percentage.toFixed(2)}, Offset: ${offset.toFixed(2)}`); //Debugging line

    circleElement.style.strokeDasharray = `${circumference} ${circumference}`;
    circleElement.style.strokeDashoffset = offset;
}

// --- 4. Core Countdown Logic Function ---
// This function will be called repeatedly by setInterval
function updateCountdownDisplay() {
    // Make sure we have a target date/time stored (from the button click)
   //  If somehow not set, stop
   if(!window.currentCountdownTarget) {
    clearInterval(timerInterval);
    return;
   }

   const now = new Date().getTime(); //Current time in milliseconds.
   const distance = window.currentCountdownTarget.getTime() - now // Time remaining in milliseconds.

   console.log(window.currentCountdownTarget.getTime());
   console.log(now);
   console.log(distance);


   
   // --- Check if Countdown Has Ended ---
   if(distance < 0){
    clearInterval(timerInterval); // Stop the timer from updating

    // Reset numbers to "00"
    daysSpan.textContent = '00';
    hoursSpan.textContent = '00';
    minutesSpan.textContent = '00';
    secondsSpan.textContent = '00';

    // Set all progress rings to empty ( 0% filled)
    setProgress(daysFg, 0);
    setProgress(hoursFg, 0);
    setProgress(minutesFg, 0);
    setProgress(secondsFg, 0);

    //Display Completion message
    messageDisplay.textContent = "Countdown Finished! 🎉";
    messageDisplay.classList.add('show', 'success'); //Add classes for styling
    messageDisplay.classList.remove('hidden', 'error'); //Remove other states

    return; //Stop function execution
   }

     // --- Calculate Time Units ---
    // Perform calculations for days, hours, minutes, seconds
       const days = Math.floor(distance / (1000 * 60 * 60 * 24));
       const hours = Math.floor((distance % (1000 * 60 * 60 * 24) / (1000 * 60 * 60)));
    //    let h = Math.floor((distance % (1000 * 60 * 60 * 24) / (1000 * 60 * 60)));
       const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
       const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    // --- Update Numerical Dispaly ---
   // Use padStart(2, '0') to ensure two digits (e.g., "05" instead of "5")
    daysSpan.textContent = String(days).padStart(2, '0');
    hoursSpan.textContent = String(hours).padStart(2, '0');
    minutesSpan.textContent = String(minutes).padStart(2, '0');
    secondsSpan.textContent = String(seconds).padStart(2, '0');

    //--- Update Progress Rings ---
   // The percentage should reflect how much of the unit is *remaining*.
  // E.g., if 59 seconds left, it's almost 100% (59/60). If 0 seconds left, it's 0% (0/60).

  const secondsPercentage = seconds / 60;
  setProgress(secondsFg, secondsPercentage);

  const minutesPercentage = minutes / 60;
  setProgress(minutesFg, minutesPercentage);

  const hoursPercentage = hours / 24; //Hours go from 23 down to 0
  setProgress(hoursFg, hoursPercentage);

   // For Days: It's less common to have a 'progress' circle for days
  // unless your countdown has a fixed maximum duration (e.g., "356 days until...").
 // For simplicity, we'll make the days circle full if days remain, and empty if not.
   if(days > 0){
    setProgress(daysFg, 1);  //Full circle if days remaining
   } else {
    setProgress(daysFg, 0); //Empty if no days (i.e., less than 1 full day)
   }

   // --- Optional: Add/remove 'changing' class for a subtle animation on numbers ---
  // This makes the numbers briefly scale up/down when they change
 // You might want to make this smarter to only animate when the number actually changes.
 [daysSpan, hoursSpan, minutesSpan, secondsSpan].forEach(span => {
    span.classList.remove('changing');
    void span.offsetWidth; //Force reflow to re-trigger CSS animation
    span.classList.add('changing');
 });

}

// --- 5. Event Listener for "Start Countdown" Button ---
startButton.addEventListener('click', () => {
    // --- Input Validation ---
    const dateValue = targetDateInput.value; // e.g., "2025-06-21"
    const timeValue = targetTimeInput.value; // e.g., "12:31"

    if(!dateValue || !timeValue){
        messageDisplay.textContent = "Please select both a target date and time!";
        messageDisplay.classList.add('show', 'error');
        messageDisplay.classList.remove('hidden', 'success');
        return; //Stop execution if input are empty.

    }
    
    // Combine date and time starings into ISo 8601 format for robust parsing
    const combinedDateTimeString = `${dateValue}T${timeValue}`;
    const targetDateTime = new Date(combinedDateTimeString);


    const now = new Date(); //Get current date/time
    if(targetDateTime.getTime() <= now.getTime()) {
        messageDisplay.textContent = "Please set a future date and time!";
        messageDisplay.classList.add('show', 'error');
        messageDisplay.classList.remove('hidden', 'success');
        return; //Stop execution if date is in the past/present
    }

    // --- Start the Countdown ---
    // 1. Clear any previouly running countdown
    if(timerInterval) {
        clearInterval(timerInterval);
    }

    // 2. Hide any previous messages
    messageDisplay.classList.remove('show', 'success', 'error');
    messageDisplay.classList.add('hidden');

    // 3. Store the target date/time globally or in a way accessible by updateCountdownDisply
    // Using window.currentCountdownTarget is a simple way for this project scope.
    window.currentCountdownTarget = targetDateTime;

    // 4. Call the update function once immediately to show the initial countdown state
    updateCountdownDisplay();

    //5. Set up the interval to call updateVountdownDisplay evert second (1000ms)
    timerInterval = setInterval(updateCountdownDisplay, 1000);
});

// --- 6. Initial Setup on Page Load ---
// This ensures the display is not blank when the page first loads
document.addEventListener('DOMContentLoaded', () => {
    // Set initial numbers to 00
    daysSpan.textContent = '00';
    hoursSpan.textContent = '00';
    minutesSpan.textContent = '00';
    secondsSpan.textContent = '00';

    // Set initial progress rings to empty (0% filled) when page loads
    setProgress(daysFg, 0);
    setProgress(hoursFg, 0);
    setProgress(minutesFg, 0);
    setProgress(secondsFg, 0);

    //Ensure message is hidden on load
    messageDisplay.classList.add('hidden');
    messageDisplay.classList.remove('show', 'success', 'error');
});