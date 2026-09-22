
const status = document.getElementById("status");
const messages = document.getElementById("messages");
const input = document.getElementById("message");
const send = document.getElementById("send");
const copyLink = document.getElementById("copyLink");

const params = new URLSearchParams(window.location.search);

let roomId = params.get("room");

if (!roomId) {
    roomId = Math.random().toString(36).substring(2, 10);
    history.replaceState(null, "", "?room=" + roomId);
}

const ownerId = "private-chat-" + roomId;

let peer;
let connection = null;


// Host banva try kare
peer = new Peer(ownerId);


// Host ready
peer.on("open", function() {
    status.innerText = "Waiting for friend...";
});


// Koi friend connect thay
peer.on("connection", function(conn) {

    // Ek friend already connected hoy
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


// Room already occupied hoy
peer.on("error", function(error) {

    if (error.type === "unavailable-id") {

        peer.destroy();

        peer = new Peer();

        peer.on("open", function() {

            status.innerText = "Connecting...";

            connection = peer.connect(ownerId);

            setupConnection();
        });
    }
});


// Connection setup
function setupConnection() {

    if (!connection) return;


    connection.on("open", function() {

        status.innerText = "● Online";
        status.classList.add("online");
    });


    connection.on("data", function(data) {

        if (data === "CHAT_FULL") {

            alert("This chat is already full.");

            status.innerText = "Chat Full";
            status.classList.remove("online");

            connection.close();

            return;
        }

        addMessage(data, false);
    });


    connection.on("close", function() {

        status.innerText = "Friend disconnected";
        status.classList.remove("online");

        connection = null;
    });
}


// Message send
function sendMessage() {

    const text = input.value.trim();

    if (text === "") return;


    if (!connection || !connection.open) {

        alert("Friend is not connected yet.");

        return;
    }


    connection.send(text);

    addMessage(text, true);

    input.value = "";

    input.focus();
}


// Send button
send.onclick = sendMessage;


// Enter thi message send
input.addEventListener("keydown", function(event) {

    if (event.key === "Enter") {
        sendMessage();
    }
});


// Message screen par show
function addMessage(text, mine) {

    const div = document.createElement("div");

    div.className = mine
        ? "message mine"
        : "message friend";

    div.innerText = text;

    messages.appendChild(div);

    messages.scrollTop = messages.scrollHeight;
}


// Chat link copy
copyLink.onclick = async function() {

    try {

        await navigator.clipboard.writeText(window.location.href);

        copyLink.innerText = "✓ Link Copied";

        setTimeout(function() {

            copyLink.innerText = "🔗 Copy Chat Link";

        }, 1500);

    } catch(error) {

        prompt("Copy this link:", window.location.href);
    }
};

