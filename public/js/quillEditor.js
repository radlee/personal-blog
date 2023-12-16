document.addEventListener("DOMContentLoaded", function() {

    var toolbarOptions = [
      ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
      ['blockquote', 'code-block', 'image', 'video', 'link'],
  
      [{ 'header': 1 }, { 'header': 2 }],               // custom button values
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
      [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
      [{ 'direction': 'rtl' }],                         // text direction
  
      [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
  
      [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
      [{ 'font': [] }],
      [{ 'align': [] }],
  
      ['clean']                                         // remove formatting button
    ];
  
    new Quill('#editor-container', {
      modules: {
        toolbar: toolbarOptions,
        imageDrop: true,
        imageResize: {
          displayStyles: {
            backgroundColor: 'black',
            border: 'none',
            color: 'white'
          },
        }
      },
      placeholder: 'Compose an epic...',
      theme: 'snow'
    });
  
    var form = document.querySelector('form');
    var quillContentInput = document.getElementById('quill-content');
    var fileInput = document.getElementById('coverInput');
    var imagePreview = document.getElementById('image-preview');
  
    // Listen for changes in the file input
    fileInput.addEventListener('change', function() {
      // Display the selected image in the preview container
      var file = fileInput.files[0];
      if (file) {
        var reader = new FileReader();
        reader.onload = function(e) {
          imagePreview.innerHTML = '<img src="' + e.target.result + '" class="current-image" alt="Image Preview">';
        };
        reader.readAsDataURL(file);
      } else {
        imagePreview.innerHTML = ''; // Clear the preview if no file selected
      }
    });
  
    form.addEventListener('submit', function() {
      var editorContent = document.querySelector('.ql-editor').innerHTML;
      quillContentInput.value = editorContent;
    });
  });