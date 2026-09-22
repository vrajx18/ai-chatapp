
const status = document.getElementById("status");
const messages = document.getElementById("messages");
const input = document.getElementById("message");
const send = document.getElementById("send");
const copyLink = document.getElementById("copyLink");

const params = new URLSearchParams(window.location.search);

let hostId = params.get("host");

let peer;
let connection = null;
let isHost = false;


// --------------------------------------------------
// JO LINK MA HOST ID NATHI
// TO AA FIRST PERSON CHE
// --------------------------------------------------

if (!hostId) {

    // random peer banavo
    peer = new Peer();

    peer.on("open", function(id) {

        isHost = true;

        hostId = id;

        // URL ma host id add karo
        history.replaceState(
            null,
            "",
            "?host=" + hostId
        );

        status.innerText = "Waiting for friend...";
    });


    // Friend connect thay
    peer.on("connection", function(conn) {

        // already friend connected hoy
        if (connection && connection.open) {

            conn.on("open", function() {

                conn.send("CHAT_FULL");

                setTimeout(function() {

                    conn.close();

                }, 300);
            });

            return;
        }


        connection = conn;

        setupConnection();
    });
}


// --------------------------------------------------
// JO LINK MA HOST ID CHE
// TO AA SECOND PERSON CHE
// --------------------------------------------------

else {

    // random peer banavo
    peer = new Peer();


    peer.on("open", function() {

        status.innerText = "Connecting...";

        // direct host sathe connect
        connection = peer.connect(hostId);

        setupConnection();
    });


    peer.on("error", function(error) {

        status.innerText = "Connection failed";

        console.log(error);
    });
}


// --------------------------------------------------
// CONNECTION SETUP
// --------------------------------------------------

function setupConnection() {

    if (!connection) return;


    // connection open
    connection.on("open", function() {

        status.innerText = "● Online";

        status.classList.add("online");
    });


    // message receive
    connection.on("data", function(data) {

        // Chat full
        if (data === "CHAT_FULL") {

            alert("This chat is already full.");

            status.innerText = "Chat Full";

            status.classList.remove("online");

            connection.close();

            return;
        }


        // normal message
        addMessage(data, false);
    });


    // connection close
    connection.on("close", function() {

        status.innerText = "Friend disconnected";

        status.classList.remove("online");

        connection = null;
    });


    // connection error
    connection.on("error", function(error) {

        console.log(error);

        status.innerText = "Connection error";
    });
}


// --------------------------------------------------
// SEND MESSAGE
// --------------------------------------------------

function sendMessage() {

    const text = input.value.trim();


    if (text === "") return;


    if (!connection || !connection.open) {

        alert("Friend is not connected yet.");

        return;
    }


    // friend ne message moklo
    connection.send(text);


    // own message show
    addMessage(text, true);


    // input clear
    input.value = "";

    input.focus();
}


// Send button
send.onclick = sendMessage;


// Enter press
input.addEventListener("keydown", function(event) {

    if (event.key === "Enter") {

        sendMessage();
    }
});


// --------------------------------------------------
// MESSAGE SHOW
// --------------------------------------------------

function addMessage(text, mine) {

    const div = document.createElement("div");


    if (mine) {

        div.className = "message mine";

    } else {

        div.className = "message friend";
    }


    div.innerText = text;


    messages.appendChild(div);

    messages.scrollTop = messages.scrollHeight;
}


// --------------------------------------------------
// COPY CHAT LINK
// --------------------------------------------------

copyLink.onclick = async function() {

    // host id ready nathi
    if (!hostId) {

        alert("Please wait, chat is starting...");

        return;
    }


    const chatLink =
        window.location.origin +
        window.location.pathname +
        "?host=" +
        hostId;


    try {

        await navigator.clipboard.writeText(chatLink);

        copyLink.innerText = "✓ Link Copied";


        setTimeout(function() {

            copyLink.innerText = "🔗 Copy Chat Link";

        }, 1500);

    } catch(error) {

        prompt("Copy this link:", chatLink);
    }
};
