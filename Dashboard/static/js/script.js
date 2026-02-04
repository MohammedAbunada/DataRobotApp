const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const chat = document.querySelector('.chat');
const chatContainer = document.getElementById('chat_container');
const typingIndicator = document.getElementById('typing_indicator');
const sendButton = document.getElementById('search_button');
let chartCounter = 0;

function renderMessage(content, isUser) {
    const className = isUser ? "user-message" : "reply-message";
    const wrapper = document.createElement("div");
    wrapper.className = "ChatContainer";

    if (isUser) {
        wrapper.style.flexDirection = "row-reverse";
        wrapper.innerHTML = `
            <div class="chat-message ${className}">
                ${content}
                <div class="TimeText Right">${getCurrentTime()}</div>
            </div>
        `;
    } else {
        wrapper.innerHTML = `
            <div class="RobotIcon"><img src="/static/img/brain_icon.png"></div>
            <div class="chat-message ${className}">
                ${content}
                <div class="TimeText">${getCurrentTime()}</div>
            </div>
        `;
    }

    chat.appendChild(wrapper);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function renderChartMessage(chartSpec) {
    const wrapper = document.createElement("div");
    wrapper.className = "ChatContainer";
    wrapper.innerHTML = `
        <div class="RobotIcon"><img src="/static/img/brain_icon.png"></div>
        <div class="chat-message reply-message">
            <div id="plotly_chart_${chartCounter}" style="width: 800px; max-width: 100%; height: 500px;"></div>
            <div class="TimeText">${getCurrentTime()}</div>
        </div>
    `;

    chat.appendChild(wrapper);
    const chartId = `plotly_chart_${chartCounter}`;
    chartCounter += 1;
    const layout = { autosize: true, ...(chartSpec.layout || {}) };
    Plotly.newPlot(chartId, chartSpec.data, layout);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function tryParseChartMessage(message) {
    if (typeof message !== "string") {
        return null;
    }
    const trimmed = message.trim();
    if (!trimmed.startsWith("{") || !trimmed.endsWith("}")) {
        return null;
    }
    try {
        const parsed = JSON.parse(trimmed);
        if (parsed && Array.isArray(parsed.data)) {
            return parsed;
        }
    } catch (err) {
        return null;
    }
    return null;
}

function setSending(isSending) {
    chatInput.disabled = isSending;
    sendButton.disabled = isSending;
    if (typingIndicator) {
        typingIndicator.style.display = isSending ? "flex" : "none";
    }
}

chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = chatInput.value.trim();
    if (!message) {
        return;
    }

    chatInput.value = "";
    renderMessage(message, true);
    setSending(true);

    fetch('/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
    })
        .then((response) => response.json())
        .then((data) => {
            const reply = data.message || "Thanks! Chat is connected.";
            const chartSpec = tryParseChartMessage(reply);
            if (chartSpec) {
                renderChartMessage(chartSpec);
            } else {
                renderMessage(reply, false);
            }
        })
        .catch(() => {
            renderMessage("Something went wrong. Please try again.", false);
        })
        .finally(() => {
            setSending(false);
        });
});

function showWelcomeMessage() {
    setSending(true);
    const delayMs = 1200 + Math.floor(Math.random() * 1800);
    setTimeout(() => {
        renderMessage("Hi — I’m your sales analytics agent. I can answer questions about your company policies, look up current weather for a city, and help you analyze your sales data by generating SQL, running it on the database, explaining the results in plain English, and (when requested) returning a chart spec you can use to plot the results.", false);
        setSending(false);
    }, delayMs);
}

document.addEventListener("DOMContentLoaded", () => {
    showWelcomeMessage();
});

function getCurrentTime() {
    const now = new Date();
    let hour = now.getHours();
    let minute = now.getMinutes();
    let period = "AM";

    if (hour >= 12) {
        period = "PM";
        if (hour > 12) {
            hour -= 12;
        }
    }

    hour = hour < 10 ? "0" + hour : hour;
    minute = minute < 10 ? "0" + minute : minute;

    return hour + ":" + minute + " " + period;
}