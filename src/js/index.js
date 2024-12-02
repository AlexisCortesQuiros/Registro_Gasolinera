const apiBaseURL = "https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes";

document.addEventListener("DOMContentLoaded", () => {
  const provinceSelect = document.getElementById("province");
  const municipalitySelect = document.getElementById("municipality");
  const fuelSelect = document.getElementById("fuel");
  const openNowCheckbox = document.getElementById("openNow");
  const stationList = document.getElementById("stationList");
  const filterButton = document.getElementById("filterButton");

  async function fetchData(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      const data = await response.json();
      console.log("Data fetched from API:", data); 
      return data;
    } catch (error) {
      console.error("Error en la solicitud:", error.message);
      throw error;
    }
  }

  async function loadProvinces() {
    const provinces = await fetchData(`${apiBaseURL}/Listados/Provincias`);
    provinces.forEach(province => {
      const option = document.createElement("option");
      option.value = province.IDPovincia;
      option.textContent = province.Provincia;
      provinceSelect.appendChild(option);
    });
  }

  async function loadMunicipalities(provinceId) {
    if (!provinceId) return;

    municipalitySelect.innerHTML = '<option value="">Seleccione un municipio</option>';
    municipalitySelect.disabled = true;

    try {
      const municipalities = await fetchData(`${apiBaseURL}/Listados/MunicipiosPorProvincia/${provinceId}`);
      municipalities.forEach(municipality => {
        const option = document.createElement("option");
        option.value = municipality.IDMunicipio;
        option.textContent = municipality.Municipio;
        municipalitySelect.appendChild(option);
      });
      municipalitySelect.disabled = false;
    } catch (error) {
      console.error("Error loading municipalities:", error);
      municipalitySelect.innerHTML = '<option value="">Error al cargar municipios</option>';
    }
  }

  async function loadFuelTypes() {
    const fuels = [
      { value: "PrecioGasoleoA", text: "Gasóleo A" },
      { value: "PrecioGasolina95E5", text: "Gasolina 95 E5" },
      { value: "PrecioGasolina98E5", text: "Gasolina 98 E5" },
      { value: "PrecioGasoleoPremium", text: "Gasóleo Premium" }
    ];

    fuels.forEach(fuel => {
      const option = document.createElement("option");
      option.value = fuel.value;
      option.textContent = fuel.text;
      fuelSelect.appendChild(option);
    });
  }

  async function filterStations() {
    const provinceId = provinceSelect.value;
    const municipalityId = municipalitySelect.value;
    const fuelType = fuelSelect.value;
    const isOpen = openNowCheckbox.checked;

    if (!provinceId) {
      stationList.innerHTML = "<p>Por favor, selecciona una provincia.</p>";
      return;
    }

    try {
      const data = await fetchData(`${apiBaseURL}/EstacionesTerrestres/FiltroProvincia/${provinceId}`);
      const filteredStations = data.ListaEESSPrecio.filter(station => {
        return (
          (!municipalityId || station.IDMunicipio === municipalityId) &&
          (!fuelType || station[fuelType] !== "") &&
          (!isOpen || station.Horario.toLowerCase() === "abierto")
        );
      });

      displayStations(filteredStations, fuelType);
    } catch (error) {
      stationList.innerHTML = "<p>Error al cargar las gasolineras.</p>";
    }
  }

  function displayStations(stations, fuelType) {
    if (stations.length === 0) {
      stationList.innerHTML = "<p>No se encontraron gasolineras.</p>";
      return;
    }

    stationList.innerHTML = stations.map(station => {
      // Verifica si el precio existe en el campo adecuado, según el tipo de combustible seleccionado
      const fuelPrice = station[fuelType] || "N/D"; // Si no hay precio, muestra "N/D"

      // Depuración: muestra cómo es la respuesta de la API para los precios
      console.log(station); // Esto te ayudará a verificar si el campo del precio tiene el nombre correcto

      return `
        <div class="card mb-3">
          <div class="card-body">
            <h5>${station.Rótulo}</h5>
            <p>Dirección: ${station.Dirección}, ${station.Municipio}</p>
            <p>Precio ${fuelSelect.options[fuelSelect.selectedIndex].text}: ${fuelPrice} €</p>
            <p>Horario: ${station.Horario}</p>
          </div>
        </div>
      `;
    }).join("");
  }

  provinceSelect.addEventListener("change", () => loadMunicipalities(provinceSelect.value));
  filterButton.addEventListener("click", filterStations);

  loadProvinces();
  loadFuelTypes();
});





