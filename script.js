(function () {
    // API endpoints
    let videoUrl = 'https://lab.flipperzero.one:8080/live?port=1985&app=myapp&stream=randomname';
    let sseUrl = localStorage.getItem('sseUrl');
    let apiUrl = localStorage.getItem('apiUrl');
    let token = localStorage.getItem('token');
    let username = localStorage.getItem('username');
    let password = localStorage.getItem('password');

    // Fullscreen
    const fullscreenToggles = document.querySelectorAll('.fullscreen-toggle');

    fullscreenToggles.forEach(fullscreenToggle => {
        fullscreenToggle.addEventListener('click', function() {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                }
            }
        });
    });

    document.addEventListener('fullscreenchange', (event) => {
        const className = 'fullscreen-toggle--active';
        if (document.fullscreenElement) {
            fullscreenToggle.classList.add(className);
        } else {
            fullscreenToggle.classList.remove(className);
        }
    });


    // Checks
    const filterCheckboxes = document.querySelectorAll('.filter-checkbox');

    filterCheckboxes.forEach(filterCheckbox => {
        filterCheckbox.addEventListener('change', function() {
            log.scrollTop = log.scrollHeight;
        });
    });


    // Uplooad
    const uploadButtons = document.querySelectorAll('#open-file, #upload-firmware');

    uploadButtons.forEach(uploadButton => {
        uploadButton.addEventListener('click', function() {
            alert('Select file');
        });
    });


    // Reset
    const uploadButton = document.querySelector('#reset-device');

    uploadButton.addEventListener('click', function() {
        sendCommand('btn', {
            btn: 'reset',
            state: 'click'
        });
    });



    // Commands
    const sendCommand = async function(action, data) {
        const formData = new FormData();
        formData.append('act', action);
        formData.append('auth', token);
        formData.append('data', JSON.stringify(data));

        const headers = new Headers();
        // headers.append('Authorization', 'Basic ' + btoa(username + ":" + password));

        const request = new Request(apiUrl, {
            method: 'POST', 
            headers: headers,
            body: formData
        });

        const response = await fetch(request);
        // console.log(response);
        
        return response;
    }



    // Server Events
    const evtSource = new EventSource(sseUrl);

    evtSource.onmessage = function(event) {
        // console.log(event.data);
        if (!event.data) return;
        insertLogItem(JSON.parse(event.data));
    }

    evtSource.onerror = function(event) {
        console.error(event);
    }


    // Log
    const log = document.querySelector('#log');
    const insertLogItem = function(data) {
        const message = document.createElement('div');
        message.classList.add('message', `message--${data.type}`);
        message.innerText = JSON.stringify(data.data);
        log.append(message);
        log.scrollTop = log.scrollHeight;
    }


    // Display
    const reset = function() {
        if (typeof player !== "undefined") {
            if (player != null) {
                player.unload();
                player.detachMediaElement();
                player.destroy();
                player = null;
            }
        }

        player = flvjs.createPlayer({
            type: 'flv',
            url: videoUrl,
        }, {
            enableWorker: false,
            lazyLoadMaxDuration: 3 * 60,
            seekType: 'range',
        });

        player.attachMediaElement(document.querySelector('.flipper__screen__lcd'));
        player.load();
        player.play();
    }

    reset();
    document.addEventListener('visibilitychange', reset);


    // LED
    // const ledEl = document.querySelector('#flipper-led');
    // let ledTimeout;

    // const blinkLed = function() {
    //     ledEl.classList.remove('light-green');
    //     ledEl.classList.add('light-red');
    //     clearTimeout(ledTimeout);
    //     ledTimeout = setTimeout(() => {
    //         ledEl.classList.remove('light-red');
    //         ledEl.classList.add('light-green');
    //     }, 100);
    // }


    // Buttons
    const pushState = function(target) {
        target.classList.add('pushed');
    }

    const tiltState = function(target, side) {
        target.classList.add('tilt-' + side);
    }

    const cleanState = function(target) {
        target.classList.remove('pushed', 'tilt-up', 'tilt-down', 'tilt-left', 'tilt-right');
    }


    const pushButtons = {};

    ['back', 'ok'].forEach(action => {
        pushButtons[action] = document.querySelector(`#flipper__interface__${action}`);

        pushButtons[action].addEventListener('click', function() {
            // blinkLed();
            // console.log(`Pushed ${action}!`);
            sendCommand('btn', {
                btn: action,
                state: 'click'
            })
        });

        ['mousedown', 'touchstart'].forEach(event => {
            pushButtons[action].addEventListener(event, () => {
                pushState(pushButtons[action]);
            });
        });

        ['mouseup', 'mouseout', 'touchend'].forEach(event => {
            pushButtons[action].addEventListener(event, () => {
                cleanState(pushButtons[action]);
            });
        })
    });


    const discNavigator = document.querySelector('#flipper__interface__disc');
    const discNavigatorButtons = {};

    ['up', 'right', 'down', 'left'].forEach(side => {
        discNavigatorButtons[side] = document.querySelector(`#flipper__interface__disc__${side}`);

        discNavigatorButtons[side].addEventListener('click', function() {
            // blinkLed();
            // console.log(`Move ${side}!`);

            sendCommand('btn', {
                btn: side,
                state: 'click'
            })
        });

        ['mousedown', 'touchstart'].forEach(event => {
            discNavigatorButtons[side].addEventListener(event, () => {
                tiltState(discNavigator, side);
            });
        });

        ['mouseup', 'mouseout', 'touchend'].forEach(event => {
            discNavigatorButtons[side].addEventListener(event, () => {
                cleanState(discNavigator);
            });
        })

    });
})();