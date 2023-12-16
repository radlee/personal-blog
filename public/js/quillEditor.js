document.addEventListener("DOMContentLoaded", function() {
    // Define your toolbar options
    var toolbarOptions = [
        ['bold', 'italic', 'underline', 'strike'],
        ['blockquote', 'code-block', 'image', 'video', 'link'],
        [{ 'header': 1 }, { 'header': 2 }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'script': 'sub'}, { 'script': 'super' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        [{ 'direction': 'rtl' }],
        [{ 'size': ['small', false, 'large', 'huge'] }],
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'font': [] }],
        [{ 'align': [] }],
        ['clean']
    ];

    // Initialize Quill with the provided options
    var quill = new Quill('#editor-container', {
        modules: {
            toolbar: toolbarOptions,
            imageResize: {
                displayStyles: {
                    backgroundColor: 'black',
                    border: 'none',
                    color: 'white'
                },
                modules: ['Resize', 'DisplaySize', 'Toolbar']
            }
        },
        theme: 'snow'
    });

    // Get the file input and image preview elements
    var fileInput = document.getElementById('coverInput');
    var imagePreview = document.getElementById('image-preview');

    // Listen for changes in the file input
    fileInput.addEventListener('change', function() {
        displayImagePreview(fileInput, imagePreview);
    });

    // Update the Quill content when the form is submitted
    var form = document.getElementById('add-form');
    var quillContentInput = document.getElementById('quill-content');
    form.addEventListener('submit', function() {
        quillContentInput.value = quill.root.innerHTML;
    });
});

// Function to display the selected image in the preview container
function displayImagePreview(fileInput, previewContainer) {
    var file = fileInput.files[0];

    if (file) {
        var reader = new FileReader();
        reader.onload = function(e) {
            // Create an image element and set its attributes
            var imageElement = document.createElement('img');
            imageElement.src = e.target.result;
            imageElement.classList.add('current-image');
            imageElement.alt = 'Image Preview';

            // Clear the previous content and append the new image element
            previewContainer.innerHTML = '';
            previewContainer.appendChild(imageElement);
        };

        reader.readAsDataURL(file);
    } else {
        // Clear the preview if no file selected
        previewContainer.innerHTML = '';
    }
}
