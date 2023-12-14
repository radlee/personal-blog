

  document.addEventListener('DOMContentLoaded', function () {
    const menuIcon = document.querySelector('.icon .fa-bars');
    const closeIcon = document.querySelector('.icon .fa-times-circle-o');

    // Hide close icon and show menu icon
    menuIcon.style.display = 'block';
    closeIcon.style.display = 'none';


    
  });

  function toggleMenu() {
    const navLinks = document.querySelector('#navbarcontainer ul');
    const body = document.querySelector('body');
    const closeIcon = document.querySelector('.icon .fa-times-circle-o');
    const menuIcon = document.querySelector('.icon .fa-bars');

    if (body.classList.contains('menu-open')) {
      navLinks.style.maxHeight = '0';
      body.classList.remove('menu-open');
      closeIcon.style.display = 'none'; // Hide close icon when the menu is closed
      menuIcon.style.display = 'block'; // Show the menu icon when the menu is closed
    } else {
      navLinks.style.maxHeight = '500px'; // Adjust this value based on your content height
      body.classList.add('menu-open');
      closeIcon.style.display = 'block'; // Show the close icon when the menu is open
      menuIcon.style.display = 'none'; // Hide the menu icon when the menu is open
    }
  }

