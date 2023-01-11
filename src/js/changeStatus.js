(function() {

    const changeStatusButtons = document.querySelectorAll('.change-status');
    const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

    changeStatusButtons.forEach( btn => {
        btn.addEventListener('click', changeStatusProperty);
    });


    async function changeStatusProperty(e) {
        
        const { propertyId: id } = e.target.dataset;

        try {
            const url = `/properties/${id}`;
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'CSRF-Token': token
                }
            });
    
            const { result } = await response.json();

            if(result) {
                if(e.target.classList.contains('bg-yellow-100')) {
                    e.target.classList.add('bg-green-100', 'text-green-800');
                    e.target.classList.remove('bg-yellow-100', 'text-red-800');
                    e.target.textContent = 'Published';
                } else {
                    e.target.classList.add('bg-yellow-100', 'text-red-800');
                    e.target.classList.remove('bg-green-100', 'text-green-800');
                    e.target.textContent = 'Not Published';
                }
            }

        } catch (error) {
            console.log(error);
        }
    };

})();