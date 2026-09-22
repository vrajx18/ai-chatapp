
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

    Friend aa ID sathe connect thase.
*/

const ownerId =
    "private-chat-" + roomId;


/*
    Peer create.

    Host first open kare tyare owner ID male.
*/

let peer;

let connection = null;

let isHost = false;


/*
    Pela owner ID thi Peer banavvano try.

    Jo ID available hoy → host.

    Jo unavailable hoy → friend.
*/

peer =
    new Peer(ownerId);


/*
    Peer successfully open thay
*/

peer.on("open", function(id) {

    isHost = true;

    status.innerText =
        "Waiting for friend...";

});


/*
    Host ne friend connection male.
*/

peer.on("connection", function(conn) {

    connection = conn;

    setupConnection();

});


/*
    Jo owner ID already used hoy,
    to aa second device chhe.

    Navo random Peer banavo
    ane owner sathe connect karo.
*/

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


/*
    Connection setup
*/

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


    /*
        Friend message receive
    */

    connection.on(
        "data",
        function(data) {

            addMessage(
                data,
                false
            );

        }
    );


    connection.on(
        "close",
        function() {

            status.innerText =
                "Friend disconnected";

            status.classList.remove(
                "online"
            );

        }
    );

}


/*
    Send message
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
        Message direct P2P channel par.
    */

    connection.send(text);


    /*
        Own screen par.
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
    Enter = Send
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
    Message display
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


    /*
        innerText use karyu,
        etle HTML execute nahi thay.
    */

    div.innerText =
        text;


    messages.appendChild(div);


    messages.scrollTop =
        messages.scrollHeight;

}


/*
    Copy exact room URL
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
