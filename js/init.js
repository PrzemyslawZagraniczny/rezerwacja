//Globalne


$(document).ready(function() {
    //blokuje menu kontestowe
    document.oncontextmenu = function (e) {
      stopEvent(e);
    }
    $('[data-toggle="tooltip"]').tooltip({'placement': 'bottom'})
});
  


function stopEvent(event) {
  if (event.preventDefault != undefined)
    event.preventDefault();
  if (event.stopPropagation != undefined)
    event.stopPropagation();
}

function MessageBox(title, msg)
{
    $("#dlgTitle").html(title);
    $("#dlgBody").html(msg);
    $("#btClose").html("close");
    $('#myModal').modal('show');
}