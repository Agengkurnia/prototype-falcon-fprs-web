/*
 * Js for Slideon 1.0.0
 */

function Slideon() {
    this.load = function () {
        var elements = document.querySelectorAll('.slideon.slideon-auto');
        elements.forEach(function (element) {
            var wrapper = document.createElement('label')
            wrapper.className = element.classList

            var slider = document.createElement('span')
            slider.className = 'slideon-slider'

            element.after(wrapper)
            wrapper.appendChild(element)
            element.after(slider)

            element.addEventListener('click', () => {
                var checkboxes = document.querySelectorAll('.slideon-xs');
                checkboxes.forEach(function (otherCheckbox) {
                    if (otherCheckbox !== element) {
                        otherCheckbox.checked = false;
                    }
                });
                if (element.checked) {
                    console.log(element.id);
                    console.log(element.checked);
                    var dataObject = {
                        'TxtGUI_trUserLogin': txtGui,
                        'TxtUserID': TxtUserId,
                        'IntCabangID': IntCabangId,
                        'IntCabangPrimaryID': IntCabangId,
                        'CustomerConsentId': element.id
                    };
                    $.ajax({
                        url: urlApiGlobal + '/setting/customerconsent/updateisactivecustomerconsent',
                        type: "POST",
                        data: JSON.stringify(dataObject),
                        headers: {
                            "Authorization": "Bearer " + AccessToken
                        },
                        dataType: "json",
                        timeout: 15000,
                        contentType: "application/json",
                        success: function (res) {
                            var jsonString = JSON.stringify(res);
                            if (res.code == 200) {
                                
                            }
                            else {
                                
                            }
                        },
                        error: function (xhr, textStatus, errorThrown) {
                            
                        }
                    });
                }
            });
        });
    }
}
