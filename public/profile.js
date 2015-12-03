$(document).ready(function() {

// connect to socket
  var socket = io();

// submit form to send a message
  $('#send-msg').on('submit', function (event) {
    event.preventDefault();


    // get new message from form input
    var newMsg = $('#new-msg').val();


  if (username1){
    // send new message to socket (server)
    socket.emit('chat message', username1 + ' says: ' + newMsg);
    $('#new-msg').val('');
  } else {  
    socket.emit('chat message', username2 + ' says: ' + newMsg);
    $('#new-msg').val('');
  }
  });

  // receive message from socket (server)
socket.on('chat message', function (msg) {
  $('#messages').append($('<li>' +msg + '</li>'));
});


});