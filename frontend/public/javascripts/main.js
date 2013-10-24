(function () {
    'use strict';

    function connect() {
        var socket = io.connect('http://' + window.location.host, {
            'reconnect': true,
            'reconnection delay': 5000,
            'max reconnection attempts': Infinity
        });

        socket.on('update:view', function (id, data) {
            var div = document.createElement('div'),
                element = document.getElementById(id);
            div.innerHTML = data;

            element.parentNode.replaceChild(div.firstChild, element);
        });

        socket.on('connect', function () {
            document.getElementById('backend-connection').innerHTML = '';
        });

        socket.on('disconnect', function () {
            document.getElementById('backend-connection').innerHTML = '<div class="alert alert-danger row"><strong>Error:</strong> Backend Disconnected</div>';
        });
    }

    window.onload = connect;
})();