document.addEventListener("DOMContentLoaded", () => {
    const inputPesos = document.getElementById("inputPesos");
    const selectMoneda = document.getElementById("selectMoneda");
    const btnConvertir = document.getElementById("btnBuscar");
    const resultado = document.getElementById("resultado");
    const grafico = document.getElementById("grafico");
    let chartInstance = null;

    btnConvertir.addEventListener("click", async () => {
        const monto = inputPesos.value;
        const moneda = selectMoneda.value;

        if (!monto || isNaN(monto) || monto <= 0) {
            resultado.innerText = "Por favor, ingrese un monto válido.";
            return;
        }

        try {
            const response = await fetch("https://mindicador.cl/api/");
            if (!response.ok) throw new Error("No se pudo obtener los datos");
            const data = await response.json();

            if (!data[moneda]) {
                resultado.innerText = "Moneda no disponible";
                return;
            }

            const tasaCambio = data[moneda].valor;
            const conversion = (monto / tasaCambio).toFixed(2);
            resultado.innerText = `Resultado: ${conversion} ${moneda.toUpperCase()}`;
            obtenerHistorial(moneda);
        } catch (error) {
            resultado.innerText = `Error al obtener datos: ${error.message}`;
        }
    });

    async function obtenerHistorial(moneda) {
        try {
            const response = await fetch(`https://mindicador.cl/api/${moneda}`);
            if (!response.ok) throw new Error("No se pudo obtener el historial");
            const data = await response.json();
            const valores = data.serie.slice(0, 10).reverse();

            const labels = valores.map((item) => new Date(item.fecha).toLocaleDateString());
            const valoresMoneda = valores.map((item) => item.valor);

            if (chartInstance) chartInstance.destroy();

            chartInstance = new Chart(grafico, {
                type: "line",
                data: {
                    labels,
                    datasets: [{
                        label: `Historial últimos 10 días (${moneda.toUpperCase()})`,
                        data: valoresMoneda,
                        borderColor: "blue",
                        borderWidth: 2
                    }]
                }
            });
        } catch (error) {
            resultado.innerText = `Error al obtener historial: ${error.message}`;
        }
    }
});
