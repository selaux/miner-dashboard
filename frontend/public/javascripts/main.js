(function () {
    'use strict';

    function connect() {
        var socket = io.connect('http://' + window.location.host, {
            'reconnect': true,
            'reconnection delay': 5000,
            'max reconnection attempts': Infinity
        });

        socket.on('statusUpdate', function (data) {
            document.getElementById('updated').innerHTML = window.templates['views/partials/contents.hbs'](data);
        });

        socket.on('disconnect', function () {
            document.getElementById('updated').innerHTML = window.templates['views/partials/contents.hbs']({
                miner: {
                    connected: false
                }
            });
        });
    }

    window.onload = connect;
})();