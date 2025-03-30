$(document).ready(function() {
  let counter = 0;
    window.layoutIntervalChecker = setInterval(function() {
      counter++;  
      if(counter>100){
        clearInterval(window.layoutIntervalChecker);
        return;
      }
      let swaggerElement = $('#swagger-ui .topbar .topbar-wrapper .download-url-wrapper');
      if(!swaggerElement.length) {
        return;
      } 
      if($('h2').length){
            clearInterval(window.layoutIntervalChecker);
            createChamber();
            return;
        }
    }, 100);
});


function createChamber(){
  let swaggerElement = $('#swagger-ui .topbar .topbar-wrapper .download-url-wrapper');
  debugger;
  if(!swaggerElement.length) {
      return;
  }

  let env = 'local';
  let color='#fefefe';
  if(window.location.hostname.includes('api-test.')){env='test';color="#f0fff0";}
  if(window.location.hostname.includes('api-staging.')){env='staging';color="#ffffee";}
  if(window.location.hostname.includes('api.')){env='prod';color="#fff0f0";}

  let smallElement = $('<small></small>').addClass('version-stamp');
  let preElement = $('<pre></pre>').addClass('version').text(env);
  if(env=='prod'){smallElement.css('background-color','red');}
  else{
    smallElement.css('background-color','#89bf04');
  }
  smallElement.append(preElement);



  // Create dropdown
  let dropdown = $('<select></select>');
  dropdown.append('<option value="">Chamber of secrets</option>');
  dropdown.append('<option>Add</option>');
  
  // Load data from local storage
  let url = window.location.pathname;
  let data = JSON.parse(localStorage.getItem(url) || '[]');
  
  // Populate dropdown with data
  data.forEach(item => {
    dropdown.append(`<option value="${item.key}">${item.name}</option>`);
  });
  
  // Add dropdown to page
  swaggerElement.before(dropdown);
  
  // Handle dropdown change event
  dropdown.change(function() {
      if (this.value === 'Add') {
        // Hide dropdown
        dropdown.hide();
        
        // Show popup with textboxes and button
        let popup = $('<div></div>');
        popup.append('<input type="text" id="name" placeholder="Name">');
        popup.append('<input type="text" id="key" placeholder="Key">');
        popup.append('<button id="save">Save</button>');
        
        // Add popup to page
        dropdown.after(popup);
        
        // Handle button click event
        $('#save').click(function() {
          // Save data to local storage
          let name = $('#name').val();
          let key = $('#key').val();
          data.push({ name, key });
          localStorage.setItem(url, JSON.stringify(data));
          
          // Update dropdown
          dropdown.append(`<option value="${key}">${name}</option>`);
          dropdown.val(key);
          
          // Remove popup
          popup.remove();
          
          // Show dropdown
          dropdown.show();
        });
      } else {
        navigator.clipboard.writeText(this.value).then(function() {
          console.log('Copying to clipboard was successful!');
        }, function(err) {
          console.error('Could not copy text: ', err);
        });
      }
    });


    $('h2').prepend(smallElement);
    $('.swagger-ui .scheme-container').css('background-color',color);
    $('body').css('background-color',color);
  }
