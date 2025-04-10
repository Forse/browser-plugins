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


function reloadDropdown(){
  let dropdown = $('#chamberOfSecrets');
  dropdown.empty();
  dropdown.append('<option value="">Chamber of secrets</option>');
  dropdown.append('<option value="Add">(Add new)</option>');
  dropdown.append('<option value="Remove">(Remove)</option>');
  
  let url = window.location.pathname;
  let data = JSON.parse(localStorage.getItem(url) || '[]');
  data.forEach(item => {
    dropdown.append(`<option value="${item.key}">${item.name}</option>`);
  });
}

function loadData(){
  let url = window.location.pathname;
  let data = JSON.parse(localStorage.getItem(url) || '[]');
  return data;
}
function saveData(data){
  let url = window.location.pathname;
  localStorage.setItem(url, JSON.stringify(data))
}

function createChamber(){
  let swaggerElement = $('#swagger-ui .topbar .topbar-wrapper .download-url-wrapper');
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

  let dropdown = $('<select id="chamberOfSecrets"></select>');
  swaggerElement.before(dropdown);  
  reloadDropdown();

  dropdown.change(function() {
      if (this.value === 'Add') {
        dropdown.hide();
        let popup = $('<div></div>');
        popup.append('<input type="text" id="name" placeholder="Name">');
        popup.append('<input type="text" id="key" placeholder="Key">');
        popup.append('<button id="save">Save</button>');
        
        dropdown.after(popup);
        $('#save').click(function() {
          let name = $('#name').val();
          let key = $('#key').val();
          let data = loadData();
          data.push({ name, key });
          saveData(data);
          reloadDropdown();
          dropdown.val(key);

          popup.remove();
          dropdown.show();
        });
      }
      else if(this.value === 'Remove'){
        let data = loadData();
        dropdown.hide();
          let popup = $('<div></div>');
          let selector = $('<select id="selector"></select>');
          selector.append('<option value="">Which entry?</option>');
          data.forEach(item => {
            selector.append(`<option value="${item.name}">${item.name}</option>`);
          });
          popup.append(selector);
          popup.append('<button id="remove">Kill it!</button>');
          dropdown.after(popup);
          
          $('#remove').click(function() {
            let name = $('#selector').val();
            if(name){
              data = data.filter(item => item.name !== name);
              saveData(data);
              reloadDropdown();
            }
            popup.remove();
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
