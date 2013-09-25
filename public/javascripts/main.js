(function () {
    'use strict';

    function connect() {
        var socket = io.connect('http://' + window.location.host);

        // TODO: Use template and rerender
        socket.on('statusUpdate', function (data) {
            document.getElementById('contents').innerHTML = window.templates['views/contents'](data);
        });

        socket.on('disconnect', function () {
            document.getElementById('contents').innerHTML = window.templates['views/contents']({
                miner: {
                    connected: false
                }
            });

            setInterval(connect, 5000);
        });

    }

    window.onload = connect;
})();