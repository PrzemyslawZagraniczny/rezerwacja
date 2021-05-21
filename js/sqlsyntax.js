
const sqlsyntax=['A',
'ZONE'];

let mapa = new Map()


//kopiuj do schowka tekst ze zmiennej text
function copyToClipboard(text) {
    text = text.replace(/<br>/g, '');
    var textArea = document.createElement("textarea");
    textArea.value = text;
    
    // Avoid scrolling to bottom
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
  
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
  
    try {
      var successful = document.execCommand('copy');
      var msg = successful ? 'successful' : 'unsuccessful';
      console.log('Fallback: Copying text command was ' + msg);
    } catch (err) {
      console.error('Fallback: Oops, unable to copy', err);
    }
  
    document.body.removeChild(textArea);
}

function copyTextToClipboard(text) {
    if (!navigator.clipboard) {
        copyTextToClipboard(text);
    return;
    }
    navigator.clipboard.writeText(text).then(function() {
    }, function(err) {
        console.error('CC: ', err);
    });
}
    

  