
(function() {

    const lat = document.querySelector('#lat')?.value || 20.67444163271174;
    const lng = document.querySelector('#lng')?.value || -103.38739216304566;
    const map = L.map('init-map').setView([lat, lng ], 7);

    let markers = new L.FeatureGroup().addTo(map);

    let properties = [];

    // Filters
    const filters = {
        category: '',
        price: ''
    };

    const categoriesSelect = document.querySelector('#categories');
    const pricesSelect = document.querySelector('#prices');

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Category and price filtering
    categoriesSelect.addEventListener('change', e => {
        filters.category = +e.target.value;
        filterProperties();
    });
    pricesSelect.addEventListener('change', e => {
        filters.price = +e.target.value;
        filterProperties();
    });


    const getProperties = async () => {
        try {
            const url = '/api/properties';
            const response = await fetch(url);
            properties = await response.json();

            showProperties(properties);

        } catch (error) {
            console.log(error);
        }
    };

    const showProperties = properties => {

        // Clear previous markers
        markers.clearLayers();
        
        properties.forEach(property => {
            // Add pins
            const marker = new L.marker([property?.lat, property?.lng], {
                    autoPan: true
                })
                .addTo(map)
                .bindPopup(`
                    <p class="text-indigo-600 font-bold">${property?.category.name}</p>
                    <h1 class="text-xl font-extrabold uppercase my-5">${property?.title}</h1>
                    <img src="/uploads/${property?.image}" alt="property image">
                    <p class="text-gray-600 font-bold">${property?.price.name}</p>
                    <a href="/property/${property.id}" class="bg-indigo-600 block p-2 text-center font-bold uppercase text-white">View Property</a>
                `)

                markers.addLayer(marker);
            ;
        });
    };

    const filterProperties = () => {
        const result = properties.filter( filterCategory ).filter( filterPrice );
        showProperties(result);
    };

    const filterCategory = property => filters.category ? property.categoryId === filters.category : property;
    const filterPrice = property => filters.price ? property.priceId === filters.price : property;

    getProperties();

})();