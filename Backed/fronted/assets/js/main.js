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
