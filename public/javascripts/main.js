(function () {
    'use strict';

    function connect() {
        var socket = io.connect('http://' + window.location.host);

        // TODO: Use template and rerender
        socket.on('statusUpdate', function (data) {
            document.getElementById('updated').innerHTML = window.templates['views/partials/contents.hbs'](data);
        });

        socket.on('disconnect', function () {
            document.getElementById('updated').innerHTML = window.templates['views/partials/contents.hbs']({
                miner: {
                    connected: false
                }
            });

            setInterval(connect, 5000);
        });

    }

    window.onload = connect;
})();