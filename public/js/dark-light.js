document.addEventListener('DOMContentLoaded', function () {
    console.log('DOMContentLoaded event fired');
    const darkModeToggle = document.getElementById('darkModeToggle');

    // Check the user's preference for dark mode from localStorage
    const isDarkMode = localStorage.getItem('darkMode') === 'true';

    // Set initial dark mode state based on user preference
    setDarkMode(isDarkMode);

    // Listen for the toggle button change event
    darkModeToggle.addEventListener('change', function () {
        const isDarkModeEnabled = darkModeToggle.checked;
        setDarkMode(isDarkModeEnabled);

        // Save user preference to localStorage
        localStorage.setItem('darkMode', isDarkModeEnabled);
    });

    function setDarkMode(enableDarkMode) {
        const root = document.documentElement;

        // Set CSS variables for dark mode
        root.style.setProperty('--background-color', enableDarkMode ? '#1c1c1c' : '#ffffff');
        root.style.setProperty('--text-color', enableDarkMode ? '#ffffff' : '#1c1c1c');
        // Add more variables as needed

        // Set the toggle button state
        darkModeToggle.checked = enableDarkMode;
    }
});
