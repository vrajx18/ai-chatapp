
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


/*
    URL mathi room ID levani.
*/

const params =
    new URLSearchParams(
        window.location.search
    );

let roomId =
    params.get("room");


/*
    First user hoy to new room banavo.
*/

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


/*
    Aa room nu permanent owner ID.
*/

const ownerId =
    "private-chat-" + roomId;


let peer;
let connection = null;
let isHost = false;


/*
    Pela owner ID thi Peer banavvano try.
*/

peer =
    new Peer(ownerId);


/*
    Peer successfully open thay.
*/

peer.on("open", function(id) {

    isHost = true;

    status.innerText =
        "Waiting for friend...";
});


/*
    Koi friend connection kare.
*/

peer.on("connection", function(conn) {

    /*
        Jo ek friend already connected chhe
        to third person ne allow nahi karvo.
    */

    if (
        connection &&
        connection.open
    ) {

        conn.on(
            "open",
            function() {

                conn.send("CHAT_FULL");

                setTimeout(
                    function() {
                        conn.close();
                    },
                    500
                );
            }
        );

        return;
    }


    /*
        First friend ne connection aapvu.
    */

    connection = conn;

    setupConnection();
});


/*
    Jo owner ID already used hoy
    to aa second user chhe.
*/

peer.on("error", function(error) {

    if (
        error.type ===
        "unavailable-id"
    ) {

        peer.destroy();

        peer =
            new Peer();


        peer.on(
            "open",
            function() {

                isHost = false;

                status.innerText =
                    "Connecting...";


                connection =
                    peer.connect(
                        ownerId
                    );


                setupConnection();
            }
        );
    }
});


/*
    Connection setup.
*/

function setupConnection() {

    if (!connection) {
        return;
    }


    /*
        Connection open.
    */

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


    /*
        Friend no message receive.
    */

    connection.on(
        "data",
        function(data) {

            /*
                Jo chat full message male
                to third person chhe.
            */

            if (
                data ===
                "CHAT_FULL"
            ) {

                status.innerText =
                    "Chat Full";

                status.classList.remove(
                    "online"
                );


                alert(
                    "This chat is already full."
                );


                connection.close();

                return;
            }


            /*
                Normal message.
            */

            addMessage(
                data,
                false
            );
        }
    );


    /*
        Friend disconnect.
    */

    connection.on(
        "close",
        function() {

            status.innerText =
                "Friend disconnected";

            status.classList.remove(
                "online"
            );

            connection = null;
        }
    );
}


/*
    Send message.
*/

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


    /*
        Message P2P channel par send.
    */

    connection.send(text);


    /*
        Own screen par message.
    */

    addMessage(
        text,
        true
    );


    input.value = "";

    input.focus();
}


send.onclick =
    sendMessage;


/*
    Enter = Send.
*/

input.addEventListener(
    "keydown",
    function(event) {

        if (event.key === "Enter") {

            sendMessage();
        }
    }
);


/*
    Message display.
*/

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


/*
    Copy exact room URL.
*/

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

