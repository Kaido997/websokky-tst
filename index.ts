const uniqueID = "super-unique-id";

function renderMessage(message: string, type: 'local' | 'remote') {
    const classType = type === 'local' ? 'class="localMessage"' : 'class="remoteMessage"'
    return `
        <div id="messages", hx-swap-oob="afterbegin">
        <p ${classType}>${message}</p>
        </div>` 
}

const server = Bun.serve({
    port: 3000,
    fetch(req, server) {
        console.log(req.method, req.url);
        try {
            const url = new URL(req.url);
            if (url.pathname === "/") {
                return new Response(Bun.file("./index.html"))
            } else if (url.pathname === "/chat") {
                if (server.upgrade(req)) {
                    return;
                }
            
            } else {
                return new Response("Upgrade failed", {status: 500});
            }
        } catch (error) {
                console.error("Error in fetch handler", error);
                return new Response("Upgrade failed", {status: 500});
            }
    },
    websocket: {
        message(ws, message) {
            try {
                const parseMessage = typeof message === "string" ? JSON.parse(message) : message;

                if (!parseMessage || typeof parseMessage.message !== "string") {
                    throw new Error("Invalid message format");
                }
                ws.send(renderMessage(parseMessage.message == 'true' ? 'si': 'no', 'local'))
                if (parseMessage.message == "true") {
                    server.publish(uniqueID, renderMessage("Ottimo allora sarà molto piu semplice aiutari", 'remote'))
                } else {
                    server.publish(uniqueID, renderMessage("Non preoccuparti sarai guidato passo passo", "remote"))
                }
            } catch (err) {
                console.log(err);
            }
        },
        open(ws) {
            // init conversation
            ws.subscribe(uniqueID); // subscribe to a unique topic name so the connection ramain private
            server.publish(uniqueID, renderMessage('intro message 1', 'remote'));
            server.publish(uniqueID, renderMessage('intro message 2', 'remote'))
            server.publish(uniqueID, renderMessage('intro message 3', 'remote'))
        },
        close(ws, code, message) {
            handleClose(code, message)
        }
    }
})

const handleClose = (code: any, message: any) => {
    console.log("WEBSOCKET CLOSED", code, message);
}
console.log(`Listening on http://localhost:${server.port}`);
