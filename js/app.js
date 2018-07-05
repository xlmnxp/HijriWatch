(function() {
    var timerUpdateDate = 0;
    var tizen = (tizen == undefined) ? {
		time:{
			getCurrentDateTime: function(){
				return new Date();
			},
			setTimezoneChangeListener: function(cb){
				
			}
		}
	}: tizen;
    
	moment.locale('ar-SA');

	/**
     * Rotates elements with a specific class name
     * @private
     * @param {number} angle - angle of rotation
     * @param {string} className - class name of the elements to be rotated
     */
    function rotateElements(angle, className) {
        var elements = document.querySelectorAll("." + className),
            i;

        for (i = 0; i < elements.length; i++) {
            elements[i].style.transform = "rotate(" + angle + "deg)";
        }
    }

    /**
     * Updates the date and sets refresh callback on the next day
     * @param {number} prevDate - date of the previous day
     */
    function updateDate(prevDate) {
        var datetime = tizen.time.getCurrentDateTime(),
            date = datetime.getDate(),
            nextInterval;

        // Check the update condition
        // If prevDate is '0', it will always update the date
        if (prevDate === date) {
            /*
             * If the date was not changed (meaning that something went wrong),
             * call updateDate again after a second
             */
            nextInterval = 1000;
        } else {
            /*
             * If the date was changed,
             * call updateDate at the beginning of the next day
             */
            // Calculate how much time is left until the next day
            nextInterval = (23 - datetime.getHours()) * 60 * 60 * 1000 +
                (59 - datetime.getMinutes()) * 60 * 1000 +
                (59 - datetime.getSeconds()) * 1000 +
                (1000 - datetime.getMilliseconds()) + 1;
        }

        // Update the text for date
        document.querySelector("#date-text").innerHTML = moment().format('iDD');

        // If an updateDate timer already exists, clear the previous timer
        if (timerUpdateDate) {
            clearTimeout(timerUpdateDate);
        }
        document.querySelector("#hijriDate").innerHTML = moment().format('iD / iMMMM (iM) / iYYYY') + ' ھ';
        document.querySelector("#gregorianDate").innerHTML = moment().format('D / MMMM (M) / YYYY') + ' م';
        document.querySelector("#dayDate").innerHTML = moment().format('dddd');
        // Set next timeout for date update
        timerUpdateDate = setTimeout(function() {
            updateDate(date);
        }, nextInterval);
    }

    /**
     * Updates the hour/minute/second hands according to the current time
     * @private
     */
    function updateTime() {
        var datetime = tizen.time.getCurrentDateTime(),
            hour = datetime.getHours(),
            minute = datetime.getMinutes(),
            second = datetime.getSeconds();

        // Update the hour/minute/second hands
        rotateElements((hour + (minute / 60) + (second / 3600)) * 30, "hands-hr");
        rotateElements((minute + second / 60) * 6, "hands-min");
        rotateElements(second * 6, "hands-sec");
    }

    /**
     * Initiates the application
     * @private
     */
    function init() {
        // Update the date when the app is initiated
        updateDate(0);

        // Update the watch hands every second
        setInterval(function() {
            updateTime();
        }, 1000);

        // Add eventListener to update the screen immediately when the device wakes up
        document.addEventListener("visibilitychange", function() {
            if (!document.hidden) {
                updateTime();
                updateDate(0);
            }
        });

        // Add eventListener to update the screen when the time zone is changed
        tizen.time.setTimezoneChangeListener(function() {
            updateTime();
            updateDate(0);
        });
    }

    window.onload = init();
}());