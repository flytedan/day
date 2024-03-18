(function() {
    var countdownIntervalId;
    var attemptCounter = 0;
    var countdown = 20; // Initial countdown value, will be set dynamically

    var data = {
        materia: '0c07d3aed729cd825a3103b202560463b956972f',
        comision: '17d067f32d4c0ad799452b76a81d5ef101150556',
        __csrf: ''
    };

    // Create the status box
    var statusBox = document.createElement('div');
    statusBox.style.position = 'fixed';
    statusBox.style.bottom = '10px';
    statusBox.style.left = '10px';
    statusBox.style.padding = '10px';
    statusBox.style.borderRadius = '5px';
    statusBox.style.backgroundColor = 'green'; // Default background color
    statusBox.style.color = 'white';
    statusBox.style.zIndex = '10000'; // Ensure it's above most elements
    statusBox.style.fontFamily = 'Arial, sans-serif';
    statusBox.style.fontSize = '14px';
    statusBox.innerText = 'Attempts: 0 | Next attempt in: 20s';
    document.body.appendChild(statusBox);

    function updateStatusBox(error = false, countdown = 20) {
        statusBox.style.backgroundColor = error ? 'red' : 'green';
        statusBox.innerText = `Attempts: ${attemptCounter} | Next attempt in: ${countdown}s`;
    }

    function startCountdown(duration) {
        countdown = duration;
        clearInterval(countdownIntervalId); // Clear previous countdown
        countdownIntervalId = setInterval(function() {
            countdown -= 1;
            updateStatusBox(false, countdown);
            if (countdown <= 0) {
                clearInterval(countdownIntervalId);
            }
        }, 1000);
    }

    function fetchCsrfTokenAndUpdateData() {
        var comisionInput = document.querySelector('input[name="comision"][value="' + data.comision + '"]');
        if (comisionInput) {
            var csrfInput = comisionInput.closest('form').querySelector('input[name="__csrf"]');
            if (csrfInput) {
                data.__csrf = csrfInput.value;
                console.log('CSRF token found:', data.__csrf);
                sendPostRequest();
            } else {
                alert('Error: CSRF input not found. Please check the page and try again.');
                updateStatusBox(true);
            }
        } else {
            alert('Error: Comision input not found. Please check the page and ensure you are on the correct form.');
            updateStatusBox(true);
        }
    }

    function sendPostRequest() {
        var formData = new FormData();
        formData.append('materia', data.materia);
        formData.append('comision', data.comision);
        formData.append('__csrf', data.__csrf);

        fetch('https://autogestion.guarani.unc.edu.ar/cursada/inscribir', {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json, text/javascript, */*; q=0.01',
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
            .then(response => response.json())
            .then(json => {
                console.log('Response received:', json);
                attemptCounter++;
                updateStatusBox();

                if (json.cod >= 0) {
                    console.log('Success or non-negative cod received, stopping.');
                    alert('Exitoso! Ya estas inscripto en la comision.');
                } else {
                    data.__csrf = json.csrf_token;
                    console.log('Updated CSRF token:', data.__csrf);

                    var delay =  Math.floor(Math.random() * 40000) + 20000;
                    startCountdown(Math.floor(delay / 1000));
                    setTimeout(sendPostRequest, delay);
                }
            })
            .catch(err => {
                console.error('Error:', err);
                alert('An error occurred while trying to send the request. Please check the console for more details.');
                updateStatusBox(true);
            });
    }

    fetchCsrfTokenAndUpdateData();
})();
