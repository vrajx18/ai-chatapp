const status =
    document.getElementById("status");

const messages =
    document.getElementById("messages");

const input =
    document.getElementById("message");

const send =
    document.getElementById("send");

const copyLink =
    document.getElementById("copyLink");

const params =
    new URLSearchParams(
        window.location.search
    );

let roomId =
    params.get("room");

if (!roomId) {

    roomId =
        Math.random()
            .toString(36)
            .substring(2, 10);

    history.replaceState(
        null,
        "",
        "?room=" + roomId
    );
}

const ownerId =
    "private-chat-" + roomId;

let peer;
let connection = null;
let isHost = false;

/* Host na connections */
let connectedUsers = 0;


/* =========================
   PEER CREATE
========================= */

peer = new Peer(ownerId);


/* =========================
   PEER OPEN
========================= */

peer.on("open", function(id) {

    isHost = true;

    status.innerText =
        "Waiting for friend...";

});


/* =========================
   HOST CONNECTION
========================= */

peer.on("connection", function(conn) {

    /* Already one person connected */
    if (connectedUsers >= 1) {

        conn.on("open", function() {

            conn.send({
                type: "room-full"
            });

            setTimeout(function() {
                conn.close();
            }, 500);
        });

        return;
    }


    /* First friend allowed */

    connection = conn;

    connectedUsers = 1;

    setupConnection();

});


/* =========================
   SECOND DEVICE
========================= */

peer.on("error", function(error) {

    if (
        error.type ===
        "unavailable-id"
    ) {

        peer.destroy();

        peer =
            new Peer();


        peer.on("open", function() {

            isHost = false;

            status.innerText =
                "Connecting...";


            connection =
                peer.connect(
                    ownerId
                );


            setupConnection();

        });

    }

});


/* =========================
   CONNECTION SETUP
========================= */

function setupConnection() {

    if (!connection) {
        return;
    }


    connection.on(
        "open",
        function() {

            status.innerText =
                "● Online";

            status.classList.add(
                "online"
            );

        }
    );


    connection.on(
        "data",
        function(data) {

            /* Room full message */

            if (
                data &&
                data.type ===
                "room-full"
            ) {

                status.innerText =
                    "Room Full";

                status.classList.remove(
                    "online"
                );

                alert(
                    "Room is currently unavailable.\n\n2 people are already connected."
                );

                connection.close();

                return;
            }


            /* Normal message */

            addMessage(
                data,
                false
            );

        }
    );


    connection.on(
        "close",
        function() {

            if (isHost) {
                connectedUsers = 0;
            }

            status.innerText =
                "Friend disconnected";

            status.classList.remove(
                "online"
            );

        }
    );

}


/* =========================
   SEND MESSAGE
========================= */

function sendMessage() {

    const text =
        input.value.trim();


    if (text === "") {
        return;
    }


    if (
        !connection ||
        !connection.open
    ) {

        alert(
            "Friend is not connected yet."
        );

        return;
    }


    connection.send(text);


    addMessage(
        text,
        true
    );


    input.value = "";

    input.focus();

}


send.onclick =
    sendMessage;


/* =========================
   ENTER = SEND
========================= */

input.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key ===
            "Enter"
        ) {

            sendMessage();

        }

    }
);


/* =========================
   DISPLAY MESSAGE
========================= */

function addMessage(
    text,
    mine
) {

    const div =
        document.createElement(
            "div"
        );


    div.className =
        mine
        ? "message mine"
        : "message friend";


    div.innerText =
        text;


    messages.appendChild(div);


    messages.scrollTop =
        messages.scrollHeight;

}


/* =========================
   COPY LINK
========================= */

copyLink.onclick =
    async function() {

        try {

            await navigator.clipboard.writeText(
                window.location.href
            );


            copyLink.innerText =
                "✓ Link Copied";


            setTimeout(
                function() {

                    copyLink.innerText =
                        "🔗 Copy Chat Link";

                },
                1500
            );

        }

        catch(error) {

            prompt(
                "Copy this link:",
                window.location.href
            );

        }

    };
