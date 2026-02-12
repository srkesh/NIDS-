// ===== Load protocol counts =====
async function loadProtocols() {
    try {
        const res = await fetch("/api/protocols");
        const data = await res.json();

        const container = document.getElementById("protocols");
        container.innerHTML = "";

        if (Object.keys(data).length === 0) {
            container.innerHTML = "<p>No packets captured yet</p>";
            return;
        }

        for (const proto in data) {
            let name = proto;
            if (proto === "6") name = "TCP";
            if (proto === "17") name = "UDP";
            if (proto === "1") name = "ICMP";

            const div = document.createElement("div");
            div.className = "card";
            div.innerHTML = `<b>${name}</b>: ${data[proto]}`;
            container.appendChild(div);
        }
    } catch (e) {
        console.error("Protocol error:", e);
    }
}

// ===== Load alert table =====
async function loadAlerts() {
    try {
        const res = await fetch("/api/recent_packets");
        const data = await res.json();

        const body = document.getElementById("alerts-body");
        body.innerHTML = "";

        if (data.length === 0) {
            body.innerHTML = "<tr><td colspan='5'>No packets yet</td></tr>";
            return;
        }

        data.forEach(p => {
            let proto = p.protocol;
            if (proto === 6 || proto === "6") proto = "TCP";
            if (proto === 17 || proto === "17") proto = "UDP";
            if (proto === 1 || proto === "1") proto = "ICMP";

            let color = "#16a34a"; // Low
            if (p.severity === "Medium") color = "#f59e0b";
            if (p.severity === "High") color = "#dc2626";

            body.innerHTML += `
                <tr>
                    <td>${p.time}</td>
                    <td>${p.src_ip} → ${p.dst_ip}</td>
                    <td>${proto}</td>
                    <td>${p.label || "Normal"}</td>
                    <td style="color:${color}; font-weight:bold;">
                        ${p.severity || "Low"}
                    </td>
                </tr>
            `;
        });
    } catch (e) {
        console.error("Alert table error:", e);
    }
}
let protocolChart = null;

async function loadProtocolChart() {
    try {
        const res = await fetch("/api/protocols");
        const data = await res.json();

        const labels = [];
        const values = [];

        for (const proto in data) {
            let name = proto;
            if (proto === "6") name = "TCP";
            if (proto === "17") name = "UDP";
            if (proto === "1") name = "ICMP";

            labels.push(name);
            values.push(data[proto]);
        }

        const ctx = document.getElementById("protocolChart").getContext("2d");

        if (protocolChart) {
            protocolChart.data.labels = labels;
            protocolChart.data.datasets[0].data = values;
            protocolChart.update();
        } else {
            protocolChart = new Chart(ctx, {
                type: "bar",
                data: {
                    labels: labels,
                    datasets: [{
                        label: "Packet Count",
                        data: values,
                        backgroundColor: ["#38bdf8", "#22c55e", "#facc15"]
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { display: false }
                    }
                }
            });
        }

    } catch (e) {
        console.error("Chart error:", e);
    }
}

// ===== Auto refresh (ONLY ONCE) =====
setInterval(() => {
    loadProtocols();
    loadAlerts();
    loadProtocolChart();
}, 2000);

// Initial load
loadProtocols();
loadAlerts();
loadProtocolChart();

