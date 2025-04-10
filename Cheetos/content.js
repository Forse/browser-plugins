$(document).ready(function() {

  $('*').contents().filter(function() {
    return this.nodeType == 3
  }).each(function(){
    
      if (this.textContent.indexOf("Trump") > -1) {
        this.textContent = this.textContent.replace("Trump", "Cheetos");
      }
      if (this.textContent.indexOf("Truth Social") > -1) {
        this.textContent = this.textContent.replace("Truth Social", "Shitshow");
      }
      if (this.textContent.indexOf("Truth") > -1) {
        this.textContent = this.textContent.replace("Truth", "Propagande");
      }
    });
});
