/*=============== EXPANDED LIST ===============*/
const navExpand = document.getElementById('nav-expand');
const navExpandList = document.getElementById('nav-expand-list');
const navExpandIcon = document.getElementById('nav-expand-icon');

navExpand.addEventListener('click', () => {
   navExpandList.classList.toggle('show-list');
   navExpandIcon.classList.toggle('rotate-icon');
});

/*=============== SCROLL SECTIONS ACTIVE LINK ===============*/
const sections = document.querySelectorAll('section[id]');
    
const scrollActive = () => {
   const scrollDown = window.scrollY;

   sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 58;
      const sectionId = current.getAttribute('id');
      const sectionsClass = document.querySelector('.nav__list a[href*=' + sectionId + ']');

      if (scrollDown > sectionTop && scrollDown <= sectionTop + sectionHeight) {
         sectionsClass.classList.add('active-link');
      } else {
         sectionsClass.classList.remove('active-link');
      }                                                    
   });
};

window.addEventListener('scroll', scrollActive);

/*=============== FORM SLIDE FUNCTIONS ===============*/
const loginForm = document.getElementById('login');
const registerForm = document.getElementById('register');
const btnSlide = document.getElementById('btn');

function register() {
   loginForm.style.left = "-400px";
   registerForm.style.left = "50px";
   btnSlide.style.left = "110px";
}

function login() {
   loginForm.style.left = "50px";
   registerForm.style.left = "450px";
   btnSlide.style.left = "0";
}

// Simulating backend data fetch for nutrition values
const nutritionData = {
   fat: 20,
   carbohydrates: 60,
   protein: 30,
   calories: 90
 };
 
 function updateCircle(circleId, percentage) {
   const circle = document.getElementById(circleId);
   const circleInner = document.getElementById(${circleId}-percent);
 
   // Update the circle background based on the percentage
   circle.style.background = conic-gradient(${getColor(circleId)} ${percentage}%, #e0e0e0 ${percentage}%);
 
   // Update the text inside the circle
   circleInner.textContent = ${percentage}%;
 }
 
 function getColor(circleId) {
   switch(circleId) {
     case 'fat': return '#FF6347'; // Tomato color
     case 'carbohydrates': return '#FFD700'; // Gold color
     case 'protein': return '#32CD32'; // LimeGreen color
     case 'calories': return '#1E90FF'; // DodgerBlue color
     default: return '#000000';
   }
 }
 
 // Simulate data update from backend
 function loadCircleData() {
   updateCircle('fat', nutritionData.fat);
   updateCircle('carbohydrates', nutritionData.carbohydrates);
   updateCircle('protein', nutritionData.protein);
   updateCircle('calories', nutritionData.calories);
 }
 
 // Load the data when the page loads
 window.onload = loadCircleData;
